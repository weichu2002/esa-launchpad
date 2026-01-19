import React, { useState } from 'react';
import { ProjectState } from '../../types';
import { diagnoseRepo, generatePatches } from '../../services/surgeon';
import { Github, Stethoscope, Loader2, AlertTriangle, FileText, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  projectState: ProjectState;
  updateState: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
}

const RepoAnalysis: React.FC<Props> = ({ projectState, updateState, onNext }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisComplete, setDiagnosisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!projectState.repoUrl) return;
    setIsAnalyzing(true);
    setError(null);
    setDiagnosisComplete(false);
    
    try {
      // 1. 诊断
      const diagnosis = await diagnoseRepo(projectState.repoUrl);
      
      // 2. 手术（生成补丁）
      const patches = generatePatches(diagnosis);
      
      updateState({ diagnosis, patches });
      setDiagnosisComplete(true);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "无法访问 GitHub 仓库，请检查 URL 是否正确，或确认仓库是否公开。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">第一阶段：全息扫描</h2>
        <p className="text-gray-400">LaunchPad 将通过 GitHub API 深度读取您的仓库结构，进行 AI 智能诊断。</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">GitHub 仓库地址 (Public)</label>
          <div className="relative">
            <Github className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="https://github.com/username/my-project"
              className="w-full bg-esa-dark border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-esa-500 focus:border-transparent outline-none transition-all"
              value={projectState.repoUrl}
              onChange={(e) => updateState({ repoUrl: e.target.value })}
            />
          </div>
          {error && (
            <div className="flex items-center text-red-400 text-sm mt-2">
              <XCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {!diagnosisComplete ? (
          <button 
            onClick={handleAnalyze}
            disabled={!projectState.repoUrl || isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-esa-600 hover:from-blue-500 hover:to-esa-500 text-white font-bold rounded-xl shadow-lg shadow-esa-500/25 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin mr-2" /> 正在链接 GitHub API...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 group-hover:scale-110 transition-transform" /> 开始诊断
              </>
            )}
          </button>
        ) : (
          <div className="space-y-6 animate-slide-up bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              {projectState.diagnosis?.missingConfigs.esaJsonc ? (
                 <AlertTriangle className="w-6 h-6 text-yellow-400" />
              ) : (
                 <CheckCircle className="w-6 h-6 text-green-400" />
              )}
              <h3 className="text-lg font-bold text-white">
                {projectState.diagnosis?.missingConfigs.esaJsonc 
                  ? "发现配置缺失" 
                  : "配置验证通过"}
              </h3>
            </div>
            
            <div className="grid gap-4 text-sm text-gray-300">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>识别框架</span>
                <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{projectState.diagnosis?.framework}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>esa.jsonc 状态</span>
                <span className={`font-bold ${!projectState.diagnosis?.missingConfigs.esaJsonc ? 'text-green-400' : 'text-red-400'}`}>
                  {!projectState.diagnosis?.missingConfigs.esaJsonc ? '✅ 已存在' : '❌ 缺失'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>构建命令</span>
                <span className="font-mono text-white">{projectState.diagnosis?.buildCmd}</span>
              </div>
            </div>

            <div className="pt-4">
               {projectState.patches.length > 0 ? (
                 <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6">
                   <div className="flex items-center space-x-3">
                     <FileText className="text-blue-400 w-5 h-5" />
                     <span className="text-blue-100">LaunchPad 生成了 <strong>{projectState.patches.length}</strong> 个优化建议文件</span>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-lg mb-6">
                    <span className="text-green-100">完美！您的仓库已经完全符合 ESA 部署标准。</span>
                 </div>
               )}

              <button 
                onClick={onNext}
                className="w-full py-3 bg-white text-esa-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center"
              >
                查看部署方案 <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoAnalysis;