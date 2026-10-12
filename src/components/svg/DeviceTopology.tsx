import React from 'react';

export const DeviceTopology: React.FC = () => {
  const steps = [
    { title: 'Bedside Devices', desc: 'Mindray, Hamilton, B. Braun', color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Protocol Adapter', desc: 'HL7, IEEE 11073, PCD-01', color: '#0d9488', bg: '#f0fdf4' },
    { title: 'Parser & Decoders', desc: 'MLLP, Modbus, Serial', color: '#8b5cf6', bg: '#f5f3ff' },
    { title: 'Data Validator', desc: 'Range & Artifact Checks', color: '#d97706', bg: '#fffbe6' },
    { title: 'Normalizer Layer', desc: 'LOINC / SNOMED CT Mapping', color: '#2563eb', bg: '#eff6ff' },
    { title: 'Patient Context Bus', desc: 'TimescaleDB + WebSocket', color: '#059669', bg: '#ecfdf5' },
    { title: 'Clinician UI', desc: 'Command Center & Copilot', color: '#0f172a', bg: '#f8fafc' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase text-teal-400 font-mono">
            Device Interoperability & Gateway Data Pipeline Topology
          </h3>
          <p className="text-xs text-slate-400">
            Isolated multi-vendor ingestion layer with zero clinical UI dependency on protocol changes.
          </p>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-mono font-bold">
          GATEWAY GW-MICU-01 ONLINE
        </span>
      </div>

      <div className="overflow-x-auto py-4">
        <div className="min-w-[900px] flex items-center justify-between relative">
          {steps.map((step, idx) => (
            <React.Fragment key={step.title}>
              {/* Step Node */}
              <div className="flex flex-col items-center text-center relative z-10 w-32">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shadow-xl border-2 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: step.bg, color: step.color, borderColor: step.color }}
                >
                  0{idx + 1}
                </div>
                <h4 className="text-xs font-bold mt-2.5 text-slate-200">{step.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</p>
              </div>

              {/* Connecting Arrow Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 relative mx-1">
                  <div className="w-full h-full bg-slate-700" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-teal-400/40 animate-pulse" />
                  <svg
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-teal-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
