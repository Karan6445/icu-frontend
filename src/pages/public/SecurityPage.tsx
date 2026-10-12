import React from 'react';
import { SecurityArchitectureSVG } from '../../components/svg/SecurityArchitectureSVG';
import { HospitalNetwork } from '../../components/svg/HospitalNetwork';

export const SecurityPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Security & India Deployment
        </span>
        <h1 className="text-4xl font-extrabold text-clinical-navy">Healthcare Security & India-First Architecture</h1>
        <p className="text-slate-600 text-sm">
          Built for hospital data sovereignty, least-privilege RBAC, low-bandwidth resilience, and mixed legacy infrastructure.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 font-mono">1. Enterprise Security Architecture</h2>
        <SecurityArchitectureSVG />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 font-mono">2. India-First On-Premise & Edge Network</h2>
        <HospitalNetwork />
      </div>
    </div>
  );
};
