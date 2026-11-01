import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading frequencies...', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-zenvy-muted space-y-3">
      <Loader2 className={`${sizeClass} animate-spin text-zenvy-violet`} />
      {message && <p className="text-sm font-medium tracking-wide">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

