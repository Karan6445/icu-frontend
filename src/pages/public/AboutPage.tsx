import React from 'react';
import { Activity, ShieldCheck, Heart, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-mono font-bold">
          <Activity className="w-4 h-4" />
          PRODUCT VISION v2.0
        </div>
        <h1 className="text-4xl font-extrabold text-clinical-navy">From ICU Data to Clinical Action.</h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          INTELLIGENT ICU was founded on a singular premise: Critical care physicians should not spend precious round minutes hunting across disconnected device screens or tabbed EHR windows to discover what changed in a patient's trajectory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <ShieldCheck className="w-8 h-8 text-clinical-blue" />
          <h3 className="font-bold text-lg text-slate-900">Assistance, Not Replacement</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform is designed to assist critical care teams with unified data, clear provenance, and change detection. It does not replace the clinician or make autonomous therapeutic dosing.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Award className="w-8 h-8 text-teal-600" />
          <h3 className="font-bold text-lg text-slate-900">Hospital-Grade Standards</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Engineered according to Indian regulatory classification guidelines, ISO 13485 quality systems, and hospital cybersecurity standards for medical data protection.
          </p>
        </div>
      </div>
    </div>
  );
};
