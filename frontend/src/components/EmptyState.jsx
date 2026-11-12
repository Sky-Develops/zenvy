import React from 'react';
import { Music2 } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Music2,
  title = 'No Music Found',
  description = 'Try searching with another keyword or explore your library.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="relative group max-w-lg mx-auto my-8">
      {/* Main Frosted Glass Card Surface with Corner Glow in Top-Right */}
      <div className="relative flex flex-col items-center justify-center p-10 text-center bg-[#1C1C1F]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow in top-right corner */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-[#25252B] flex items-center justify-center text-emerald-400 mb-4 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-xs text-zenvy-muted mb-6 leading-relaxed max-w-sm">
          {description}
        </p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-400 text-white text-xs font-bold transition-colors duration-200 shadow-lg shadow-emerald-500/20"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
