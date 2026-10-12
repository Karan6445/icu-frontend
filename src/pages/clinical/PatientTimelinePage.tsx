import React from 'react';
import { useParams } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatient';
import { ClinicalTimeline } from '../../components/svg/ClinicalTimeline';

export const PatientTimelinePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient } = usePatient(patientId);

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white border border-clinical-border p-6 rounded-2xl shadow-clinical-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-clinical-navy text-white px-2.5 py-1 rounded-lg">
              {patient?.bedNumber || 'BED-07'}
            </span>
            <h1 className="text-xl font-extrabold text-clinical-navy">
              Screen 04 — Synchronized Patient Timeline
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unified multi-stream timeline for patient {patient?.name || 'Rajesh Sharma'} ({patient?.id || 'P-1024'}). Click any event node for explainability & data provenance.
          </p>
        </div>
      </div>

      <ClinicalTimeline />
    </div>
  );
};
