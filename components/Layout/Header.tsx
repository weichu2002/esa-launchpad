import React from 'react';
import { Rocket, Box, Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-white/10 bg-esa-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-esa-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-esa-500/20">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ESA LaunchPad</h1>
            <p className="text-xs text-esa-500 font-mono">阿里云边缘部署平台</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Box size={18} />
            <span>架构设计</span>
          </a>
          <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Activity size={18} />
            <span>实时监控</span>
          </a>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all">
            文档
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;