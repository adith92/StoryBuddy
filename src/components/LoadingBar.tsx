import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export const LoadingBar: React.FC<{ message: string }> = ({ message }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p < 80) return p + (80 - p) * 0.1;
        if (p < 95) return p + (95 - p) * 0.02;
        return p;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 relative z-10" />
          <div className="absolute inset-0 bg-indigo-200 blur-xl opacity-50 rounded-full"></div>
        </div>
        
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
          <div 
             className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
             style={{ width: `${progress}%`, backgroundSize: '200% 100%' }}
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="text-indigo-700 font-bold animate-pulse text-xl text-center flex items-center gap-2">
           <Sparkles className="text-yellow-400 w-6 h-6" />
           {message}
           <Sparkles className="text-yellow-400 w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
