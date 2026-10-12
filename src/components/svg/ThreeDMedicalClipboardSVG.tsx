import React from 'react';
import { motion } from 'framer-motion';

export const ThreeDMedicalClipboardSVG: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          {/* Clipboard Body Gradient */}
          <linearGradient id="clipBodyGrad" x1="0" y1="0" x2="200" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          {/* Top Clamp Gradient */}
          <linearGradient id="clampGrad" x1="0" y1="0" x2="0" y2="50">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Medical Cross Gradient */}
          <linearGradient id="crossGrad" x1="0" y1="0" x2="0" y2="100">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          {/* 3D Checkmark Gradient */}
          <linearGradient id="checkGrad" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1e1b4b" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 1. Main 3D Clipboard Body */}
        <rect x="25" y="35" width="150" height="170" rx="32" fill="url(#clipBodyGrad)" filter="url(#softShadow)" />
        {/* Inner Highlight Reflection */}
        <rect x="30" y="40" width="140" height="160" rx="28" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeOpacity="0.5" />

        {/* 2. Top Clip Clamp Mechanism */}
        <rect x="65" y="15" width="70" height="35" rx="14" fill="url(#clampGrad)" filter="url(#softShadow)" />
        <rect x="80" y="25" width="40" height="8" rx="4" fill="#0f172a" opacity="0.3" />

        {/* 3. Central 3D Medical Cross */}
        <g transform="translate(100, 120)">
          {/* Vertical Arm */}
          <rect x="-22" y="-45" width="44" height="90" rx="14" fill="url(#crossGrad)" filter="url(#softShadow)" />
          {/* Horizontal Arm */}
          <rect x="-45" y="-22" width="90" height="44" rx="14" fill="url(#crossGrad)" filter="url(#softShadow)" />
        </g>

        {/* 4. Animated 3D Floating Blue Checkmark */}
        <g transform="translate(100, 122)">
          <motion.g
            animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M -25,2 L -8,22 L 32,-18"
              stroke="url(#checkGrad)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#softShadow)"
            />
            <path
              d="M -25,2 L -8,22 L 32,-18"
              stroke="#60a5fa"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </motion.g>
        </g>
      </motion.svg>
    </div>
  );
};
