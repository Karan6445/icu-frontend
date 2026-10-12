import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, Cpu, Heart, Globe, Lock } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinical-bg text-clinical-slate flex flex-col selection:bg-clinical-teal selection:text-white">
      {/* Public Header Nav */}
      <header className="sticky top-0 z-50 bg-clinical-navy/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative">
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
              <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-900 border border-teal-500/30 flex items-center justify-center p-1.5 shadow-glow group-hover:scale-105 transition-transform overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="z-10">
              <span className="font-black text-lg tracking-wider font-mono text-white block leading-none">
                NAIMIFY SMART ICU
              </span>
              <span className="text-[11px] block mt-0.5">
                <span className="font-serif italic font-semibold text-teal-400 text-[12px]">enfinix</span>
                <span className="opacity-60 mx-1.5 font-sans">|</span>
                <span className="font-medium text-slate-300 text-[10px] font-sans">Smart Clinical Decision</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-teal-400 font-bold' : 'hover:text-white transition-colors'}>
              Overview
            </NavLink>
            <NavLink to="/features" className={({ isActive }) => isActive ? 'text-teal-400 font-bold' : 'hover:text-white transition-colors'}>
              Clinical Intelligence
            </NavLink>
            <NavLink to="/platform" className={({ isActive }) => isActive ? 'text-teal-400 font-bold' : 'hover:text-white transition-colors'}>
              Device Interoperability
            </NavLink>
            <NavLink to="/security" className={({ isActive }) => isActive ? 'text-teal-400 font-bold' : 'hover:text-white transition-colors'}>
              Security & India-First
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-teal-400 font-bold' : 'hover:text-white transition-colors'}>
              About Platform
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-teal-400 font-bold' : 'hover:text-white transition-colors'}>
              Hospital Demo
            </NavLink>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-200 hover:text-white px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/unit-selection"
              className="text-xs font-bold bg-clinical-blue text-white hover:bg-blue-600 px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>Explore ICU Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Public Footer */}
      <footer className="bg-clinical-navy text-slate-400 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-teal-500/30 flex items-center justify-center p-1 overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-base font-mono">NAIMIFY SMART ICU</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Hospital-grade real-time critical care platform connecting bedside devices, unifying patient records, detecting meaningful changes, and empowering clinician decision workflows.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-400 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>India-First Edge Architecture · On-Premise Ready</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Platform Capabilities</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-white transition-colors">Unified Patient Timeline</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Meaningful Change Engine</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Grounded ICU Copilot</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Data Quality Layer (LIVE/STALE)</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Hospital Workflows</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/unit-selection" className="hover:text-white transition-colors">Screen 01 - Login & Unit Selection</Link></li>
              <li><Link to="/command-center" className="hover:text-white transition-colors">Screen 02 - ICU Command Center</Link></li>
              <li><Link to="/patient/P-1024" className="hover:text-white transition-colors">Screen 03 - Patient Dashboard</Link></li>
              <li><Link to="/patient/P-1024/timeline" className="hover:text-white transition-colors">Screen 04 - Patient Timeline</Link></li>
              <li><Link to="/patient/P-1024/changes" className="hover:text-white transition-colors">Screen 05 - Change Review</Link></li>
              <li><Link to="/patient/P-1024/copilot" className="hover:text-white transition-colors">Screen 06 - ICU Copilot</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Governance & Regulatory</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Designed according to hospital data security standards, ISO 13485 quality systems, and Indian medical device regulatory classification guidelines.
            </p>
            <span className="inline-block bg-slate-800 text-teal-400 text-[10px] font-mono px-2.5 py-1 rounded border border-slate-700">
              v2.0 Technical Development Build
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NAIMIFY SMART ICU Platform. All rights reserved. "One patient. One timeline. Every device."</p>
          <div className="flex items-center gap-6">
            <Link to="/security" className="hover:text-slate-300">Privacy & Security</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact Engineering</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
