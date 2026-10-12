import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textVariant?: 'light' | 'dark';
  clickable?: boolean;
  className?: string;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  textVariant = 'light',
  clickable = true,
  className = '',
  to = '/dashboard'
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl'
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      <div className={`relative shrink-0 ${sizeMap[size]} flex items-center justify-center group`}>
        {/* ECG Pulse Wave Line Animation Layer */}
        <div className="absolute -inset-x-6 inset-y-0 flex items-center pointer-events-none z-0">
          <svg className="w-full h-8 overflow-visible opacity-90" viewBox="0 0 100 30" fill="none">
            <path
              d="M 0 15 L 20 15 L 24 15 L 28 8 L 32 22 L 36 2 L 42 28 L 46 15 L 50 15 L 100 15"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg-line"
            />
          </svg>
        </div>

        {/* Logo Icon Box */}
        <div className="relative z-10 w-full h-full rounded-xl overflow-hidden shadow-sm border border-teal-500/30 bg-slate-950 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Project Logo"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/project-logo.gif';
            }}
          />
        </div>
      </div>
      {showText && (
        <div className="min-w-0">
          <span className={`font-black tracking-wider uppercase font-sans leading-none block ${textSizes[size]} ${
            textVariant === 'light' ? 'text-white' : 'text-slate-900'
          }`}>
            NAIMIFY <span className="text-teal-300 font-extrabold">SMART ICU</span>
          </span>
          <span className={`text-[11px] block mt-0.5 ${
            textVariant === 'light' ? 'text-teal-200' : 'text-slate-600'
          }`}>
            <span className="font-serif italic font-semibold">enfinix</span>
            <span className="opacity-60 mx-1.5 font-sans">|</span>
            <span className="font-medium font-sans text-[10px]">Smart Clinical Decision</span>
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link to={to} className="hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
