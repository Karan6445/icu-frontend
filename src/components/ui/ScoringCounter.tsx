import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ScoringCounterProps {
  value: number;
  max?: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
}

export const ScoringCounter: React.FC<ScoringCounterProps> = ({
  value,
  max = 100,
  suffix = '%',
  prefix = '',
  label,
  sublabel,
  color = 'blue'
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000; // ms
    const increment = (end - start) / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Number(start.toFixed(1)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const strokeColor =
    color === 'emerald'
      ? '#059669'
      : color === 'purple'
      ? '#7c3aed'
      : color === 'amber'
      ? '#d97706'
      : '#2563eb';

  const percentage = (displayValue / max) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-all group">
      {/* Circular Animated Progress Ring */}
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="7"
            fill="transparent"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            stroke={strokeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
            {prefix}
            {displayValue}
            {suffix}
          </span>
        </div>
      </div>

      {/* Label & Description */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider group-hover:text-blue-900 transition-colors">
          {label}
        </h4>
        {sublabel && <p className="text-[11px] text-slate-500 mt-1 leading-snug">{sublabel}</p>}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: strokeColor }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
