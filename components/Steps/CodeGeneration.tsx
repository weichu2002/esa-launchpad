import React, { useEffect, useState } from 'react';
import { ProjectState } from '../../types';
import { sendMessageToAI } from '../../services/ai';
import { Bot, Copy, ArrowRight, Loader } from 'lucide-react';

interface Props {
  projectState: ProjectState;
  onNext: () => void;
  onBack: () => void;
}

const CodeGeneration: React.FC<Props> = ({ projectState, onNext, onBack }) => {
  const [code, setCode] = useState<string>("// 正在生成优化后的边缘函数代码...\n// 正在使用 Gemini AI...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateCode = async () => {
      // If no dynamic features selected, just show simple static fetch
      if (!projectState.useEdgeKV && !projectState.useCustomHeaders) {
        setCode(`// esa.jsonc 处理静态路由。
// 基础静态站点不需要额外的边缘函数逻辑！
// 如果您想添加逻辑，请在上一步启用相应功能。

export default {
  async fetch(request) {
    // 默认透传
    return fetch(request);
  }
};`);
        setLoading(false);
        return;
      }

      // Prompt for Gemini (Chinese instruction)
      const prompt = `
        请生成一个完整的适用于阿里云 ESA 边缘函数的 JavaScript ES module 文件 (index.js)。
        
        要求：
        ${projectState.useEdgeKV ? `- 包含 EdgeKV 的使用。命名空间："${projectState.kvNamespace}"。API：const kv = new EdgeKV({namespace: "..."}); kv.put(), kv.get()。` : ''}
        ${projectState.useCustomHeaders ? `- 添加自定义响应头：'X-Powered-By: ESA-LaunchPad'。` : ''}
        - 导出必须是：export default { async fetch(request) { ... } }
        - 优雅地处理错误。
        - 添加中文注释解释 ESA 特有的 API。
      `;

      const aiResponse = await sendMessageToAI([{ 
        role: 'user', 
        content: prompt,
        timestamp: Date.now()
      }]);
      
      // Clean up markdown code blocks if AI adds them
      const cleanCode = aiResponse.replace(/```javascript/g, '').replace(/```/g, '').trim();
      setCode(cleanCode);
      setLoading(false);
    };

    generateCode();
  }, [projectState]);

  return (
    <div className="w-full max-w-5xl mx-auto h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Bot className="mr-2 text-esa-400" /> 边缘函数生成器
          </h2>
          <p className="text-gray-400 text-sm">
            基于您的架构 AI 自动生成 <code>src/index.js</code>。
          </p>
        </div>
        <div className="flex space-x-3">
             <button 
                onClick={onBack}
                className="px-6 py-2 border border-white/20 hover:bg-white/5 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                上一步
              </button>
             <button 
                onClick={onNext}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg transition-colors flex items-center"
              >
                开始部署 <ArrowRight className="ml-2 w-4 h-4" />
              </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-white/10 flex flex-col relative">
        <div className="bg-[#1e1e1e] p-3 flex items-center justify-between border-b border-white/5">
          <span className="text-xs text-gray-500 font-mono">src/index.js</span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-gray-400 hover:text-white transition-colors"
            title="复制代码"
          >
            <Copy size={16} />
          </button>
        </div>
        <div className="flex-1 bg-[#1e1e1e] overflow-auto p-4 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]/80 z-10">
              <div className="flex flex-col items-center">
                <Loader className="animate-spin text-esa-500 mb-2" size={32} />
                <span className="text-esa-500 text-sm">Gemini 正在编写代码...</span>
              </div>
            </div>
          )}
          <pre className="font-mono text-sm text-blue-300 leading-relaxed">
            {code}
          </pre>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-200 text-sm">
          <strong>重要提示：</strong> 将此代码保存为仓库中的 <code>src/index.js</code>。
          并确保上一步生成的 <code>esa.jsonc</code> 中的 <code>entry</code> 指向此文件。
        </p>
      </div>
    </div>
  );
};

export default CodeGeneration;