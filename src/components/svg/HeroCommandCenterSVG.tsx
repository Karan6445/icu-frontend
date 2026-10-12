import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  ClipboardList,
  Activity,
  Cpu,
  Heart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  FileText,
  Monitor,
  Zap,
  Radio
} from 'lucide-react';

export const HeroCommandCenterSVG: React.FC = () => {
  // Animation Sequence Stage (0: Pulse, 1: Patient, 2: Doctor/Vitals, 3: Nurse/Devices, 4: Data Pulses, 5: Timeline, 6: Settled/Loop)
  const [stage, setStage] = useState<number>(0);

  // Clinical Data Orbit active index (0: VITALS, 1: NOTES, 2: DEVICES, 3: MEDS, 4: ALERTS)
  const [activeOrbit, setActiveOrbit] = useState<number>(0);

  // Timeline events reveal index (0 to 4)
  const [timelineIndex, setTimelineIndex] = useState<number>(0);

  // Main Sequence Loop (10-second cinematic cycle)
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 800);   // 1s: Patient Card Appears
    const timer2 = setTimeout(() => setStage(2), 2000);  // 2s: Doctor + Vitals
    const timer3 = setTimeout(() => setStage(3), 3500);  // 3.5s: Nurse + Devices
    const timer4 = setTimeout(() => setStage(4), 5000);  // 5s: Data Pulses Flow
    const timer5 = setTimeout(() => setStage(5), 6500);  // 6.5s: Timeline Appears

    // Timeline event reveal interval
    let timelineTimer: NodeJS.Timeout;
    if (stage >= 5) {
      setTimelineIndex(0);
      let count = 0;
      timelineTimer = setInterval(() => {
        count++;
        if (count <= 4) {
          setTimelineIndex(count);
        } else {
          clearInterval(timelineTimer);
          setStage(6); // Settle & Orbit Loop
        }
      }, 350);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      if (timelineTimer) clearInterval(timelineTimer);
    };
  }, [stage === 0]); // Reset when loop restarts

  // Continuous Orbit Highlight Switcher (every 2.5 seconds during settled state)
  useEffect(() => {
    const orbitInterval = setInterval(() => {
      setActiveOrbit((prev) => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(orbitInterval);
  }, []);

  // Total loop restart trigger every 14 seconds for continuous cinematic preview
  useEffect(() => {
    const loopInterval = setInterval(() => {
      setStage(0);
      setTimelineIndex(0);
    }, 15000);
    return () => clearInterval(loopInterval);
  }, []);

  // Orbit Nodes Configuration
  const orbitNodes = [
    { key: 'vitals', label: 'VITALS', tooltip: 'DATA UPDATED', icon: <Activity className="w-3 h-3 text-emerald-400" />, pos: 'top-2 left-1/2 -translate-x-1/2' },
    { key: 'notes', label: 'NOTES', tooltip: 'CLINICAL REMARKS', icon: <FileText className="w-3 h-3 text-blue-400" />, pos: 'top-10 left-4' },
    { key: 'devices', label: 'DEVICES', tooltip: 'STREAM VERIFIED', icon: <Monitor className="w-3 h-3 text-cyan-400" />, pos: 'top-10 right-4' },
    { key: 'meds', label: 'MEDS', tooltip: 'STATUS UPDATED', icon: <Pill className="w-3 h-3 text-purple-400" />, pos: 'bottom-12 left-6' },
    { key: 'alerts', label: 'ALERTS', tooltip: 'SUPPRESSED', icon: <AlertTriangle className="w-3 h-3 text-amber-400" />, pos: 'bottom-12 right-6' },
  ];

  // Timeline Events List
  const timelineEvents = [
    { time: '08:10', text: 'Vitals updated', icon: <Activity className="w-3 h-3 text-emerald-400" /> },
    { time: '09:05', text: 'Doctor review', icon: <Stethoscope className="w-3 h-3 text-blue-400" /> },
    { time: '10:20', text: 'Nurse note', icon: <ClipboardList className="w-3 h-3 text-cyan-400" /> },
    { time: '11:40', text: 'Medication recorded', icon: <Pill className="w-3 h-3 text-purple-400" /> },
    { time: '12:15', text: 'Alert generated', icon: <AlertTriangle className="w-3 h-3 text-amber-400" /> },
  ];

  return (
    <div className="relative group rounded-2xl w-full overflow-hidden select-none shadow-2xl">
      {/* Main Dark Clinical Mirror Flow Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-6 text-white min-h-[520px] flex flex-col justify-between shadow-2xl">
        {/* Ambient Radial Background Lights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Title Bar: ICU MIRROR FLOW Status */}
        <div className="flex items-center justify-between z-30 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">
              ICU MIRROR FLOW · CLINICAL SYMMETRY
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-[10px] font-mono text-cyan-300">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>0ms LATENCY</span>
          </div>
        </div>

        {/* ---------------- 0-1s: STAGE 0 INITIAL PULSE INDICATOR ---------------- */}
        {stage === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16 z-30">
            <motion.div
              className="text-cyan-400 font-mono text-2xl tracking-widest flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              transition={{ duration: 0.8 }}
            >
              <span>· ──╱╲── ·</span>
            </motion.div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
              Initializing Patient Stream...
            </p>
          </div>
        )}

        {/* ---------------- 1-10s: MAIN SYMMETRICAL MIRROR FLOW LAYOUT ---------------- */}
        {stage >= 1 && (
          <div className="relative flex-1 py-3 grid grid-cols-12 gap-3 items-center z-30">
            {/* SVG CONNECTION LINES OVERLAY */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 600 340"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lineGradLeft" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGradRight" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGradRedPulse" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                </linearGradient>

                <filter id="glowPulse" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Central Red Animated ECG Pulse Wave Line */}
              {stage >= 1 && (
                <motion.path
                  d="M 60,140 L 160,140 L 175,140 L 180,115 L 185,160 L 190,95 L 197,170 L 202,140 L 280,140 L 320,140 L 398,140 L 403,115 L 408,160 L 413,95 L 420,170 L 425,140 L 540,140"
                  stroke="url(#lineGradRedPulse)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ strokeDasharray: "600", strokeDashoffset: "600" }}
                  animate={{ strokeDashoffset: [600, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Doctor → Patient Connection Line */}
              {stage >= 2 && (
                <motion.path
                  d="M 140,65 Q 220,65 300,120"
                  stroke="url(#lineGradLeft)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              )}

              {/* Vitals → Patient Connection Line */}
              {stage >= 2 && (
                <motion.path
                  d="M 460,65 Q 380,65 300,120"
                  stroke="url(#lineGradRight)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              )}

              {/* Nurse → Patient Connection Line */}
              {stage >= 3 && (
                <motion.path
                  d="M 140,195 Q 220,195 300,150"
                  stroke="url(#lineGradLeft)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              )}

              {/* Devices → Patient Connection Line */}
              {stage >= 3 && (
                <motion.path
                  d="M 460,195 Q 380,195 300,150"
                  stroke="url(#lineGradRight)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              )}

              {/* STAGE 4: ANIMATED DATA PULSE PARTICLES TRAVELING ALONG LINES */}
              {stage >= 4 && (
                <>
                  <motion.circle
                    cx="140"
                    cy="65"
                    r="4.5"
                    fill="#ef4444"
                    filter="url(#glowPulse)"
                    animate={{ cx: [140, 300], cy: [65, 120] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.circle
                    cx="460"
                    cy="65"
                    r="4.5"
                    fill="#34d399"
                    filter="url(#glowPulse)"
                    animate={{ cx: [460, 300], cy: [65, 120] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.circle
                    cx="140"
                    cy="195"
                    r="4.5"
                    fill="#38bdf8"
                    filter="url(#glowPulse)"
                    animate={{ cx: [140, 300], cy: [195, 150] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.3 }}
                  />
                  <motion.circle
                    cx="460"
                    cy="195"
                    r="4.5"
                    fill="#f43f5e"
                    filter="url(#glowPulse)"
                    animate={{ cx: [460, 300], cy: [195, 150] }}
                    transition={{ duration: 2.1, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                  />
                </>
              )}
            </svg>

            {/* ---------------- LEFT COLUMN: CLINICAL TEAM ---------------- */}
            <div className="col-span-3 space-y-4 z-20">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/70 border border-blue-800 px-2 py-1 rounded text-center">
                CLINICAL TEAM
              </div>

              {/* DOCTOR CARD */}
              <AnimatePresence>
                {stage >= 2 && (
                  <motion.div
                    className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/40 shadow-lg space-y-1 hover:border-blue-400 transition-colors"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-900/80 border border-blue-700 flex items-center justify-center text-blue-300">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">DOCTOR</div>
                        <div className="text-[10px] text-blue-300 font-mono">Intensivist Review</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NURSE CARD */}
              <AnimatePresence>
                {stage >= 3 && (
                  <motion.div
                    className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg space-y-1 hover:border-cyan-400 transition-colors"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-900/80 border border-cyan-700 flex items-center justify-center text-cyan-300">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">NURSE</div>
                        <div className="text-[10px] text-cyan-300 font-mono">Care Notes & Vitals</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ---------------- CENTER COLUMN: PATIENT RECORD & CLINICAL DATA ORBIT ---------------- */}
            <div className="col-span-6 relative flex flex-col items-center justify-center z-20 py-2">
              {/* SPECIAL EFFECT: "CLINICAL DATA ORBIT" NODES */}
              {stage >= 1 && (
                <div className="absolute inset-0 pointer-events-none">
                  {orbitNodes.map((node, idx) => {
                    const isHighlighted = activeOrbit === idx;
                    return (
                      <div key={node.key} className={`absolute ${node.pos} transition-all duration-500`}>
                        <motion.div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-mono font-bold border transition-all ${
                            isHighlighted
                              ? 'bg-blue-900/90 border-cyan-400 text-white shadow-lg shadow-cyan-500/30 scale-110'
                              : 'bg-slate-900/60 border-slate-700 text-slate-400'
                          }`}
                          animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          {node.icon}
                          <span>◉ {node.label}</span>
                        </motion.div>

                        {/* Active Orbit Tooltip */}
                        {isHighlighted && (
                          <motion.div
                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-extrabold text-[8px] whitespace-nowrap shadow-md"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            ↑ {node.tooltip}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CENTER PATIENT CARD */}
              <AnimatePresence>
                {stage >= 1 && (
                  <motion.div
                    className="w-full max-w-[240px] p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-400/80 shadow-2xl shadow-emerald-950/50 text-center space-y-2 relative group"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold font-mono text-slate-400 border-b border-slate-800 pb-1.5">
                      <span>PATIENT RECORD</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        ICU-04
                      </span>
                    </div>

                    {/* ECG Pulsing Waveform Graphic */}
                    <div className="py-1">
                      <svg viewBox="0 0 160 30" className="w-full h-7 overflow-visible">
                        <motion.path
                          d="M 0,15 L 40,15 L 48,5 L 56,25 L 64,8 L 72,18 L 80,15 L 160,15"
                          stroke="#34d399"
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0.3, pathOffset: 0 }}
                          animate={{ pathOffset: [0, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                        />
                      </svg>
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-3 gap-1 py-1 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono font-bold">
                      <div className="p-1">
                        <div className="text-[9px] text-slate-400">HEART</div>
                        <div className="text-emerald-400 flex items-center justify-center gap-0.5">
                          <Heart className="w-3 h-3 fill-emerald-400 animate-ping" />
                          92
                        </div>
                      </div>
                      <div className="p-1 border-x border-slate-800">
                        <div className="text-[9px] text-slate-400">SpO₂</div>
                        <div className="text-cyan-400">96%</div>
                      </div>
                      <div className="p-1">
                        <div className="text-[9px] text-slate-400">MAP</div>
                        <div className="text-purple-400">74</div>
                      </div>
                    </div>

                    {/* Live Status Badge */}
                    <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>● LIVE TELEMETRY</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ---------------- RIGHT COLUMN: ICU DATA ---------------- */}
            <div className="col-span-3 space-y-4 z-20">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-1 rounded text-center">
                ICU DATA
              </div>

              {/* VITALS CARD */}
              <AnimatePresence>
                {stage >= 2 && (
                  <motion.div
                    className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg space-y-1 hover:border-emerald-400 transition-colors"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-700 flex items-center justify-center text-emerald-300">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">VITALS</div>
                        <div className="text-[10px] text-emerald-300 font-mono">HR 92 | SpO2 96%</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DEVICES CARD */}
              <AnimatePresence>
                {stage >= 3 && (
                  <motion.div
                    className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40 shadow-lg space-y-1 hover:border-purple-400 transition-colors"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-900/80 border border-purple-700 flex items-center justify-center text-purple-300">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">DEVICES</div>
                        <div className="text-[9px] text-purple-300 font-mono">Monitor · Vent · Infusion</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ---------------- 6.5–8s: STAGE 5 PATIENT TIMELINE REVEAL ---------------- */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              className="z-30 pt-2 border-t border-slate-800 space-y-1.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  PATIENT TIMELINE
                </span>
                <span className="text-[9px] font-mono text-emerald-400">AUTOMATED EVENT HISTORY</span>
              </div>

              {/* Sequential Event Reveal Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono">
                {timelineEvents.map((evt, idx) => {
                  const isVisible = idx <= timelineIndex;
                  return (
                    <motion.div
                      key={evt.time}
                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        isVisible
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                          : 'opacity-20 border-transparent'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {evt.icon}
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">{evt.time}</div>
                        <div className="text-[9px] truncate font-semibold">{evt.text}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
