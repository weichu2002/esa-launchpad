import React, { useState } from 'react';
import Header from './components/Layout/Header';
import RepoAnalysis from './components/Steps/RepoAnalysis';
import ConfigBuilder from './components/Steps/ConfigBuilder'; // Reused as PatchWorkbench
import DeploymentGuide from './components/Steps/DeploymentGuide'; // Reused as DeploymentTicket
import ChatAssistant from './components/ChatAssistant';
import { ProjectState } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [projectState, setProjectState] = useState<ProjectState>({
    repoUrl: '',
    diagnosis: null,
    patches: []
  });

  const updateState = (updates: Partial<ProjectState>) => {
    setProjectState(prev => ({ ...prev, ...updates }));
  };

  // Only 3 steps now
  const nextStep = () => {
    setStep(prev => {
      // If at step 1 and no patches needed, skip step 2 (ConfigBuilder)
      if (prev === 1 && projectState.patches.length === 0) {
        return 3;
      }
      return Math.min(prev + 1, 3);
    });
  };

  const prevStep = () => {
    setStep(prev => {
      // If at step 3 and no patches were needed, skip step 2 back to 1
      if (prev === 3 && projectState.patches.length === 0) {
        return 1;
      }
      return Math.max(prev - 1, 1);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-esa-500 selection:text-white bg-[url('https://picsum.photos/1920/1080?grayscale&blur=5')] bg-cover bg-fixed bg-center relative">
      <div className="absolute inset-0 bg-slate-900/90 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center max-w-3xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-10 rounded-full"></div>
              <div className={`absolute top-1/2 left-0 h-1 bg-esa-500 -z-10 rounded-full transition-all duration-500 ease-out`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
              
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${
                      step >= s 
                      ? 'bg-esa-500 border-slate-900 text-white shadow-lg shadow-esa-500/50 scale-110' 
                      : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step >= s ? 'text-esa-300' : 'text-gray-600'}`}>
                    {s === 1 ? '诊断' : s === 2 ? '补丁' : '工单'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="transition-all duration-500">
            {step === 1 && (
              <RepoAnalysis 
                projectState={projectState} 
                updateState={updateState} 
                onNext={nextStep} 
              />
            )}
            {step === 2 && (
              <ConfigBuilder 
                projectState={projectState} 
                updateState={updateState} 
                onNext={nextStep} 
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <DeploymentGuide projectState={projectState} />
            )}
          </div>
        </main>

        <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ESA LaunchPad. 专为阿里云打造。</p>
        </footer>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default App;