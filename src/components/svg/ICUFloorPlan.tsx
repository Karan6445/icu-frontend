import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PATIENTS, MOCK_BEDS } from '../../data/mockPatients';
import { DataQualityBadge } from '../common/DataQualityBadge';
import { StatusBadge } from '../common/StatusBadge';

export const ICUFloorPlan: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return { fill: '#fef2f2', stroke: '#dc2626', text: '#991b1b', dot: '#dc2626' };
      case 'HIGH':
        return { fill: '#fffbe6', stroke: '#d97706', text: '#92400e', dot: '#d97706' };
      case 'ROUTINE':
        return { fill: '#eff6ff', stroke: '#2563eb', text: '#1e40af', dot: '#2563eb' };
      case 'STABLE':
        return { fill: '#f0fdf4', stroke: '#16a34a', text: '#166534', dot: '#16a34a' };
      default:
        return { fill: '#f8fafc', stroke: '#cbd5e1', text: '#64748b', dot: '#94a3b8' };
    }
  };

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl overflow-x-auto">
      {/* Floor Plan Header Overlay */}
      <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            MICU-01 Spatial Floor Plan & Telemetry Topology
          </h3>
          <p className="text-xs text-slate-400">Interactive 24-Bed Grid · Real-time Device Routing & Status Map</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Critical (3)
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            High Priority (2)
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Routine (8)
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Stable (5)
          </div>
        </div>
      </div>

      {/* SVG Canvas for Floor Plan */}
      <div className="relative min-w-[960px]">
        <svg viewBox="0 0 1000 600" className="w-full h-auto text-slate-300">
          <defs>
            <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="600" fill="#0f172a" rx="10" />
          <rect width="1000" height="600" fill="url(#floorGrid)" rx="10" />

          {/* Central Nursing Station & Gateway Hub */}
          <g transform="translate(380, 240)">
            <rect width="240" height="120" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <text x="120" y="45" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              CENTRAL NURSING STATION
            </text>
            <text x="120" y="68" fill="#14b8a6" fontSize="11" fontFamily="monospace" textAnchor="middle">
              EDGE GATEWAY MICU-01 [98.7% ONLINE]
            </text>
            <circle cx="120" cy="90" r="6" fill="#10b981" className="animate-pulse" />
          </g>

          {/* Architectural Wall Outlines */}
          <rect x="20" y="20" width="960" height="560" fill="none" stroke="#334155" strokeWidth="3" rx="6" />

          {/* Bed Pod Nodes */}
          {MOCK_BEDS.slice(0, 12).map((bed, i) => {
            const patient = MOCK_PATIENTS.find(p => p.bedNumber === bed.number);
            const style = getStatusColor(patient?.status);
            const isHovered = hoveredBed === bed.number;

            // Compute spatial layout
            const col = i % 6;
            const row = Math.floor(i / 6);
            const x = 40 + col * 155;
            const y = row === 0 ? 40 : 420;

            return (
              <g
                key={bed.number}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredBed(bed.number)}
                onMouseLeave={() => setHoveredBed(null)}
                onClick={() => {
                  if (patient) navigate(`/patient/${patient.id}`);
                }}
              >
                {/* Bed Outer Pod Card */}
                <rect
                  width="140"
                  height="130"
                  rx="8"
                  fill={isHovered ? '#1e293b' : '#0f172a'}
                  stroke={isHovered ? '#38bdf8' : style.stroke}
                  strokeWidth={isHovered ? '2.5' : '1.5'}
                  filter={isHovered ? 'url(#glow)' : undefined}
                />

                {/* Bed Header bar */}
                <path d={`M 0 8 Q 0 0 8 0 L 132 0 Q 140 0 140 8 L 140 28 L 0 28 Z`} fill={style.stroke} opacity="0.2" />

                <text x="12" y="20" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {bed.number}
                </text>

                <circle cx="125" cy="15" r="4" fill={style.dot} />

                {patient ? (
                  <>
                    {/* Patient Details */}
                    <text x="12" y="46" fill="#f8fafc" fontSize="11" fontWeight="bold">
                      {patient.name}
                    </text>
                    <text x="12" y="60" fill="#94a3b8" fontSize="9">
                      {patient.age}y / {patient.gender} · {patient.mrn}
                    </text>

                    {/* Mini Vitals Bar */}
                    <g transform="translate(10, 70)">
                      <rect width="120" height="48" rx="4" fill="#1e293b" opacity="0.8" />
                      <text x="8" y="16" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        HR {patient.vitals.hr}
                      </text>
                      <text x="65" y="16" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        SpO2 {patient.vitals.spo2}%
                      </text>
                      <text x="8" y="34" fill="#a855f7" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        BP {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                      </text>
                      <text x="65" y="34" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        RR {patient.vitals.rr}
                      </text>
                    </g>
                  </>
                ) : (
                  <text x="70" y="75" fill="#64748b" fontSize="11" textAnchor="middle" fontStyle="italic">
                    Unoccupied Bed
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Tooltip Overlay */}
        {hoveredBed && (() => {
          const patient = MOCK_PATIENTS.find(p => p.bedNumber === hoveredBed);
          if (!patient) return null;
          return (
            <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 text-white rounded-lg p-3 shadow-2xl backdrop-blur-md max-w-xs z-30 pointer-events-none">
              <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-2">
                <span className="font-mono text-xs font-bold text-teal-400">{patient.bedNumber} Details</span>
                <DataQualityBadge quality={patient.vitals.quality} size="sm" />
              </div>
              <p className="text-xs font-semibold">{patient.name} ({patient.age}y {patient.gender})</p>
              <p className="text-[11px] text-slate-400 mb-2">{patient.admittingDiagnosis}</p>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono bg-slate-800 p-2 rounded">
                <div>HR: <span className="text-rose-400 font-bold">{patient.vitals.hr} bpm</span></div>
                <div>SpO2: <span className="text-sky-400 font-bold">{patient.vitals.spo2}%</span></div>
                <div>BP: <span className="text-purple-400 font-bold">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</span></div>
                <div>RR: <span className="text-emerald-400 font-bold">{patient.vitals.rr}/min</span></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Clinician: {patient.assignedClinician}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
