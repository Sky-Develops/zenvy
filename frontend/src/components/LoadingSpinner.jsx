import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading music tracks...', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="relative group max-w-sm mx-auto my-8">
      {/* Main Frosted Glass Surface with Top-Right Corner Glow */}
      <div className="relative flex flex-col items-center justify-center p-8 text-center bg-[#1C1C1F]/80 backdrop-blur-xl rounded-2xl text-zenvy-muted space-y-3 shadow-xl overflow-hidden">
        {/* Glow in top-right corner */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
        <Loader2 className={`${sizeClass} animate-spin text-zenvy-primary`} />
        {message && <p className="text-xs font-semibold text-zinc-300 tracking-wide">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
