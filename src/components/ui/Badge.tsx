import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'live' | 'delayed' | 'stale' | 'disconnected' | 'critical' | 'warning' | 'stable' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  icon
}) => {
  const styles: Record<string, string> = {
    live: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    delayed: 'bg-amber-50 text-amber-800 border-amber-300',
    stale: 'bg-orange-50 text-orange-800 border-orange-300',
    disconnected: 'bg-red-50 text-red-800 border-red-300',
    critical: 'bg-red-100 text-red-900 border-red-300 font-semibold',
    warning: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    stable: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200'
  };

  const dotColors: Record<string, string> = {
    live: 'bg-emerald-600',
    delayed: 'bg-amber-600',
    stale: 'bg-orange-600',
    disconnected: 'bg-red-600',
    critical: 'bg-red-600',
    warning: 'bg-amber-600',
    stable: 'bg-emerald-600',
    neutral: 'bg-slate-400',
    info: 'bg-blue-600'
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border ${styles[variant]} ${sizeStyles[size]}`}>
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}></span>
        </span>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </span>
  );
};
