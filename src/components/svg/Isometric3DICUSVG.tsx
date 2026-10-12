import React from 'react';
import { motion } from 'framer-motion';

export const Isometric3DICUSVG: React.FC = () => {
  return (
    <div className="relative w-full h-[450px] sm:h-[500px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-4 border border-slate-800 shadow-2xl">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Canvas with 3D Isometric Viewbox */}
      <svg
        className="w-full h-full max-w-[750px] max-h-[460px] filter drop-shadow-2xl"
        viewBox="0 0 900 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="isoFloorGrad" x1="0" y1="0" x2="900" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="gridLineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="monitorScreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#041226" />
          </linearGradient>

          <linearGradient id="ecgGlowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="bedFrameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="bedMattressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="pumpGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* SVG Glow Filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. ISOMETRIC ILLUMINATED FLOOR PLANE */}
        <g id="isometric-floor">
          {/* Base Diamond Floor */}
          <polygon
            points="450,60 850,260 450,510 50,260"
            fill="url(#isoFloorGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Grid Mesh */}
          <path
            d="
              M 450,60 L 130,220 M 450,60 L 770,220
              M 210,140 L 530,300 M 690,140 L 370,300
              M 130,180 L 510,370 M 770,180 L 390,370
              M 270,250 L 670,450 M 630,250 L 230,450
            "
            stroke="url(#gridLineGrad)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Floor Target Ring around Bed */}
          <ellipse cx="450" cy="310" rx="180" ry="90" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
          <ellipse cx="450" cy="310" rx="220" ry="110" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 9" opacity="0.4" />
        </g>

        {/* 2. ISOMETRIC ICU SMART BED & PATIENT */}
        <g id="isometric-bed" transform="translate(360, 200)">
          {/* Base Leg Columns with Casters */}
          <path d="M 20,130 L 20,165 M 160,200 L 160,235 M -70,175 L -70,210 M 70,245 L 70,280" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <circle cx="20" cy="167" r="5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="160" cy="237" r="5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="-70" cy="212" r="5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="70" cy="282" r="5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />

          {/* Motorized Bed Frame Lower Mechanism */}
          <polygon points="-70,175 70,245 160,200 20,130" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <polygon points="20,130 160,200 160,212 20,142" fill="#0f172a" />
          <polygon points="-70,175 20,130 20,142 -70,187" fill="#334155" />

          {/* Hydraulic Lift Cylinders */}
          <line x1="30" y1="130" x2="30" y2="80" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
          <line x1="120" y1="175" x2="120" y2="125" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />

          {/* Upper Articulated Bed Deck */}
          <polygon points="-85,120 65,45 195,110 45,185" fill="url(#bedFrameGrad)" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="45,185 195,110 195,122 45,197" fill="#94a3b8" />
          <polygon points="-85,120 45,185 45,197 -85,132" fill="#64748b" />

          {/* Premium Blue Comfort Mattress */}
          <polygon points="-75,112 60,45 185,107 50,174" fill="url(#bedMattressGrad)" stroke="#38bdf8" strokeWidth="2" />

          {/* Pillow */}
          <polygon points="30,58 75,36 110,53 65,75" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Patient Ergonomic Silhouette */}
          <path
            d="M 60,60 Q 75,70 65,82 Q 40,95 20,112 Q -5,130 -25,142"
            stroke="#e0f2fe"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="65" cy="55" r="10" fill="#f8fafc" />

          {/* Transparent Glass Side Protection Rails */}
          <polygon points="-30,150 40,115 40,95 -30,130" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="50,110 120,75 120,55 50,90" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
        </g>

        {/* 3. BEDSIDE MULTI-PARAMETER MONITOR TOWER (LEFT) */}
        <g id="bedside-monitor-tower" transform="translate(180, 110)">
          {/* Mobile Base & Pole */}
          <ellipse cx="40" cy="240" rx="35" ry="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="40" y1="240" x2="40" y2="60" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

          {/* Dual Monitor Mount Brackets */}
          <rect x="25" y="70" width="30" height="120" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

          {/* Primary High-Res Clinical Monitor (Top) */}
          <g transform="translate(-30, 20)">
            {/* 3D Monitor Casing */}
            <polygon points="-15,15 5,-5 125,-5 105,15" fill="#334155" />
            <polygon points="-15,15 105,15 105,95 -15,95" fill="url(#monitorScreen)" stroke="#38bdf8" strokeWidth="2" filter="url(#neonGlow)" />
            <polygon points="105,15 125,-5 125,75 105,95" fill="#0f172a" />

            {/* Screen Content: Real-Time ECG Waveform */}
            <motion.path
              d="M -5,45 L 15,45 L 20,20 L 25,65 L 30,32 L 35,45 L 60,45 L 65,30 L 70,55 L 75,45 L 95,45"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#neonGlow)"
              initial={{ pathLength: 0.3, pathOffset: 0 }}
              animate={{ pathOffset: [0, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Live Numerical Parameter Telemetry Readout */}
            <text x="-5" y="30" fill="#38bdf8" fontSize="11" fontWeight="900" fontFamily="monospace">HR 118 BPM</text>
            <text x="55" y="30" fill="#34d399" fontSize="11" fontWeight="900" fontFamily="monospace">SpO2 98%</text>
            <text x="-5" y="80" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">BP 124/82</text>
            <text x="55" y="80" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">MAP 96</text>
          </g>

          {/* Secondary Parameter Monitor (Bottom) */}
          <g transform="translate(-20, 130)">
            <rect x="0" y="0" width="110" height="60" rx="8" fill="url(#monitorScreen)" stroke="#0284c7" strokeWidth="1.5" />
            {/* SpO2 Waveform */}
            <motion.path
              d="M 5,30 Q 15,10 25,30 T 45,30 T 65,30 T 85,30"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
              initial={{ pathOffset: 0 }}
              animate={{ pathOffset: [0, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
            <text x="10" y="50" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">TEMP 37.2°C | RR 18</text>
          </g>
        </g>

        {/* 4. MECHANICAL VENTILATOR & INFUSION PUMPS TOWER (RIGHT) */}
        <g id="ventilator-tower" transform="translate(640, 120)">
          {/* Base & Column Stand */}
          <ellipse cx="40" cy="240" rx="35" ry="18" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
          <line x1="40" y1="240" x2="40" y2="40" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

          {/* Ventilator Main Chassis */}
          <g transform="translate(-25, 30)">
            <polygon points="-15,15 5,-5 115,-5 95,15" fill="#334155" />
            <polygon points="-15,15 95,15 95,110 -15,110" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
            <polygon points="95,15 115,-5 115,90 95,110" fill="#1e293b" />

            {/* Ventilator Display Screen */}
            <rect x="-5" y="25" width="90" height="50" rx="4" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1" />
            <text x="2" y="42" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">VENT MODE: PRVC</text>
            <text x="2" y="58" fill="#38bdf8" fontSize="9" fontFamily="monospace">PEEP: 8.0 | FiO2: 50%</text>

            {/* Pressure Wave Graph */}
            <path d="M 0,68 Q 15,60 30,72 T 60,68 T 85,68" stroke="#a7f3d0" strokeWidth="1.5" fill="none" />
          </g>

          {/* Multi-Channel IV Infusion Pump Stack */}
          <g transform="translate(-15, 150)">
            <rect x="0" y="0" width="90" height="25" rx="4" fill="url(#pumpGrad)" stroke="#ffffff" strokeWidth="1" />
            <text x="8" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">PUMP 1: NORAD 0.08</text>
            <circle cx="80" cy="12" r="3" fill="#10b981" />

            <rect x="0" y="30" width="90" height="25" rx="4" fill="url(#pumpGrad)" stroke="#ffffff" strokeWidth="1" />
            <text x="8" y="46" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">PUMP 2: FENT 25mcg</text>
            <circle cx="80" cy="42" r="3" fill="#10b981" />
          </g>

          {/* Animated Ventilator Breathing Tubes to Patient Bed */}
          <motion.path
            d="M -20,110 Q -120,140 -200,160"
            stroke="#38bdf8"
            strokeWidth="4"
            fill="none"
            strokeDasharray="8 4"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: [-24, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </g>

        {/* 5. FLOATING 3D HIGH-TECH TELEMETRY HUD CARDS */}
        {/* HUD Card 1: Live Patient Telemetry Status (Top Left) */}
        <g transform="translate(110, 35)">
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="0" y="0" width="220" height="55" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" filter="url(#neonGlow)" />
            <rect x="0" y="0" width="6" height="55" rx="3" fill="#10b981" />
            <circle cx="22" cy="20" r="5" fill="#10b981" />
            <circle cx="22" cy="20" r="9" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6">
              <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="36" y="24" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">BED ICU-04 · P-1024</text>
            <text x="36" y="42" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">● 100% REAL-TIME STREAM</text>
          </motion.g>
        </g>

        {/* HUD Card 2: AI Acuity Risk Index (Top Right) */}
        <g transform="translate(560, 30)">
          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <rect x="0" y="0" width="230" height="58" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#0284c7" strokeWidth="1.5" filter="url(#neonGlow)" />
            <rect x="0" y="0" width="6" height="58" rx="3" fill="#0284c7" />
            <text x="18" y="24" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">EXPLAINABLE AI ACUITY</text>
            <text x="18" y="44" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="monospace">98.4 / 100</text>
            <rect x="140" y="30" width="75" height="16" rx="8" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
            <text x="148" y="42" fill="#38bdf8" fontSize="9" fontWeight="extrabold" fontFamily="sans-serif">STABLE RISK</text>
          </motion.g>
        </g>

        {/* 6. DYNAMIC STREAMING DATA PACKETS & TELEMETRY BEAMS */}
        {/* Left Monitor Data Beam to Bed */}
        <path d="M 270,160 Q 320,200 370,220" stroke="#34d399" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
        <motion.circle
          cx="270"
          cy="160"
          r="4"
          fill="#34d399"
          filter="url(#neonGlow)"
          animate={{ cx: [270, 370], cy: [160, 220] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Right Ventilator Data Beam to Central AI Hub */}
        <path d="M 630,170 Q 560,200 480,220" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
        <motion.circle
          cx="630"
          cy="170"
          r="4"
          fill="#38bdf8"
          filter="url(#neonGlow)"
          animate={{ cx: [630, 480], cy: [170, 220] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
};
