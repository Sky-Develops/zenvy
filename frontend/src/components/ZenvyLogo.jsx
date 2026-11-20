import React from 'react';

export const ZenvyLogo = ({ size = "md", className = "" }) => {
  const iconSize = size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSize = size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Icon SVG disesuaikan dengan warna tema Primary Accent (Electric Mint #10B981) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={`${iconSize} text-zenvy-primary flex-shrink-0`}
        fill="none"
        aria-hidden="true"
      >
        {/* Garis Paranada (Tangga Nada) */}
        <line x1="15" y1="35" x2="85" y2="35" stroke="currentColor" strokeWidth="4" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="4" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="15" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="4" strokeOpacity="0.35" strokeLinecap="round" />

        {/* Huruf Z Utama */}
        <path d="M 24 22 L 76 22 L 24 78 L 76 78" stroke="currentColor" strokeWidth="9" strokeLinecap="square" strokeLinejoin="miter" />
        
        {/* Titik Notasi Musik di Tengah */}
        <circle cx="76" cy="50" r="6.5" fill="currentColor" />
      </svg>

      {/* Tulisan ZENVY Off-White */}
      <span className={`text-zenvy-text font-extrabold ${textSize} tracking-wider font-sans`}>
        ZENVY
      </span>
    </div>
  );
};

export default ZenvyLogo;
