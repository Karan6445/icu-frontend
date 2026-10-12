import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  Clock, 
  Sliders, 
  Maximize2, 
  Wifi, 
  ShieldAlert, 
  Heart, 
  Wind,
  Download,
  BookmarkPlus,
  RefreshCw
} from 'lucide-react';
import { HeartbeatWaveform } from '../../components/svg/HeartbeatWaveform';

export const WaveformsPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '30m' | 'Live'>('Live');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['ECG-II', 'SPO2-PLETH', 'ART-LINE', 'VENT-FLOW']);
  const [leadGain, setLeadGain] = useState<'1x' | '2x' | '0.5x'>('1x');
  const [sweepSpeed, setSweepSpeed] = useState<'25mm/s' | '50mm/s'>('25mm/s');

  const patient = {
    id: 'P-1024',
    name: 'Rahul Sharma',
    age: 42,
    gender: 'M',
    bedNumber: 'BED-04 (MICU-01)',
    mrn: 'MRN-8849201',
    device: 'Philips IntelliVue MX800 (SN: PH-88902)',
    sourceTime: '12:44:02.812 UTC+5:30',
    quality: 'CALIBRATED_100%'
  };

  const channelOptions = [
    { id: 'ECG-II', name: 'Lead II (ECG)', color: 'text-emerald-400', stroke: '#10B981', unit: 'mV', range: '-1.0 to +1.5 mV' },
    { id: 'ECG-V1', name: 'Lead V1 (ECG)', color: 'text-emerald-400', stroke: '#10B981', unit: 'mV', range: '-0.8 to +1.2 mV' },
    { id: 'SPO2-PLETH', name: 'SpO2 Plethysmograph', color: 'text-sky-400', stroke: '#38BDF8', unit: '%', range: '0 to 100%' },
    { id: 'ART-LINE', name: 'Arterial Blood Pressure', color: 'text-rose-400', stroke: '#F43F5E', unit: 'mmHg', range: '0 to 200 mmHg' },
    { id: 'VENT-FLOW', name: 'Ventilator Flow Waveform', color: 'text-amber-400', stroke: '#F59E0B', unit: 'L/min', range: '-60 to +60 L/min' }
  ];

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 08: HEADER (Patient; time range; channels) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-800 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 08
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {patient.bedNumber} · {patient.device}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>High-Fidelity Waveform Viewer</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Continuous calibrated physiological waveforms, ECG rhythm vectors, Plethysmography & ventilator loops.
          </p>
        </div>

        {/* CONTROLS (Live; pause; 1m; 5m; 30m; markers) */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Live / Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE LIVE' : 'RESUME LIVE'}</span>
          </button>

          {/* Time Range Chips */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {(['Live', '1m', '5m', '30m'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-teal-700 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Sweep Speed & Gain */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
            <span>Speed:</span>
            <button
              onClick={() => setSweepSpeed(s => s === '25mm/s' ? '50mm/s' : '25mm/s')}
              className="text-teal-700 dark:text-teal-400 font-bold hover:underline"
            >
              {sweepSpeed}
            </button>
            <span>· Gain:</span>
            <button
              onClick={() => setLeadGain(g => g === '1x' ? '2x' : g === '2x' ? '0.5x' : '1x')}
              className="text-teal-700 dark:text-teal-400 font-bold hover:underline"
            >
              {leadGain}
            </button>
          </div>

          {/* Insert Clinical Marker */}
          <button
            onClick={() => alert('Clinical rhythm marker inserted at timestamp: ' + new Date().toISOString())}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Add Clinical Event Marker"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline font-bold">Add Marker</span>
          </button>
        </div>
      </div>

      {/* Channel Toggles Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-mono shadow-xs">
        <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">CHANNELS:</span>
        {channelOptions.map(chan => {
          const isSelected = selectedChannels.includes(chan.id);
          return (
            <button
              key={chan.id}
              onClick={() => toggleChannel(chan.id)}
              className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-950/60 dark:border-slate-900 dark:text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? chan.stroke : '#94a3b8' }} />
              <span>{chan.name}</span>
            </button>
          );
        })}
      </div>

      {/* CANVAS AREA: ECG, SpO2, ART, VENTILATOR */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 font-mono relative overflow-hidden">
        {/* Subtle ECG grid background pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle, #10B981 1px, transparent 1px), radial-gradient(circle, #10B981 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />

        {selectedChannels.map(chanId => {
          const chan = channelOptions.find(c => c.id === chanId)!;
          return (
            <div key={chanId} className="relative z-10 border-b border-slate-900 pb-4 last:border-b-0 last:pb-0">
              {/* Channel Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-sm ${chan.color}`}>{chan.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">[{chan.range}]</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {chanId === 'ECG-II' && (
                    <span className="text-emerald-400 font-bold">HR: 88 bpm (Sinus)</span>
                  )}
                  {chanId === 'SPO2-PLETH' && (
                    <span className="text-sky-400 font-bold">SpO2: 98% · PI: 3.4</span>
                  )}
                  {chanId === 'ART-LINE' && (
                    <span className="text-rose-400 font-bold">ABP: 118/76 (MAP 90)</span>
                  )}
                  {chanId === 'VENT-FLOW' && (
                    <span className="text-amber-400 font-bold">PEEP: 10 · PIP: 28</span>
                  )}
                  <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    250 Hz
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Waveform trace */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-900 p-2 overflow-hidden">
                <HeartbeatWaveform
                  color={chan.stroke}
                  height={chanId === 'ECG-II' ? 80 : 64}
                  bpm={chanId === 'VENT-FLOW' ? 18 : 88}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER: Device; source time; quality */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>DEVICE: <strong className="text-white">{patient.device}</strong></span>
          <span>·</span>
          <span>SOURCE TIME: <strong className="text-teal-300">{patient.sourceTime}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <Wifi className="w-3.5 h-3.5" /> {patient.quality}
          </span>
          <span className="text-slate-600">|</span>
          <span>Downsampling: 1:1 Live Buffer</span>
        </div>
      </div>
    </div>
  );
};

export default WaveformsPage;
