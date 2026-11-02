import React from 'react';

export const ZenvyLogo = ({ className = "w-full h-full", idPrefix = "zenvy" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 240" 
      width="100%" 
      height="100%"
      className={className}
    >
      <defs>
        {/* Gradasi ungu sesuai key visual ikon ZENVY */}
        <linearGradient id={`${idPrefix}Purple`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8E54E9" />
          <stop offset="100%" stopColor="#4776E6" />
        </linearGradient>

        {/* Opsi gradasi solid deep-purple alternatif */}
        <linearGradient id={`${idPrefix}Vibrant`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9d4edd" />
          <stop offset="100%" stopColor="#6a0dad" />
        </linearGradient>

        {/* Subtle drop glow khas logo aplikasi */}
        <filter id={`${idPrefix}SoftGlow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#7b2cbf" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}SoftGlow)`}>
        <text 
          x="50%" 
          y="58%" 
          textAnchor="middle" 
          dominantBaseline="central" 
          fill={`url(#${idPrefix}Purple)`} 
          fontFamily="system-ui, -apple-system, 'Inter', 'Montserrat', 'Segoe UI', Roboto, sans-serif" 
          fontSize="115" 
          fontWeight="900" 
          fontStyle="normal" 
          letterSpacing="4"
        >
          ZENVY
        </text>
      </g>
    </svg>
  );
};

export default ZenvyLogo;
