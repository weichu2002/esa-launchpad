import { Diagnosis, PatchFile } from '../types';
import { GoogleGenAI } from "@google/genai";

const parseGithubUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch (e) { return null; }
  return null;
};

const ghFetch = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 403) throw new Error("GitHub API 速率限制已达上限，请稍后重试。");
    return res;
};

// 1. 获取 GitHub 真实数据
const fetchRepoContext = async (owner: string, repo: string) => {
  try {
    // A. 元数据
    const metaRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!metaRes.ok) throw new Error(`无法访问仓库: ${metaRes.statusText}`);
    const meta = await metaRes.json();
    const defaultBranch = meta.default_branch || 'main';

    console.log(`[LaunchPad] 仓库: ${owner}/${repo}, 分支: ${defaultBranch}`);

    // B. 文件列表 (Tree API)
    let allFilePaths: string[] = [];
    try {
        const treeRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
        if (treeRes.ok) {
            const treeData = await treeRes.json();
            allFilePaths = treeData.tree
                .filter((f: any) => f.type === 'blob')
                .map((f: any) => f.path);
        }
    } catch (e) {
        // Fallback to contents if tree fails
        const cRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents?ref=${defaultBranch}`);
        if (cRes.ok) allFilePaths = (await cRes.json()).map((c: any) => c.path);
    }

    // C. 关键文件检测
    // esa.jsonc
    const esaFile = allFilePaths.find(p => p.toLowerCase() === 'esa.jsonc' || p.toLowerCase() === 'esa.json');
    let hasEsaJsonc = !!esaFile;
    let existingEsaConfig = "";

    // Lock files for install cmd deduction
    const hasYarnLock = allFilePaths.includes('yarn.lock');
    const hasPnpmLock = allFilePaths.includes('pnpm-lock.yaml');
    
    // D. 读取内容
    if (hasEsaJsonc && esaFile) {
        const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${esaFile}?ref=${defaultBranch}`);
        if (res.ok) existingEsaConfig = atob((await res.json()).content.replace(/\n/g, ''));
    }

    let pkgContent = "";
    if (allFilePaths.includes('package.json')) {
        const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${defaultBranch}`);
        if (res.ok) pkgContent = atob((await res.json()).content.replace(/\n/g, ''));
    }

    const fileTreeStr = allFilePaths
      .filter(p => !p.includes('node_modules') && !p.includes('.git/'))
      .slice(0, 300)
      .join('\n');

    return { 
        fileTreeStr, pkgContent, hasEsaJsonc, existingEsaConfig, defaultBranch, repoName: repo,
        lockFiles: { hasYarnLock, hasPnpmLock }
    };

  } catch (error) {
    console.error("[LaunchPad] Fetch Error:", error);
    throw error;
  }
};

// 2. Gemini 分析
const analyzeWithGemini = async (repoUrl: string, context: any): Promise<Diagnosis> => {
  const systemPrompt = `
你是一个阿里云 ESA 部署专家。请根据提供的 GitHub 仓库信息提取部署配置。

【输入信息】
- 文件列表、package.json 内容、esa.jsonc 状态。
- Lock 文件状态：${JSON.stringify(context.lockFiles)}。

【推断逻辑】
1. **安装命令 (installCmd)**：
   - 有 pnpm-lock.yaml -> 'pnpm install'
   - 有 yarn.lock -> 'yarn'
   - 否则 -> 'npm install'
2. **构建命令 (buildCmd)**：读取 package.json 的 scripts.build。
3. **静态目录 (outputDir)**：Vite->'dist', NextJS->'.next' or 'out'。
4. **根目录 (rootDir)**：通常是 './'。如果是 Monorepo，寻找 package.json 所在目录。
5. **Node版本**：读取 package.json engines.node，默认 '20.x'。
6. **函数入口**：如果存在 esa.jsonc，尝试解析其 entry 字段。如果不存在，检查是否有 api 目录。

【输出 JSON】
{
  "framework": "string",
  "isSpa": boolean,
  "projectName": "${context.repoName}",
  "branch": "${context.defaultBranch}",
  "installCmd": "string",
  "buildCmd": "string",
  "outputDir": "string",
  "rootDir": "string",
  "nodejsVersion": "string",
  "hasApiRoutes": boolean,
  "functionPath": "string" | null,
  "requiredEnvVars": string[],
  "missingConfigs": {
    "esaJsonc": boolean
  }
}
`;

  const userPrompt = `
仓库: ${repoUrl}
[esa.jsonc]: ${context.hasEsaJsonc ? "已存在" : "缺失"}
[Existing Config]: ${context.existingEsaConfig || ""}
[package.json]: ${context.pkgContent || ""}
[Files]:
${context.fileTreeStr}

请生成 JSON 诊断报告。如果 esa.jsonc 已存在，missingConfigs.esaJsonc 必须为 false。
`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const content = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
    const diagnosis = JSON.parse(content);

    // 双重校验
    if (context.hasEsaJsonc) diagnosis.missingConfigs.esaJsonc = false;

    return diagnosis;
  } catch (error) {
    console.error("AI Analysis Failed", error);
    // Fallback
    const isPnpm = context.lockFiles.hasPnpmLock;
    const isYarn = context.lockFiles.hasYarnLock;
    return {
      framework: 'other',
      isSpa: false,
      projectName: context.repoName,
      branch: context.defaultBranch,
      installCmd: isPnpm ? 'pnpm install' : isYarn ? 'yarn' : 'npm install',
      buildCmd: 'npm run build',
      outputDir: 'dist',
      rootDir: './',
      nodejsVersion: '20.x',
      hasApiRoutes: false,
      requiredEnvVars: [],
      missingConfigs: { esaJsonc: !context.hasEsaJsonc, edgeFunctions: false }
    };
  }
};

export const diagnoseRepo = async (repoUrl: string): Promise<Diagnosis> => {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");
  const context = await fetchRepoContext(parsed.owner, parsed.repo);
  return analyzeWithGemini(repoUrl, context);
};

export const generatePatches = (diagnosis: Diagnosis): PatchFile[] => {
  const patches: PatchFile[] = [];

  if (diagnosis.missingConfigs.esaJsonc) {
    const esaConfig: any = {
      name: diagnosis.projectName,
      buildCommand: diagnosis.buildCmd,
      installCommand: diagnosis.installCmd,
      assets: { directory: `./${diagnosis.outputDir}` }
    };
    if (diagnosis.isSpa) esaConfig.assets.notFoundStrategy = "singlePageApplication";
    if (diagnosis.hasApiRoutes) esaConfig.entry = diagnosis.functionPath || "./edge-functions/api-proxy.js";

    patches.push({
      path: '/esa.jsonc',
      content: JSON.stringify(esaConfig, null, 2),
      type: 'new',
      description: 'ESA 核心配置文件'
    });
  }

  if (diagnosis.hasApiRoutes && !diagnosis.functionPath) {
    patches.push({
      path: '/edge-functions/api-proxy.js',
      content: `export default { async fetch(req) { return fetch(req); } };`,
      type: 'new',
      description: '边缘函数模板'
    });
  }

  return patches;
};