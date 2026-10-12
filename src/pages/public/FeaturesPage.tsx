import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Bot, ShieldCheck, ArrowRight, Activity, Zap, CheckCircle } from 'lucide-react';
import { ClinicalTimeline } from '../../components/svg/ClinicalTimeline';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-clinical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Platform Capabilities
        </span>
        <h1 className="text-4xl font-extrabold text-clinical-navy">Clinical Intelligence & Workflow Features</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Designed specifically to eliminate data fragmentation, reduce clinician cognitive load, and provide explainable clinical context at every bed.
        </p>
      </div>

      {/* Synchronized Timeline Highlight */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-clinical-blue" />
          <h2 className="text-2xl font-bold text-slate-900">1. Synchronized Patient Timeline</h2>
        </div>
        <p className="text-xs text-slate-600 max-w-3xl">
          Unlike static EHR tab views, the Intelligent Patient Timeline places continuous telemetry, intermittent lab results, ventilator adjustments, infusion titrations, and clinical notes onto one master time axis.
        </p>
        <ClinicalTimeline />
      </div>

      {/* Feature Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm space-y-4">
          <TrendingUp className="w-8 h-8 text-teal-600" />
          <h3 className="font-bold text-xl text-slate-900">Meaningful Change Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluates parameter baseline shifts over 10-minute windows vs current 2-minute sustained averages to alert incoming clinicians to true physiological changes rather than transient noise.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 font-mono pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-600" /> Sustained SpO2 & MAP deltas</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-600" /> Ventilator mode & PEEP changes</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-600" /> Vasopressor rate adjustments</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm space-y-4">
          <Bot className="w-8 h-8 text-purple-600" />
          <h3 className="font-bold text-xl text-slate-900">Grounded Copilot</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Allows shift physicians to ask natural language questions like "Summarize last 6 hours" or "What changed?". Every sentence is bound to exact timestamps and device telemetry.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 font-mono pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Citation timestamps</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Source device verification</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Non-diagnostic safety guardrails</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-clinical-sm space-y-4">
          <ShieldCheck className="w-8 h-8 text-rose-600" />
          <h3 className="font-bold text-xl text-slate-900">Data Quality Layer</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never presents stale data as live. Every vital card explicitly displays LIVE, DELAYED, STALE, or DISCONNECTED markers based on heartbeat packets.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 font-mono pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-rose-600" /> &lt; 3s Latency monitoring</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-rose-600" /> Automatic stale fallback tags</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-rose-600" /> Physical disconnect alarms</li>
          </ul>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link
          to="/unit-selection"
          className="inline-flex items-center gap-2 bg-clinical-blue hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-md"
        >
          <span>Launch Platform Demonstration</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
