import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Heart, 
  Thermometer, 
  Wind, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Server, 
  Cpu, 
  ArrowRight,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100/80 text-slate-700 relative overflow-hidden font-sans pt-12 pb-8 border-t-4 border-pink-400 shadow-lg">
      {/* Background Subtle Medical Radial Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================== */}
        {/* TOP MEDICAL ANIMATION TELEMETRY MONITOR BAR */}
        {/* ========================================== */}
        <div className="mb-12 bg-white/90 border border-pink-200 rounded-2xl p-4 md:p-6 shadow-md backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Live Indicator & Status */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-rose-800 uppercase">TELEMETRY STREAM LIVE</span>
                  <span className="px-2 py-0.5 rounded bg-pink-100 text-[10px] font-mono text-pink-800 font-bold border border-pink-300">FHIR v4.0</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">Bedside Sensors Syncing &bull; Latency: 8ms</p>
              </div>
            </div>

            {/* Live Animated ECG / Waveform Canvas Banner */}
            <div className="flex-1 max-w-xl w-full h-12 bg-slate-900 rounded-xl border border-pink-300/60 relative overflow-hidden flex items-center px-3 shadow-inner">
              {/* Background Grid Lines inside waveform */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:12px_12px] opacity-40"></div>

              <svg className="w-full h-10 relative z-10" viewBox="0 0 500 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="footerEcgRoseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Animated ECG Pulse Path */}
                <motion.path
                  d="M 0,20 L 60,20 L 70,20 L 75,10 L 80,32 L 85,4 L 92,36 L 97,20 L 105,20 L 180,20 L 190,20 L 195,8 L 200,34 L 205,2 L 212,38 L 217,20 L 225,20 L 300,20 L 310,20 L 315,12 L 320,30 L 325,6 L 332,34 L 337,20 L 345,20 L 420,20 L 430,20 L 435,10 L 440,32 L 445,4 L 452,36 L 457,20 L 500,20"
                  fill="none"
                  stroke="url(#footerEcgRoseGlow)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ strokeDasharray: "600", strokeDashoffset: "600" }}
                  animate={{ strokeDashoffset: [600, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              {/* Glowing Pulse Laser Head */}
              <motion.div
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-rose-400/40 to-rose-400 opacity-90 pointer-events-none"
                animate={{ left: ["-10%", "105%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Live Vitals Ticker Cards */}
            <div className="flex items-center gap-3 font-mono">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-100/90 border border-pink-300 text-rose-900 text-xs shadow-xs">
                <Heart className="w-4 h-4 text-rose-600 animate-pulse" />
                <div>
                  <span className="font-bold text-sm">72</span>
                  <span className="text-[10px] text-pink-700 ml-1">BPM</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-100/90 border border-pink-300 text-pink-900 text-xs shadow-xs">
                <Wind className="w-4 h-4 text-pink-600" />
                <div>
                  <span className="font-bold text-sm">99%</span>
                  <span className="text-[10px] text-pink-700 ml-1">SpO2</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-100/90 border border-pink-300 text-rose-900 text-xs shadow-xs">
                <Activity className="w-4 h-4 text-rose-600" />
                <div>
                  <span className="font-bold text-sm">120/80</span>
                  <span className="text-[10px] text-pink-700 ml-1">MAP 93</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================== */}
        {/* INTERACTIVE CALL TO ACTION / QUICK BANNER  */}
        {/* ========================================== */}
        <div className="mb-12 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-rose-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
          
          <div className="space-y-1 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-100" />
              <span>Next-Gen Clinical Decision Intelligence</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Ready to Upgrade Your ICU Telemetry Workflow?
            </h3>
            <p className="text-sm text-pink-100 max-w-xl">
              Connect bedside continuous monitors, automated scoring algorithms, and multi-role clinical dashboards in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-white text-rose-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-pink-50 transition-all flex items-center gap-2"
            >
              <span>Explore Clinical Cockpit</span>
              <ArrowRight className="w-4 h-4 text-rose-700" />
            </button>
            <a
              href="#platform"
              className="px-5 py-2.5 bg-rose-800/60 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl border border-white/30 transition-all"
            >
              System Architecture
            </a>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Info (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute -inset-x-6 inset-y-0 flex items-center pointer-events-none z-0">
                  <svg className="w-full h-8 overflow-visible opacity-90" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M 0 15 L 20 15 L 24 15 L 28 8 L 32 22 L 36 2 L 42 28 L 46 15 L 50 15 L 100 15"
                      stroke="#0F766E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-ecg-line"
                    />
                  </svg>
                </div>
                <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-1.5 shadow-md group-hover:border-teal-500 transition-colors overflow-hidden">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="z-10">
                <span className="text-base font-extrabold tracking-wider text-slate-900 uppercase font-sans leading-none block">
                  NAIMIFY <span className="text-teal-700">SMART ICU</span>
                </span>
                <p className="text-[11px] block mt-0.5">
                  <span className="font-serif italic font-semibold text-teal-800 text-[12px]">enfinix</span>
                  <span className="text-slate-400 mx-1.5 font-sans">|</span>
                  <span className="text-slate-600 font-medium text-[10px] font-sans">Smart Clinical Decision</span>
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm font-medium">
              Empowering intensive care clinicians with predictive organ dysfunction scoring, automated vital alarm triage, and real-time Tele-ICU continuous monitoring.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-4 border-b border-pink-200 pb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Standards & FHIR
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> HL7 FHIR v4.0.1 API</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> IEEE 11073 Bedside IoT</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DICOM Waveform Sync</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sepsis Early Warning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Shift Handover Protocol</li>
            </ul>
          </div>

          {/* Col 4: Safety & Disclaimer Box */}
          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-4 border-b border-pink-200 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              Safety & Governance
            </h4>
            <div className="p-3.5 bg-white rounded-xl border border-pink-200 text-[11px] leading-relaxed text-slate-700 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Clinical Decision Support</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-normal font-medium">
                Designed for clinical decision support & workflow optimization. Final medical interventions remain under licensed physician discretion.
              </p>
              <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="font-semibold text-rose-900">HIPAA & HITECH</span>
                <span className="text-emerald-700 font-bold">SOC 2 Type II</span>
              </div>
            </div>
          </div>

        </div>

       
        <div className="pt-6 border-t border-pink-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div className="flex items-center gap-3">
            <p className="font-medium">© 2026 Naimify Smart ICU Platform. All rights reserved.</p>
            <span className="hidden md:inline text-pink-300">|</span>
            <span className="hidden md:inline text-[11px] font-mono text-rose-800 font-semibold">Medical Prototype Interface</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] font-mono text-slate-600 font-medium">
            <span className="hover:text-rose-700 transition-colors cursor-pointer flex items-center gap-1">
              <Lock className="w-3 h-3 text-rose-600" /> 256-Bit Encrypted
            </span>
            <span className="hover:text-rose-700 transition-colors cursor-pointer flex items-center gap-1">
              <Radio className="w-3 h-3 text-rose-600" /> FHIR Telemetry Gateway
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" /> UTC Live Sync
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
