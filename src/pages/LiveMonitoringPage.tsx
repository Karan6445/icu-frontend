import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, CartesianGrid } from 'recharts';
import { Activity, Play, Pause, Heart, Zap, Radio, Sliders, ShieldCheck } from 'lucide-react';
import { MOCK_PATIENTS } from '../data/mockData';

export const LiveMonitoringPage: React.FC = () => {
  const [selectedBed, setSelectedBed] = useState('ICU-04');
  const [isLive, setIsLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [sweepSpeed, setSweepSpeed] = useState<'25mm/s' | '50mm/s'>('25mm/s');

  // Live waveform simulation timer (high resolution tick)
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isLive]);

  // Generate 60 high-fidelity telemetry points simulating real physiological cardiac & arterial PPG pulses
  const waveformData = Array.from({ length: 60 }, (_, i) => {
    const step = (i + tick * 0.8) % 20;

    // 1. Realistic ECG Lead II Waveform (P-Q-R-S-T)
    let ecg = 50; // Baseline
    if (step > 2 && step <= 4) ecg = 62; // P-Wave
    else if (step > 4 && step <= 5) ecg = 35; // Q-Wave
    else if (step > 5 && step <= 7) ecg = 160; // R-Spike (Ventricle depolarization)
    else if (step > 7 && step <= 8) ecg = 20; // S-Wave
    else if (step > 11 && step <= 14) ecg = 78; // T-Wave (Repolarization)
    else ecg = 50 + (Math.random() * 2 - 1); // Subtle baseline noise

    // 2. Realistic SpO2 Plethysmography Pulse (Systolic Peak, Dicrotic Notch, Diastolic Decay)
    let spo2 = 20; // Baseline
    if (step > 6 && step <= 9) spo2 = 20 + (step - 6) * 25; // Sharp Systolic Ascent (Up to ~95)
    else if (step > 9 && step <= 11) spo2 = 95 - (step - 9) * 15; // Initial Drop
    else if (step > 11 && step <= 13) spo2 = 65 + Math.sin(step) * 6; // Dicrotic Notch Bounce
    else if (step > 13 && step <= 18) spo2 = 65 - (step - 13) * 9; // Diastolic Decay back to baseline
    else spo2 = 20 + (Math.random() * 1.5 - 0.75); // Baseline noise

    // 3. Smooth Respiratory Wave (Sinusoidal Transthoracic Impedance)
    const respPhase = ((i + tick * 0.4) % 40) / 40 * Math.PI * 2;
    const resp = 50 + Math.sin(respPhase) * 35;

    return {
      time: `${i}`,
      ecg,
      spo2,
      resp
    };
  });

  const currentPatient = MOCK_PATIENTS.find(p => p.bedNumber === selectedBed) || MOCK_PATIENTS[0];
  const vitals = currentPatient.vitals;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans pb-12 selection:bg-teal-500 selection:text-white">
      {/* Top Header Controls Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight font-sans">
              Real-Time High-Fidelity Waveform Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE STREAM ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Continuous EKG Lead II, SpO2 Plethysmography (PPG), and Transthoracic Impedance Respiratory Waveforms.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
              showGrid
                ? 'bg-slate-800 text-teal-400 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            GRID: {showGrid ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setSweepSpeed(prev => (prev === '25mm/s' ? '50mm/s' : '25mm/s'))}
            className="px-3 py-2 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
          >
            SWEEP: {sweepSpeed}
          </button>

          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              isLive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
                : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/40'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isLive ? 'PAUSE TELEMETRY' : 'RESUME STREAM'}</span>
          </button>
        </div>
      </div>

      {/* Bed Selection Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
        {MOCK_PATIENTS.slice(0, 6).map((p) => {
          const isSelected = selectedBed === p.bedNumber;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedBed(p.bedNumber)}
              className={`p-3.5 rounded-2xl border text-left transition-all min-w-[150px] cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-500 shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="font-mono">{p.bedNumber}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    p.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="font-bold text-sm truncate mt-1">{p.name}</div>
              <div className="text-[10px] opacity-80 font-mono mt-0.5 flex items-center justify-between">
                <span>SpO2: {String(p.vitals.spo2.value)}%</span>
                <span>HR: {String(p.vitals.hr.value)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN ICU BEDSIDE TELEMETRY MONITOR CANVAS */}
      <div className="bg-[#050811] p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden font-sans">
        {/* CRT Scanline Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent pointer-events-none opacity-30 animate-pulse" />

        {/* Selected Patient Telemetry Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-800 text-teal-400 font-mono font-bold text-xs rounded-xl border border-slate-700 shadow-xs">
              {currentPatient.bedNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-sans">{currentPatient.name}</h2>
                <span className="text-[10px] font-mono text-slate-400">
                  MRN: {currentPatient.mrn} • {currentPatient.admittingDiagnosis}
                </span>
              </div>
            </div>
          </div>

          {/* Signal Quality & Status */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold text-[11px] tracking-wide">
                SIGNAL QUALITY: 99.4% (GOOD)
              </span>
            </div>
          </div>
        </div>

        {/* WAVEFORM CHANNEL 1: ECG LEAD II (mV) */}
        <div className="space-y-2 relative z-10 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-extrabold tracking-wider">ECG LEAD II (mV)</span>
              <span className="text-[10px] text-slate-500 font-normal">GAIN: 10mm/mV • FILTER: 0.5-40Hz</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-emerald-400 font-black font-mono text-3xl tracking-tight">
                {String(vitals.hr.value)}
              </span>
              <span className="text-emerald-500 text-xs font-bold">BPM</span>
            </div>
          </div>

          <div className="h-[140px] min-h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveformData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />}
                <YAxis hide domain={[0, 180]} />
                <Line
                  type="monotone"
                  dataKey="ecg"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WAVEFORM CHANNEL 2: SpO2 PLETHYSMOGRAPHY (%) */}
        <div className="space-y-2 relative z-10 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-extrabold tracking-wider">SpO2 PLETHYSMOGRAPHY (%)</span>
              <span className="text-[10px] text-slate-500 font-normal">PERFUSION INDEX: 4.8%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-cyan-400 font-black font-mono text-3xl tracking-tight">
                {String(vitals.spo2.value)}%
              </span>
              <span className="text-cyan-500 text-xs font-bold">SpO2</span>
            </div>
          </div>

          <div className="h-[140px] min-h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveformData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />}
                <YAxis hide domain={[0, 110]} />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WAVEFORM CHANNEL 3: RESPIRATORY WAVE (RESP / min) */}
        <div className="space-y-2 relative z-10 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-extrabold tracking-wider">RESPIRATORY WAVE (RESP / min)</span>
              <span className="text-[10px] text-slate-500 font-normal">IMPEDANCE PNEUMOGRAPHY</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-amber-400 font-black font-mono text-3xl tracking-tight">
                {String(vitals.rr.value)}
              </span>
              <span className="text-amber-500 text-xs font-bold">RPM</span>
            </div>
          </div>

          <div className="h-[120px] min-h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveformData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />}
                <YAxis hide domain={[0, 100]} />
                <Line
                  type="monotone"
                  dataKey="resp"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;

