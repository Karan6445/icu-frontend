import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_UNITS } from '../../data/mockPatients';
import { Building2, Activity, ArrowRight, ShieldCheck, Wifi, Users } from 'lucide-react';
import { HeartbeatWaveform } from '../../components/svg/HeartbeatWaveform';
import { AuthService } from '../../services/authService';

export const UnitSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  return (
    <div className="min-h-screen bg-clinical-navy text-white p-8 selection:bg-clinical-teal selection:text-white flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
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
              <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-900 border border-teal-500/30 flex items-center justify-center p-1.5 shadow-glow overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-mono tracking-wider">NAIMIFY SMART ICU</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-teal-400 font-serif italic font-semibold">enfinix</span>
                <span className="opacity-60 text-slate-400">|</span>
                <span className="text-xs text-slate-300 font-medium">Smart Clinical Decision</span>
                <span className="text-[10px] text-slate-500 font-mono">· Screen 01</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{currentUser.specialty}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">Select Authorized ICU Unit</h2>
          <p className="text-slate-400 text-xs">
            You are authorized for <span className="text-teal-400 font-bold">{currentUser.authorizedUnits.join(', ')}</span>. Select a unit to open Screen 02 - Command Center.
          </p>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_UNITS.map((unit) => {
            const isAuthorized = currentUser.authorizedUnits.includes(unit.id);
            return (
              <div
                key={unit.id}
                onClick={() => {
                  if (isAuthorized) navigate('/command-center');
                }}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                  isAuthorized
                    ? 'bg-slate-900/90 border-slate-700 hover:border-teal-400 hover:shadow-2xl cursor-pointer'
                    : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-white">{unit.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">{unit.id}</span>
                      </div>
                    </div>
                    {isAuthorized ? (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                        AUTHORIZED
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2.5 py-1 rounded">
                        RESTRICTED
                      </span>
                    )}
                  </div>

                  {/* Vitals Sparkline Mini Visualization */}
                  <div className="my-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Unit Telemetry Waveform</span>
                      <span className="text-emerald-400 font-bold">{unit.connectivity}% Gateway Online</span>
                    </div>
                    <HeartbeatWaveform color={unit.critical > 2 ? '#f43f5e' : '#10b981'} height={32} />
                  </div>

                  {/* Unit Stats Metrics */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs my-3 text-center">
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">OCCUPIED BEDS</span>
                      <span className="text-sm font-bold text-white">{unit.occupied} / {unit.totalBeds}</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-rose-400 block font-bold">CRITICAL</span>
                      <span className="text-sm font-bold text-rose-400">{unit.critical} Patients</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-teal-400 block font-bold">CONNECTIVITY</span>
                      <span className="text-sm font-bold text-teal-400">{unit.connectivity}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold font-mono">
                  <span className={isAuthorized ? 'text-teal-400' : 'text-slate-500'}>
                    {isAuthorized ? 'Open Bed Command Grid →' : 'Requires Unit Lead Authorization'}
                  </span>
                  {isAuthorized && (
                    <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full pt-8 text-center text-xs text-slate-500 font-mono">
        <span>Naimify Smart ICU Platform v2.0 · Central Super-Specialty Hospital</span>
      </div>
    </div>
  );
};
