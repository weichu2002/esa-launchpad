import React, { useState } from 'react';
import { ProjectState, PatchFile } from '../../types';
import { FileCode, Download, ArrowRight, FolderOpen, FileText, FilePlus, CheckCircle } from 'lucide-react';

interface Props {
  projectState: ProjectState;
  updateState: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// 实际上这是 "PatchWorkbench" 组件
const ConfigBuilder: React.FC<Props> = ({ projectState, onNext, onBack }) => {
  const [selectedFile, setSelectedFile] = useState<PatchFile | undefined>(
    projectState.patches.length > 0 ? projectState.patches[0] : undefined
  );

  // 模拟下载
  const handleDownload = () => {
    alert("已下载 patch-package.zip (模拟)");
  };

  // Safeguard: If no patches, show empty state instead of crashing
  if (!selectedFile || projectState.patches.length === 0) {
    return (
        <div className="w-full max-w-4xl mx-auto h-[650px] flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="bg-green-500/10 p-6 rounded-full mb-6 ring-1 ring-green-500/30">
                <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">无需补丁</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                您的仓库配置已完全符合 ESA 部署标准（esa.jsonc 已存在且配置正确）。无需进行任何文件修改。
            </p>
            <div className="flex space-x-4">
                <button 
                    onClick={onBack}
                    className="px-6 py-2 border border-white/20 hover:bg-white/5 text-gray-300 font-semibold rounded-lg transition-colors"
                >
                    上一步
                </button>
                <button 
                    onClick={onNext}
                    className="px-8 py-3 bg-esa-600 hover:bg-esa-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center"
                >
                    查看部署工单 <ArrowRight className="ml-2 w-4 h-4" />
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-[650px] flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">第二阶段：手术室 (补丁生成)</h2>
        <p className="text-gray-400">系统已为您自动生成所需的配置文件。请查看并将它们添加到您的仓库。</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧：文件树 */}
        <div className="w-1/4 glass-panel rounded-xl flex flex-col overflow-hidden border border-white/10">
          <div className="p-4 bg-esa-dark/50 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-gray-300 flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" /> 补丁文件
            </span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              {projectState.patches.length} 个文件
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {projectState.patches.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
                  selectedFile.path === file.path 
                    ? 'bg-esa-600 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                {file.type === 'new' ? <FilePlus className="w-4 h-4 mr-2 text-green-400" /> : <FileText className="w-4 h-4 mr-2 text-blue-400" />}
                <span className="truncate font-mono">{file.path}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/10">
            <button 
              onClick={handleDownload}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" /> 下载补丁包
            </button>
          </div>
        </div>

        {/* 右侧：代码预览 */}
        <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden border border-white/10 relative">
          <div className="p-3 bg-[#1e1e1e] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-esa-400" />
              <span className="text-sm text-gray-300 font-mono">{selectedFile.path}</span>
            </div>
            <div className="flex space-x-2">
                <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">
                    {selectedFile.description}
                </span>
                <button 
                    onClick={() => navigator.clipboard.writeText(selectedFile.content)}
                    className="text-xs bg-esa-600 hover:bg-esa-500 text-white px-3 py-1 rounded transition-colors"
                >
                    复制内容
                </button>
            </div>
          </div>
          
          <div className="flex-1 bg-[#1e1e1e] overflow-auto p-6">
            <pre className="font-mono text-sm text-blue-300 leading-relaxed whitespace-pre-wrap">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
        <div className="flex items-center text-blue-200 text-sm">
           <FilePlus className="w-5 h-5 mr-3" />
           <span>请确保上述文件已提交到您的 GitHub 仓库，然后进入下一步获取部署工单。</span>
        </div>
        <div className="flex space-x-4">
             <button 
                onClick={onBack}
                className="px-6 py-2 border border-white/20 hover:bg-white/5 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                上一步
              </button>
             <button 
                onClick={onNext}
                className="px-6 py-2 bg-esa-600 hover:bg-esa-500 text-white font-bold rounded-lg shadow-lg transition-colors flex items-center"
              >
                获取部署工单 <ArrowRight className="ml-2 w-4 h-4" />
              </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigBuilder;