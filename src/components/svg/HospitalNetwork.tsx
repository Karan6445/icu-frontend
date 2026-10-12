import React from 'react';

export const HospitalNetwork: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl overflow-hidden relative">
      <svg viewBox="0 0 800 400" className="w-full h-auto">
        <defs>
          <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Outer Cloud / Command Center Node */}
        <g transform="translate(400, 80)">
          <rect x="-100" y="-35" width="200" height="70" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="0" y="-5" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
            CENTRAL TELE-ICU COMMAND CENTER
          </text>
          <text x="0" y="15" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle">
            Multi-Hospital Central Dashboard
          </text>
        </g>

        {/* Network Connection Lines */}
        <line x1="400" y1="115" x2="160" y2="250" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="400" y1="115" x2="400" y2="250" stroke="#0d9488" strokeWidth="2" />
        <line x1="400" y1="115" x2="640" y2="250" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" />

        {/* On-Prem Edge Node 1: Metro Hospital */}
        <g transform="translate(160, 270)">
          <rect x="-110" y="-40" width="220" height="80" rx="10" fill="#0f172a" stroke="#0d9488" strokeWidth="2" />
          <text x="0" y="-15" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
            Metro Super-Specialty ICU
          </text>
          <text x="0" y="5" fill="#94a3b8" fontSize="10" textAnchor="middle">
            On-Premise Edge Gateway Server
          </text>
          <rect x="-80" y="15" width="160" height="15" rx="3" fill="#1e293b" />
          <text x="0" y="26" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle">
            HL7 v2.6 + Mindray/Philips
          </text>
        </g>

        {/* On-Prem Edge Node 2: Tier-2 District Hospital */}
        <g transform="translate(400, 270)">
          <rect x="-110" y="-40" width="220" height="80" rx="10" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
          <text x="0" y="-15" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
            District Medical ICU (Tier 2)
          </text>
          <text x="0" y="5" fill="#94a3b8" fontSize="10" textAnchor="middle">
            Low-Bandwidth Resilient Node
          </text>
          <rect x="-80" y="15" width="160" height="15" rx="3" fill="#1e293b" />
          <text x="0" y="26" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle">
            Offline Buffer & Sync Engine
          </text>
        </g>

        {/* On-Prem Edge Node 3: Regional Trauma Center */}
        <g transform="translate(640, 270)">
          <rect x="-110" y="-40" width="220" height="80" rx="10" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
          <text x="0" y="-15" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
            Regional Trauma ICU
          </text>
          <text x="0" y="5" fill="#94a3b8" fontSize="10" textAnchor="middle">
            Legacy Infrastructure Adapter
          </text>
          <rect x="-80" y="15" width="160" height="15" rx="3" fill="#1e293b" />
          <text x="0" y="26" fill="#a855f7" fontSize="9" fontFamily="monospace" textAnchor="middle">
            Mixed Serial / Modbus Protocols
          </text>
        </g>
      </svg>
    </div>
  );
};
