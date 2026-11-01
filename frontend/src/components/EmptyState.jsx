import React from 'react';
import { Music2 } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Music2,
  title = 'No Music Found',
  description = 'Try searching with another keyword or explore your frequencies.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zenvy-card/40 rounded-2xl border border-zenvy-border/60 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-zenvy-violet/10 border border-zenvy-violet/30 flex items-center justify-center text-zenvy-violet mb-4 shadow-lg shadow-zenvy-violet/5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zenvy-muted mb-6 leading-relaxed max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-full bg-zenvy-violet hover:bg-zenvy-violetDark text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-zenvy-violet/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

