import React from 'react';

interface PatientTrendProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number | string;
  fillOpacity?: number;
}

export const PatientTrend: React.FC<PatientTrendProps> = ({
  data,
  color = '#2563eb',
  height = 36,
  width = '100%',
  fillOpacity = 0.15,
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 30 - ((val - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,35 ${points} 100,35`;

  return (
    <svg viewBox="0 0 100 35" preserveAspectRatio="none" className="w-full" style={{ height, width }}>
      <defs>
        <linearGradient id={`trendGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Shaded Area under Trend */}
      <polygon points={areaPoints} fill={`url(#trendGrad-${color.replace('#', '')})`} />

      {/* Trend Polyline */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />

      {/* Endpoint Pulse Dot */}
      {data.length > 0 && (
        <circle
          cx="100"
          cy={30 - ((data[data.length - 1] - min) / range) * 24}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};
