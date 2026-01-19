import React from 'react';
import { ProjectState } from '../../types';
import { ExternalLink, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  projectState: ProjectState;
}

const DeploymentGuide: React.FC<Props> = ({ projectState }) => {
  const { diagnosis } = projectState;
  if (!diagnosis) return null;

  // 如果存在 esa.jsonc，这几个字段由配置接管
  const isManaged = !diagnosis.missingConfigs.esaJsonc;

  const FieldRow = ({ label, value, managed = false, copy = false }: any) => (
    <div className="grid grid-cols-12 gap-4 py-3 border-b border-white/5 items-center">
      <div className="col-span-4 text-sm text-gray-400 font-medium">{label}</div>
      <div className="col-span-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`font-mono text-sm ${managed ? 'text-gray-500 italic line-through decoration-gray-600' : 'text-white'}`}>
            {value}
          </span>
          {managed && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded ml-2">
              esa.jsonc 托管
            </span>
          )}
        </div>
        {copy && !managed && (
          <button 
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-gray-500 hover:text-white transition-colors p-1"
            title="复制"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">部署填空题</h2>
        <p className="text-gray-400">请打开 ESA 控制台，对照下方表格填写。已为您自动检测最佳配置。</p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="bg-gradient-to-r from-esa-900 to-slate-900 p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center">
            <CheckCircle2 className="mr-2 text-green-400" />
            构建配置 (Build Settings)
          </h3>
          <a 
            href="https://esa.console.aliyun.com/" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors flex items-center"
          >
            前往控制台 <ExternalLink className="ml-1 w-3 h-3" />
          </a>
        </div>

        <div className="p-6">
          <FieldRow label="项目名称" value={diagnosis.projectName} copy />
          <FieldRow label="生产分支" value={diagnosis.branch} copy />
          <FieldRow label="非生产分支构建" value="关闭 (建议)" />
          
          <div className="my-4 border-t border-white/5"></div>
          
          <FieldRow label="安装命令" value={diagnosis.installCmd} managed={isManaged} copy />
          <FieldRow label="构建命令" value={diagnosis.buildCmd} managed={isManaged} copy />
          <FieldRow label="根目录" value={diagnosis.rootDir} copy />
          <FieldRow label="静态资源目录" value={diagnosis.outputDir} managed={isManaged} copy />
          
          <div className="my-4 border-t border-white/5"></div>

          <FieldRow label="函数文件路径" value={diagnosis.functionPath || (diagnosis.hasApiRoutes ? './edge-functions/api-proxy.js' : '留空')} copy />
          <FieldRow label="Node.js 版本" value={diagnosis.nodejsVersion} copy />
        </div>
        
        {isManaged && (
           <div className="bg-green-500/10 p-4 border-t border-green-500/20 text-sm text-green-300 flex items-center">
             <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
             <span>检测到仓库包含 <strong>esa.jsonc</strong>，控制台会自动读取标有“托管”的字段，您可以直接留空这些项。</span>
           </div>
        )}
      </div>

      {diagnosis.requiredEnvVars.length > 0 && (
        <div className="mt-6 glass-panel rounded-xl border border-red-500/20 p-6">
          <h4 className="text-red-400 font-bold mb-4 flex items-center">
            <AlertCircle className="mr-2 w-5 h-5" /> 环境变量 (Environment Variables)
          </h4>
          <div className="grid gap-2">
            {diagnosis.requiredEnvVars.map(env => (
              <div key={env} className="flex justify-between bg-black/20 p-3 rounded border border-white/5">
                <span className="font-mono text-white">{env}</span>
                <span className="text-gray-500 text-sm italic">请手动填写值</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentGuide;