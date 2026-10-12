import React from 'react';

interface RespiratoryWaveformProps {
  color?: string;
  height?: number;
}

export const RespiratoryWaveform: React.FC<RespiratoryWaveformProps> = ({
  color = '#3b82f6',
  height = 50,
}) => {
  // Respiratory flow-volume waveform loop path
  const pathData = `
    M 0,35
    C 25,5 45,5 60,35
    C 75,45 85,45 100,35
    C 125,5 145,5 160,35
    C 175,45 185,45 200,35
    C 225,5 245,5 260,35
    C 275,45 285,45 300,35
    C 325,5 345,5 360,35
    C 375,45 385,45 400,35
  `;

  return (
    <div className="relative overflow-hidden w-full" style={{ height }}>
      {/* Background Grid */}
      <svg className="w-full h-full absolute inset-0 opacity-15 pointer-events-none">
        <defs>
          <pattern id="respGrid" width="20" height="10" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 10" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#respGrid)" />
      </svg>

      <svg
        viewBox="0 0 400 50"
        preserveAspectRatio="none"
        className="w-full h-full relative z-10"
      >
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="respiratory-path"
        />
      </svg>
    </div>
  );
};
