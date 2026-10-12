import React from 'react';

export const SecurityArchitectureSVG: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl overflow-hidden">
      <svg viewBox="0 0 800 360" className="w-full h-auto">
        <defs>
          <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#secGrad)" rx="12" />

        {/* Central Shield */}
        <g transform="translate(400, 180)">
          <path d="M 0 -70 L 60 -40 L 60 30 Q 60 70 0 90 Q -60 70 -60 30 L -60 -40 Z" fill="#0d9488" opacity="0.15" stroke="#14b8a6" strokeWidth="2.5" />
          <path d="M 0 -55 L 45 -30 L 45 25 Q 45 55 0 70 Q -45 55 -45 25 L -45 -30 Z" fill="#0f172a" stroke="#0d9488" strokeWidth="2" />
          <text x="0" y="-5" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
            SECURITY &
          </text>
          <text x="0" y="15" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
            GOVERNANCE
          </text>
        </g>

        {/* Outer Security Pillars */}
        {/* Pillar 1: RBAC */}
        <g transform="translate(130, 90)">
          <rect x="-80" y="-30" width="160" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="0" y="-5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Role-Based Access</text>
          <text x="0" y="12" fill="#94a3b8" fontSize="10" textAnchor="middle">Least Privilege RBAC</text>
        </g>

        {/* Pillar 2: MFA & SSO */}
        <g transform="translate(670, 90)">
          <rect x="-80" y="-30" width="160" height="60" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
          <text x="0" y="-5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">SSO & MFA Guard</text>
          <text x="0" y="12" fill="#94a3b8" fontSize="10" textAnchor="middle">Hospital Identity Auth</text>
        </g>

        {/* Pillar 3: TLS / AES Encryption */}
        <g transform="translate(130, 270)">
          <rect x="-80" y="-30" width="160" height="60" rx="8" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
          <text x="0" y="-5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Encryption Layer</text>
          <text x="0" y="12" fill="#94a3b8" fontSize="10" textAnchor="middle">TLS 1.3 / AES-256 Rest</text>
        </g>

        {/* Pillar 4: Audit Logs */}
        <g transform="translate(670, 270)">
          <rect x="-80" y="-30" width="160" height="60" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="0" y="-5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Immutable Audit</text>
          <text x="0" y="12" fill="#94a3b8" fontSize="10" textAnchor="middle">Tamper-Evident Trail</text>
        </g>

        {/* Radiating Rays */}
        <line x1="210" y1="90" x2="340" y2="150" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="590" y1="90" x2="460" y2="150" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="210" y1="270" x2="340" y2="210" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="590" y1="270" x2="460" y2="210" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    </div>
  );
};
