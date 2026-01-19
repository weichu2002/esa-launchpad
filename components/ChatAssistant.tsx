import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToAI } from '../services/ai';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '你好！我是 ESA AI 助手。请问关于 esa.jsonc、KV 存储或部署报错的问题。', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponseContent = await sendMessageToAI([...messages, userMsg]);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: aiResponseContent, 
      timestamp: Date.now() 
    }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] glass-panel bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
          {/* Header */}
          <div className="p-4 bg-esa-600 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="text-white w-5 h-5" />
              <span className="font-bold text-white">ESA AI 助手</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/90">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-esa-600 text-white rounded-tr-none' 
                    : 'bg-gray-700 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2 flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="flex space-x-2">
              <input 
                type="text" 
                className="flex-1 bg-gray-900 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:border-esa-500 focus:ring-1 focus:ring-esa-500 outline-none"
                placeholder="询问关于部署的问题..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-esa-600 hover:bg-esa-500 text-white rounded-full transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-esa-600 to-purple-600 hover:scale-110 transition-transform rounded-full flex items-center justify-center shadow-lg shadow-esa-500/40"
      >
        <MessageSquare className="text-white w-7 h-7" />
      </button>
    </div>
  );
};

export default ChatAssistant;