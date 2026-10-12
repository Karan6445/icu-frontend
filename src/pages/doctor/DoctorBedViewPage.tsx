import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Bed, HeartPulse, Activity } from 'lucide-react';

export const DoctorBedViewPage: React.FC = () => {
  const { beds } = useAppSelector(state => state.icuBed);
  const { patients } = useAppSelector(state => state.patient);
  const [activeIcu, setActiveIcu] = useState(() => localStorage.getItem('selected_icu_id') || 'MICU-01');

  useEffect(() => {
    const syncIcu = () => {
      const params = new URLSearchParams(window.location.search);
      const queryIcu = params.get('icu') || localStorage.getItem('selected_icu_id');
      if (queryIcu) setActiveIcu(queryIcu);
    };
    syncIcu();
    window.addEventListener('icuChanged', syncIcu);
    window.addEventListener('storage', syncIcu);
    return () => {
      window.removeEventListener('icuChanged', syncIcu);
      window.removeEventListener('storage', syncIcu);
    };
  }, []);

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            DOCTOR WORKSTATION • {activeIcu}
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">{activeIcu} Bed Telemetry View</h1>
          <p className="text-xs text-slate-500">Real-time ICU bed equipment telemetry, ventilator modes, and vital status for {activeIcu} assigned beds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.slice(0, 4).map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-teal-500/60 transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-[#0F766E]" />
                <span className="font-extrabold text-slate-900 text-base">{p.bedNumber} ({p.unitName})</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-mono font-bold border border-emerald-200">
                LIVE TELEMETRY
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-xs">
              <div className="text-slate-900 font-bold">{p.name} ({p.id})</div>
              <div className="text-slate-600">Diagnosis: {p.admittingDiagnosis}</div>
              <div className="text-[#0F766E] pt-1 font-bold">HR: {p.vitals.hr} bpm | SpO2: {p.vitals.spo2}% | MAP: {p.vitals.map} mmHg</div>
            </div>

            {p.ventilator && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono space-y-1 text-slate-700">
                <div className="flex justify-between text-[#0F766E] font-bold"><span>Ventilator Mode:</span> <span>{p.ventilator.mode}</span></div>
                <div className="flex justify-between"><span>FiO2:</span> <span>{p.ventilator.fio2}%</span></div>
                <div className="flex justify-between"><span>PEEP:</span> <span>{p.ventilator.peep} cmH2O</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
