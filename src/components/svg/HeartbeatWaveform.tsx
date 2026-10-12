import React from 'react';

interface HeartbeatWaveformProps {
  color?: string;
  height?: number;
  width?: string | number;
  bpm?: number;
  interactive?: boolean;
}

export const HeartbeatWaveform: React.FC<HeartbeatWaveformProps> = ({
  color = '#14b8a6',
  height = 50,
  width = '100%',
  bpm = 104,
}) => {
  // PQRST ECG cycle coordinates
  const pathData = `
    M 0,25 
    L 20,25 
    Q 25,23 30,25 
    L 35,25 
    L 38,28 
    L 42,5 
    L 48,45 
    L 52,25 
    L 65,25 
    Q 73,15 80,25 
    L 100,25
    M 100,25 
    L 120,25 
    Q 125,23 130,25 
    L 135,25 
    L 138,28 
    L 142,5 
    L 148,45 
    L 152,25 
    L 165,25 
    Q 173,15 180,25 
    L 200,25
    M 200,25 
    L 220,25 
    Q 225,23 230,25 
    L 235,25 
    L 238,28 
    L 242,5 
    L 248,45 
    L 252,25 
    L 265,25 
    Q 273,15 280,25 
    L 300,25
    M 300,25
    L 320,25
    Q 325,23 330,25
    L 335,25
    L 338,28
    L 342,5
    L 348,45
    L 352,25
    L 365,25
    Q 373,15 380,25
    L 400,25
  `;

  return (
    <div className="relative overflow-hidden w-full" style={{ height }}>
      {/* Background ECG Grid Lines */}
      <svg className="w-full h-full absolute inset-0 opacity-20 pointer-events-none">
        <defs>
          <pattern id="ecgGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ecgGrid)" />
      </svg>

      {/* Real-time ECG Trace */}
      <svg
        viewBox="0 0 400 50"
        preserveAspectRatio="none"
        className="w-full h-full relative z-10"
      >
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-path"
        />
      </svg>

      {/* Animated Scan Line */}
      <div
        className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none animate-scanline"
        style={{ animationDuration: `${60 / bpm * 3}s` }}
      />
    </div>
  );
};
