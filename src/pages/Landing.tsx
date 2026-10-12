import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScoringCounter } from '../components/ui/ScoringCounter';
import {
  Activity,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ClipboardList,
  Users,
  Lock,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Server,
  Database,
  ArrowRightLeft,
  Gauge,
  TrendingUp,
  Cpu,
  Monitor
} from 'lucide-react';
import { HeroCommandCenterSVG } from '../components/svg/HeroCommandCenterSVG';
import { ThreeDMedicalClipboardSVG } from '../components/svg/ThreeDMedicalClipboardSVG';
import icuClinicianImage from '../assets/images/icu-bedside-clinician.jpg';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Landing page is strictly light mode
    document.documentElement.classList.remove('dark');

    return () => {
      // When leaving the landing page, restore dark mode if saved in preferences
      const saved = localStorage.getItem('icu_theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="landing-page min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans selection:bg-blue-900 selection:text-white">
      {/* Sticky Light Header */}
      <Navbar />

      {/* 1. HERO SECTION (ICU MIRROR FLOW CINEMATIC ANIMATION) */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-950 text-xs font-black tracking-wide shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NAIMIFY SMART ICU PLATFORM</span>
                <span className="text-blue-700 font-mono text-[11px] font-bold border-l border-blue-300 pl-2">● SYSTEM ONLINE</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  One ICU.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-teal-700">
                    One connected patient story.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl font-bold text-blue-900">
                  From ICU Data to Clinical Action.
                </p>
              </div>

              <p className="text-base text-slate-600 leading-relaxed font-normal">
                Connect clinicians, patient vitals, medical records, care notes, medication workflows and real-time alerts in one intelligent ICU platform.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/login')}
                  className="shadow-md shadow-blue-900/20"
                >
                  Explore the Platform →
                </Button>
                <a
                  href="#how-it-works"
                  className="px-5 py-3 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-xs"
                >
                  See How It Works
                </a>
              </div>

              {/* Mini Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time ICU data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Role-based workflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Complete patient history</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Intelligent alerts</span>
                </div>
              </div>
            </div>

            {/* Right Side: ICU MIRROR FLOW Animation Component */}
            <div className="lg:col-span-6 relative">
              <HeroCommandCenterSVG />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="py-5 bg-white border-b border-slate-200 text-xs text-slate-700 font-semibold shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">System Guarantees:</span>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-600" /> Real-time Telemetry</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Explainable Intelligence</div>
          <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-600" /> Interoperable Gateway</div>
          <div className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-amber-600" /> Auditable History</div>
          <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-purple-600" /> Secure On-Premise</div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION WITH IMPRESSIVE CONTENT CARDS */}
      <section id="about-us" className="relative py-20 bg-gradient-to-b from-sky-50/80 via-blue-50/60 to-slate-50 border-b border-sky-200 overflow-hidden">
        {/* Background Subtle Medical Radial Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-widest shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>ABOUT INTELLIGENT ICU</span>
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Built for Zero-Delay Critical Care
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Unifying fragmented bedside monitors, predictive organ dysfunction analytics, and multi-role clinical cockpits into one intelligent patient narrative.
            </p>
          </div>

          {/* 4 Impressive About Us Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Clinical Mission */}
            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-blue-400 transition-all backdrop-blur-md space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6 text-blue-800" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  Clinical Mission
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Eliminating data silos by converting raw numbers into actionable clinical context for intensivists and ICU nurses.
                </p>
              </div>
            </div>

            {/* Card 2: Grounded Intelligence */}
            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-emerald-400 transition-all backdrop-blur-md space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-emerald-800" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  Safety &amp; Compliance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Zero black-box decisions. All predictive trend alerts are grounded in auditable physiological parameters and HIPAA standards.
                </p>
              </div>
            </div>

            {/* Card 3: Alarm Triage (Light Red Card Surface) */}
            <div className="bg-red-50/90 p-6 rounded-2xl border border-red-200 shadow-lg hover:shadow-red-200/70 hover:border-red-400 transition-all backdrop-blur-md space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-300 text-red-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-red-950 group-hover:text-red-900 transition-colors">
                  Alarm Triage
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  Intelligent suppression of false-positive nuisance alarms, reducing clinician cognitive fatigue in high-stress wards.
                </p>
              </div>
            </div>

            {/* Card 4: ICU Copilot */}
            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-indigo-400 transition-all backdrop-blur-md space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-indigo-800" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                  ICU Copilot
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Real-time AI clinical assistant helping intensivists &amp; nurses with automated checkup remarks, organ risk trends, and shift handover summaries.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PROBLEM SECTION WITH LIGHT SKY BLUE MIRRORED BACKGROUND */}
      <section className="relative py-24 overflow-hidden border-y border-sky-200 bg-gradient-to-b from-sky-50 via-sky-100/60 to-blue-50 text-slate-900">
        {/* Dual Mirrored Background Image Layer with Sky Blue Tint */}
        <div className="absolute inset-0 z-0 flex pointer-events-none opacity-20 mix-blend-multiply filter contrast-125">
          {/* Left Normal Image */}
          <div className="w-1/2 h-full relative overflow-hidden">
            <img 
              src={icuClinicianImage} 
              alt="ICU Bedside Telemetry Left Mirror" 
              className="w-full h-full object-cover object-center" 
            />
          </div>
          {/* Right Mirrored Image (flipped horizontally) */}
          <div className="w-1/2 h-full relative overflow-hidden">
            <img 
              src={icuClinicianImage} 
              alt="ICU Bedside Telemetry Right Mirror" 
              className="w-full h-full object-cover object-center scale-x-[-1]" 
            />
          </div>
        </div>

        {/* Soft Radial Grid for Sky Blue Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Animated Background Pulse Rate ECG Wave Canvas */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 h-48 pointer-events-none opacity-40 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bgEcgPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="30%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#2563eb" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Continuous Pulse Rate ECG Waveform */}
            <motion.path
              d="M 0,80 L 100,80 L 120,80 L 130,40 L 140,130 L 150,10 L 165,150 L 175,80 L 190,80 L 300,80 L 320,80 L 330,40 L 340,130 L 350,10 L 365,150 L 375,80 L 390,80 L 500,80 L 520,80 L 530,40 L 540,130 L 550,10 L 565,150 L 575,80 L 590,80 L 700,80 L 720,80 L 730,40 L 740,130 L 750,10 L 765,150 L 775,80 L 790,80 L 900,80 L 920,80 L 930,40 L 940,130 L 950,10 L 965,150 L 975,80 L 990,80 L 1100,80 L 1120,80 L 1130,40 L 1140,130 L 1150,10 L 1165,150 L 1175,80 L 1200,80"
              fill="none"
              stroke="url(#bgEcgPulseGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeDasharray: "1200", strokeDashoffset: "1200" }}
              animate={{ strokeDashoffset: [1200, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Sweeping Pulse Rate Scanning Dot */}
          <motion.div
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-rose-500/40 to-sky-500/50 pointer-events-none"
            animate={{ left: ["-10%", "105%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Pulsing Medical Heartbeat Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <motion.div
            className="w-96 h-96 rounded-full border border-sky-400/30"
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 w-96 h-96 rounded-full border border-rose-400/30"
            animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-widest shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>THE ICU SOLUTION</span>
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              ICU data is everywhere.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-indigo-800 to-teal-700">
                Clinical context shouldn't be.
              </span>
            </h3>
            <p className="text-sm sm:text-base text-slate-700 max-w-xl mx-auto font-medium">
              Solving critical care fragmentation by bridging isolated bedside monitors and unifying patient telemetry into a single intelligent story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Unified Device Hub */}
            <div className="p-6 rounded-2xl bg-white/90 border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-blue-400 transition-all backdrop-blur-md space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <Monitor className="w-5 h-5 text-blue-800" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">Unified Device Hub</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Instantly unifies bedside monitors, ventilators, and infusion pumps into a single vendor-neutral continuous stream.
              </p>
            </div>

            {/* Card 2: Smart Contextual Triage */}
            <div className="p-6 rounded-2xl bg-white/90 border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-emerald-400 transition-all backdrop-blur-md space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-emerald-800" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">Smart Contextual Triage</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Filters out false-positive nuisance alarms and synthesizes multi-parameter vitals into clear, actionable clinical context.
              </p>
            </div>

            {/* Card 3: Early Trend Detection */}
            <div className="p-6 rounded-2xl bg-white/90 border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-purple-400 transition-all backdrop-blur-md space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-purple-800" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-900 transition-colors">Early Trend Detection</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Automatically highlights subtle physiological shifts like gradual MAP drops or SpO2 changes before decompensation occurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW THE SYSTEM WORKS (WORKFLOW DIAGRAM) */}
      <section id="how-it-works" className="relative py-24 overflow-hidden border-b border-sky-200 bg-gradient-to-b from-blue-50 via-sky-50 to-slate-50">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Animated Background Pulse Rate ECG Wave Canvas */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 h-48 pointer-events-none opacity-40 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bgWorkflowEcgPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="40%" stopColor="#2563eb" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Continuous Pulse Rate ECG Waveform */}
            <motion.path
              d="M 0,80 L 100,80 L 120,80 L 130,40 L 140,130 L 150,10 L 165,150 L 175,80 L 190,80 L 300,80 L 320,80 L 330,40 L 340,130 L 350,10 L 365,150 L 375,80 L 390,80 L 500,80 L 520,80 L 530,40 L 540,130 L 550,10 L 565,150 L 575,80 L 590,80 L 700,80 L 720,80 L 730,40 L 740,130 L 750,10 L 765,150 L 775,80 L 790,80 L 900,80 L 920,80 L 930,40 L 940,130 L 950,10 L 965,150 L 975,80 L 990,80 L 1100,80 L 1120,80 L 1130,40 L 1140,130 L 1150,10 L 1165,150 L 1175,80 L 1200,80"
              fill="none"
              stroke="url(#bgWorkflowEcgPulseGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeDasharray: "1200", strokeDashoffset: "1200" }}
              animate={{ strokeDashoffset: [1200, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Sweeping Pulse Rate Scanning Dot */}
          <motion.div
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-blue-500/40 to-emerald-500/50 pointer-events-none"
            animate={{ left: ["-10%", "105%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Pulsing Medical Heartbeat Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <motion.div
            className="w-[450px] h-[450px] rounded-full border border-blue-400/30"
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 w-[450px] h-[450px] rounded-full border border-emerald-400/30"
            animate={{ scale: [1, 1.7, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-widest shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>CONNECTED WORKFLOW</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">How the Intelligent ICU System Works</h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
              From administrative admission to doctor checkups, nurse care records, medicine administration, and seamless shift handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-blue-400 transition-all backdrop-blur-md relative group">
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">STEP 01</span>
              <h4 className="text-base font-bold text-slate-900 mt-4 mb-2 group-hover:text-blue-900 transition-colors">System Admin Assignment</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Admin admits patient P-1024, assigns Bed ICU-04, designates Attending Doctor and Primary Nurse.
              </p>
            </div>

            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-blue-400 transition-all backdrop-blur-md relative group">
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">STEP 02</span>
              <h4 className="text-base font-bold text-slate-900 mt-4 mb-2 group-hover:text-blue-900 transition-colors">Role-Based Staff Login</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Doctor and Nurse log in securely. Personalized cockpits load assigned patients and task queues.
              </p>
            </div>

            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-blue-400 transition-all backdrop-blur-md relative group">
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">STEP 03</span>
              <h4 className="text-base font-bold text-slate-900 mt-4 mb-2 group-hover:text-blue-900 transition-colors">Checkups, Vitals & Notes</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Nurse inputs vitals & organ assessments. Doctor records clinical checkup remarks into append-only history.
              </p>
            </div>

            <div className="bg-white/90 p-6 rounded-2xl border border-sky-200/90 shadow-lg hover:shadow-sky-200/60 hover:border-blue-400 transition-all backdrop-blur-md relative group">
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">STEP 04</span>
              <h4 className="text-base font-bold text-slate-900 mt-4 mb-2 group-hover:text-blue-900 transition-colors">Shift Handover & Retained History</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Incoming staff review complete previous doctor remarks, nurse care notes, and active alerts before starting shift.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FULL-WIDTH LANDSCAPE 24/7 ICU CARE SHOWCASE WITH PULSE ANIMATION OVERLAY */}
      <section id="roles" className="relative py-16 sm:py-20 bg-gradient-to-b from-slate-50 via-sky-50/70 to-slate-50 border-b border-sky-200 overflow-hidden">
        {/* Animated Background Pulse Rate Canvas */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 h-40 pointer-events-none opacity-30 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 160" preserveAspectRatio="none">
            <motion.path
              d="M 0,80 L 100,80 L 120,80 L 130,40 L 140,130 L 150,10 L 165,150 L 175,80 L 190,80 L 300,80 L 320,80 L 330,40 L 340,130 L 350,10 L 365,150 L 375,80 L 390,80 L 500,80 L 520,80 L 530,40 L 540,130 L 550,10 L 565,150 L 575,80 L 590,80 L 700,80 L 720,80 L 730,40 L 740,130 L 750,10 L 765,150 L 775,80 L 790,80 L 900,80 L 920,80 L 930,40 L 940,130 L 950,10 L 965,150 L 975,80 L 990,80 L 1100,80 L 1120,80 L 1130,40 L 1140,130 L 1150,10 L 1165,150 L 1175,80 L 1200,80"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeDasharray: "1200", strokeDashoffset: "1200" }}
              animate={{ strokeDashoffset: [1200, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-widest shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CONTINUOUS BEDSIDE TELEMETRY</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              24/7 ICU Care &amp; Clinical Command
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto">
              Advanced critical care monitoring unifying bedside devices, real-time alerts, and clinician decision support in one landscape view.
            </p>
          </div>

          {/* Panoramic Landscape Hero Image Banner */}
          <div className="relative group rounded-3xl p-2 sm:p-3 bg-white/80 border-4 sm:border-6 border-sky-200 shadow-2xl transition-all duration-300 hover:shadow-sky-300/50 w-full overflow-hidden backdrop-blur-md">

            {/* Landscape Panoramic Image Container (Aspect 21/9 or 16/9, crystal sharp) */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/9] sm:aspect-[21/9] min-h-[420px] max-h-[580px] w-full">
              
              {/* Symmetrical Dual Landscape Mirror Background Layer */}
              <div className="absolute inset-0 flex">
                {/* Left Image */}
                <div className="w-1/2 h-full relative overflow-hidden">
                  <img
                    src={icuClinicianImage}
                    alt="24/7 ICU Care Telemetry Left"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Right Mirrored Image */}
                <div className="w-1/2 h-full relative overflow-hidden border-l border-sky-400/30">
                  <img
                    src={icuClinicianImage}
                    alt="24/7 ICU Care Telemetry Right Mirror"
                    className="w-full h-full object-cover object-center scale-x-[-1] transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Minimal Gradient Vignette Overlay for Crisp White Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

              {/* Floating Vitals Badge Ticker inside Landscape Banner */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-wrap items-center gap-2 font-mono">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ECG: 72 BPM (Sinus)
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-cyan-400 border border-cyan-500/50 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                  SpO2: 99%
                </span>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-slate-900/90 text-purple-400 border border-purple-500/50 text-xs font-bold shadow-lg backdrop-blur-md">
                  MAP: 93 mmHg
                </span>
              </div>

              {/* Text Directly Overlaid on Landscape Image */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-20">
                <div className="space-y-2 max-w-4xl">
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800">
                    REAL-TIME LANDSCAPE VIEW
                  </span>
                  <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-xl">
                    24/7 ICU Care — Advanced Critical Care with Continuous Telemetry
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DATA QUALITY LAYER SECTION (POSITIVE HIGH-TECH TELEMETRY PILLARS) */}
      <section className="relative py-24 overflow-hidden border-b border-sky-200 bg-gradient-to-b from-sky-50 via-blue-50/60 to-slate-50">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />


        {/* Animated Background Pulse Rate ECG Wave Canvas */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 h-48 pointer-events-none opacity-40 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bgIntegrityEcgPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Continuous Pulse Rate ECG Waveform */}
            <motion.path
              d="M 0,80 L 100,80 L 120,80 L 130,40 L 140,130 L 150,10 L 165,150 L 175,80 L 190,80 L 300,80 L 320,80 L 330,40 L 340,130 L 350,10 L 365,150 L 375,80 L 390,80 L 500,80 L 520,80 L 530,40 L 540,130 L 550,10 L 565,150 L 575,80 L 590,80 L 700,80 L 720,80 L 730,40 L 740,130 L 750,10 L 765,150 L 775,80 L 790,80 L 900,80 L 920,80 L 930,40 L 940,130 L 950,10 L 965,150 L 975,80 L 990,80 L 1100,80 L 1120,80 L 1130,40 L 1140,130 L 1150,10 L 1165,150 L 1175,80 L 1200,80"
              fill="none"
              stroke="url(#bgIntegrityEcgPulseGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeDasharray: "1200", strokeDashoffset: "1200" }}
              animate={{ strokeDashoffset: [1200, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Sweeping Pulse Rate Scanning Dot */}
          <motion.div
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-cyan-500/40 to-emerald-500/50 pointer-events-none"
            animate={{ left: ["-10%", "105%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-950 text-xs font-black uppercase tracking-widest shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
              <span>TELEMETRY INTEGRITY</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">4-Pillar Telemetry Assurance</h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
              Continuous validation, fail-safe buffering, and automated health audits ensure 100% confidence in every clinical reading.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Real-Time Telemetry Sync */}
            <div className="bg-white/90 p-6 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-emerald-200/60 transition-all backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-emerald-800 font-mono">REAL-TIME ●</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">Sub-Second</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Real-Time Sync</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Continuous high-frequency waveform streaming with sub-second synchronization across all bedside monitors.
              </p>
            </div>

            {/* Card 2: Smart Buffer & Latency Shield */}
            <div className="bg-white/90 p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-blue-200/60 transition-all backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-blue-800 font-mono">BUFFERED ★</span>
                <span className="text-[10px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-mono font-bold">Zero Loss</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Smart Buffer Shield</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Automatic fail-safe packet buffering ensures uninterrupted clinical vitals history even during network shifts.
              </p>
            </div>

            {/* Card 3: Automated Trend Audit */}
            <div className="bg-white/90 p-6 rounded-2xl border border-purple-200 shadow-lg hover:shadow-purple-200/60 transition-all backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-purple-800 font-mono">AUDITED ✦</span>
                <span className="text-[10px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-mono font-bold">Continuous</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Automated Trend Audit</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Continuous physiological trend auditing and historical snapshot validation to ensure maximum diagnostic accuracy.
              </p>
            </div>

            {/* Card 4: Secure Device Gateway */}
            <div className="bg-white/90 p-6 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-cyan-200/60 transition-all backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-cyan-800 font-mono">PROTECTED ✔</span>
                <span className="text-[10px] text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded font-mono font-bold">Auto-Triage</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Secure Device Gateway</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Instant bio-medical gateway health monitoring and automated failover protocols for maximum patient safety.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FINAL LIGHT THEME CTA WITH ANIMATED 3D MEDICAL CLIPBOARD */}
      <section className="py-20 bg-gradient-to-b from-slate-50 via-blue-50/50 to-slate-100 border-b border-slate-200 text-center text-slate-900 relative overflow-hidden">
        {/* Background Atmosphere in Vacant Areas */}
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Ambient Heartbeat Pulse Across Background */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none opacity-10 overflow-hidden">
          <svg className="w-full h-20" viewBox="0 0 1200 80" fill="none" preserveAspectRatio="none">
            <path
              d="M 0 40 L 280 40 L 295 40 L 305 15 L 315 65 L 325 8 L 338 72 L 348 40 L 360 40 L 680 40 L 695 40 L 705 15 L 715 65 L 725 8 L 738 72 L 748 40 L 760 40 L 1200 40"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Left Vacant Space - Floating Telemetry Micro-Card (Desktop) */}
        <div className="hidden xl:flex absolute left-8 2xl:left-16 top-1/2 -translate-y-1/2 flex-col gap-3.5 z-10 pointer-events-none select-none">
          <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-lg shadow-blue-900/5 w-60 text-left space-y-2 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE TELEMETRY
              </span>
              <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                MICU-04
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono pt-1">
              <div className="bg-slate-50/90 rounded-lg p-1.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">HR</div>
                <div className="text-xs font-black text-slate-900">74</div>
                <div className="text-[9px] text-emerald-600 font-bold">bpm</div>
              </div>
              <div className="bg-slate-50/90 rounded-lg p-1.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">SpO2</div>
                <div className="text-xs font-black text-teal-700">99%</div>
                <div className="text-[9px] text-teal-600 font-bold">norm</div>
              </div>
              <div className="bg-slate-50/90 rounded-lg p-1.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">MAP</div>
                <div className="text-xs font-black text-slate-900">82</div>
                <div className="text-[9px] text-slate-500 font-bold">mmHg</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between pt-0.5">
              <span>Bedside Stream</span>
              <span className="text-emerald-600 font-bold">● Normal Sinus</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-3.5 py-2 shadow-xs flex items-center gap-2.5 w-max">
            <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">24 Beds Connected</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">&lt; 50ms</span>
          </div>
        </div>

        {/* Right Vacant Space - Floating Protocol & Safety Micro-Card (Desktop) */}
        <div className="hidden xl:flex absolute right-8 2xl:right-16 top-1/2 -translate-y-1/2 flex-col gap-3.5 z-10 pointer-events-none select-none">
          <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-lg shadow-blue-900/5 w-60 text-left space-y-2 transform rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                SAFETY & AUDIT
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono pt-1">
              <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">ISBAR Handover:</span>
                <span className="text-blue-700 font-bold text-[11px]">100% Logged</span>
              </div>
              <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">Acuity Triage:</span>
                <span className="text-emerald-700 font-bold text-[11px]">SOFA Active</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
              <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5 text-purple-600" /> 256-bit TLS</span>
              <span className="font-bold text-slate-700">NABH & HIPAA</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-3.5 py-2 shadow-xs flex items-center gap-2.5 w-max ml-auto">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800">Role-Based Cockpits</span>
            <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Doctor · Nurse</span>
          </div>
        </div>

        {/* Central Content (UNTOUCHED SIZE & LAYOUT) */}
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          {/* Animated 3D Medical Clipboard Badge */}
          <div className="flex justify-center">
            <ThreeDMedicalClipboardSVG className="w-28 h-28 sm:w-32 sm:h-32" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Build a more connected ICU workflow.
          </h2>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Bring patient data, 3D device telemetry, doctor checkups, nurse notes, medicines, and shift handovers into one trustworthy platform.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl text-base font-extrabold text-white bg-blue-900 hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/25 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Staff Login & Demo Access
              <ArrowRight className="w-5 h-5 text-blue-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
