import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Activity, 
  Clock, 
  TrendingUp, 
  Bot, 
  ShieldCheck, 
  Wifi, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Layers
} from 'lucide-react';
import { HeroCommandCenterSVG } from '../../components/svg/HeroCommandCenterSVG';
import { DeviceTopology } from '../../components/svg/DeviceTopology';
import { HospitalNetwork } from '../../components/svg/HospitalNetwork';
import { SecurityArchitectureSVG } from '../../components/svg/SecurityArchitectureSVG';
import { DataQualityBadge } from '../../components/common/DataQualityBadge';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-clinical-navy via-slate-900 to-clinical-navy text-white pt-16 pb-20 overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-mono font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              NAIMIFY SMART ICU PLATFORM v2.0
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              One Intelligent View of the <span className="text-teal-400">ICU</span>.
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              Connect bedside devices, unify patient data, understand what changed, and give clinicians a trustworthy view of every critical patient.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/unit-selection"
                className="bg-clinical-blue hover:bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm group"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/command-center"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3.5 rounded-xl transition-all text-sm"
              >
                View ICU Command Center
              </Link>
            </div>

            <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center font-mono">
              <div>
                <span className="text-2xl font-black text-white block">100%</span>
                <span className="text-[11px] text-slate-400">Device Agnostic</span>
              </div>
              <div>
                <span className="text-2xl font-black text-teal-400 block">&lt; 3s</span>
                <span className="text-[11px] text-slate-400">Telemetry Latency</span>
              </div>
              <div>
                <span className="text-2xl font-black text-rose-400 block">Zero</span>
                <span className="text-[11px] text-slate-400">False Confidence</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Mockup */}
          <div className="lg:col-span-7">
            <HeroCommandCenterSVG />
          </div>
        </div>
      </section>

      {/* Section 1: Clinical Intelligence */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-clinical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Clinical Intelligence Engine
          </span>
          <h2 className="text-3xl font-extrabold text-clinical-navy">
            Turn fragmented ICU data into clinical context.
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Bedside monitors, ventilators, and pumps continuously generate thousands of data points. INTELLIGENT ICU aggregates every stream onto one synchronized timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm hover:shadow-clinical-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Unified Patient Timeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vitals, ventilator settings, infusion rates, lab results, procedures, and clinical notes plotted on one synchronized time axis.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm hover:shadow-clinical-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Meaningful Change Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic change engine highlights parameter shifts since the doctor's last review. Reduces cognitive overload during shift handoffs.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm hover:shadow-clinical-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Grounded ICU Copilot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Natural-language clinical summaries strictly grounded in available patient data, complete with exact timestamps and source device references.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm hover:shadow-clinical-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Explainable Clinical Flags</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every flag explicitly reveals the underlying data window, telemetry quality state, and device source—never a black-box opacity.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Device Interoperability */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Multi-Vendor Gateway Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-clinical-navy mt-2">
            Every device. One patient record.
          </h2>
        </div>
        <DeviceTopology />
      </section>

      {/* Section 3: Change Detection Demonstration */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-slate-900 to-clinical-navy text-white rounded-2xl p-8 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 bg-amber-950 px-3 py-1 rounded border border-amber-800">
              Shift Handoff Engine
            </span>
            <h3 className="text-2xl font-extrabold">What changed since your last review?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Incoming clinicians frequently spend 20+ minutes trying to deduce what occurred while off-duty. Change Review instantly presents parameter deltas with sustained durations and source device verification.
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-rose-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Deterministic rule evaluation (No black-box hallucination)</span>
              </div>
              <div className="flex items-center gap-2 text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sustained baseline vs. current window comparison</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-rose-400 font-bold">MEANINGFUL CHANGE DETECTED</span>
              <span className="text-[10px] text-slate-400">12:41 IST · Bedside Monitor 07</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">PARAMETER</span>
                <span className="text-base font-bold text-white">SpO2</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">BEFORE → AFTER</span>
                <span className="text-base font-bold text-rose-400">97% → 91%</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">DELTA / DURATION</span>
                <span className="text-base font-bold text-amber-400">-6% (8 min)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: ICU Copilot Mock Chat */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-clinical-lg p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Grounded ICU Copilot Interface</h3>
              <p className="text-xs text-slate-500">Assistive natural language summarization with source citations.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* User Prompt */}
            <div className="flex justify-end">
              <div className="bg-clinical-blue text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-lg shadow">
                <p className="font-medium">What changed in the last 6 hours for Bed 07?</p>
              </div>
            </div>

            {/* Copilot Grounded Response */}
            <div className="flex justify-start">
              <div className="bg-slate-100 border border-slate-200 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-2xl space-y-3">
                <p className="leading-relaxed font-medium">
                  During the last 6 hours for patient Rajesh Sharma (Bed 07), the following key events occurred:
                </p>
                <ul className="space-y-2 list-disc list-inside text-slate-700">
                  <li>
                    <strong className="text-slate-900">12:41 — SpO2 decreased</strong> from 96% to 91%.
                    <span className="ml-2 font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      [12:41 · Mindray Monitor 07 · LIVE]
                    </span>
                  </li>
                  <li>
                    <strong className="text-slate-900">12:35 — Heart rate escalated</strong> from 82 to 104 bpm.
                    <span className="ml-2 font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      [12:35 · Mindray Monitor 07 · LIVE]
                    </span>
                  </li>
                  <li>
                    <strong className="text-slate-900">12:15 — Ventilator PEEP increased</strong> from 8 to 10 cmH2O and FiO2 to 60%.
                    <span className="ml-2 font-mono text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      [12:15 · Hamilton Ventilator 07 · LIVE]
                    </span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Assistive summary only. Verify all clinical decisions against raw telemetry sources.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Data Trust & Quality Layer */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-clinical-navy">Never guess data freshness.</h2>
          <p className="text-xs text-slate-600 mt-2">
            Every critical stream explicitly displays telemetry quality state so clinicians never have false confidence in stale or delayed data.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-clinical-sm text-center space-y-2">
            <DataQualityBadge quality="LIVE" size="lg" />
            <p className="text-[11px] text-slate-600">Active streaming telemetry (&lt; 3s delay)</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-clinical-sm text-center space-y-2">
            <DataQualityBadge quality="DELAYED" size="lg" />
            <p className="text-[11px] text-slate-600">Network latency buffer active (30s - 5m)</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-clinical-sm text-center space-y-2">
            <DataQualityBadge quality="STALE" size="lg" />
            <p className="text-[11px] text-slate-600">Telemetry packet timeout (&gt; 5m)</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-clinical-sm text-center space-y-2">
            <DataQualityBadge quality="DISCONNECTED" size="lg" />
            <p className="text-[11px] text-slate-600">Physical bedside device unmapped/offline</p>
          </div>
        </div>
      </section>

      {/* Section 6: Security & Governance */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold text-clinical-navy">Enterprise Security & Compliance</h2>
        </div>
        <SecurityArchitectureSVG />
      </section>

      {/* Section 7: India-First Deployment */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            India-First Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-clinical-navy mt-2">
            On-Premise & Edge-Ready Infrastructure
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
            Built for low-bandwidth networks, mixed legacy device fleets, and regional hospital command centers.
          </p>
        </div>
        <HospitalNetwork />
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-clinical-navy text-white rounded-3xl p-12 text-center space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-extrabold">Build a more connected ICU.</h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Experience the next-generation clinical operating platform for modern critical care teams.
            </p>
            <div className="pt-4">
              <Link
                to="/unit-selection"
                className="inline-flex items-center gap-2 bg-clinical-blue hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-xl transition-all"
              >
                <span>Explore Intelligent ICU Platform</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
