import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatient';
import { useRealtimeObservations } from '../../hooks/useRealtimeObservations';
import { DataQualityBadge } from '../../components/common/DataQualityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EventDrawer } from '../../components/common/EventDrawer';
import { HeartbeatWaveform } from '../../components/svg/HeartbeatWaveform';
import { RespiratoryWaveform } from '../../components/svg/RespiratoryWaveform';
import { PatientTrend } from '../../components/svg/PatientTrend';
import { PatientService } from '../../services/patientService';
import { MedicineService } from '../../services/medicineService';
import { TimelineService } from '../../services/timelineService';
import { ClinicalEvent } from '../../types/clinical';
import { 
  Activity, 
  Wind, 
  Syringe, 
  Clock, 
  TrendingUp, 
  Bot, 
  AlertCircle, 
  HardDrive,
  CheckCircle2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient } = usePatient(patientId);
  const { vitals, lastUpdate } = useRealtimeObservations(patientId || 'P-1024', patient?.vitals as any);

  const [selectedDrawerEvent, setSelectedDrawerEvent] = useState<ClinicalEvent | null>(null);

  if (!patient) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold">Patient Record Not Found</h2>
        <Link to="/admin" className="mt-4 inline-block px-4 py-2 bg-blue-900 text-white rounded text-xs">
          Return to Admin Cockpit
        </Link>
      </div>
    );
  }

  const infusions = MedicineService.getMedications(patient.id);

  return (
    <div className="space-y-6 pb-16">
      {/* Patient Header Cockpit Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-black bg-blue-900 text-white px-3 py-1 rounded-lg">
              {patient.bedNumber}
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{patient.name}</h1>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              MRN: {patient.mrn} · {patient.age}y / {patient.gender}
            </span>
            <StatusBadge status={patient.reviewPriority} size="md" />
            <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900">
              {patient.codeStatus || 'FULL CODE'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium font-sans">
            <span>Diagnosis: <strong className="text-slate-900 dark:text-white">{patient.admittingDiagnosis}</strong></span>
            <span>·</span>
            <span>Admitted: <strong className="text-slate-900 dark:text-white">{patient.admissionTime}</strong></span>
            <span>·</span>
            <span>Attending: <strong className="text-slate-900 dark:text-white">{patient.assignedClinician}</strong></span>
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold font-mono">
          <Link
            to={`/patient/${patient.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 text-white rounded-xl transition-all shadow-xs"
          >
            <Clock className="w-4 h-4 text-blue-300" />
            <span>Open Full Patient Record</span>
          </Link>
        </div>
      </div>

      {/* Structured Vitals Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
        {/* Heart Rate */}
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-700 dark:text-rose-400">HEART RATE</span>
            <DataQualityBadge quality={vitals.quality} size="sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{vitals.hr}</span>
            <span className="text-xs text-slate-500 font-sans">bpm</span>
          </div>
          <HeartbeatWaveform color="#f43f5e" height={32} bpm={Number(vitals.hr)} />
        </div>

        {/* SpO2 */}
        <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-700 dark:text-sky-400">SpO2 SATURATION</span>
            <DataQualityBadge quality={vitals.quality} size="sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-sky-600 dark:text-sky-400">{vitals.spo2}</span>
            <span className="text-xs text-slate-500 font-sans">%</span>
          </div>
          <PatientTrend data={[97, 96, 95, 94, 93, 91, Number(vitals.spo2)]} color="#0284c7" height={32} />
        </div>

        {/* Blood Pressure */}
        <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-700 dark:text-purple-400">BLOOD PRESSURE</span>
            <DataQualityBadge quality={vitals.quality} size="sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-purple-700 dark:text-purple-400">
              {vitals.bpSystolic}/{vitals.bpDiastolic}
            </span>
            <span className="text-xs text-slate-500 font-sans">mmHg</span>
          </div>
          <PatientTrend data={[115, 112, 110, 108]} color="#a855f7" height={32} />
        </div>

        {/* Respiratory Rate */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">RESPIRATORY RATE</span>
            <DataQualityBadge quality={vitals.quality} size="sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{vitals.rr}</span>
            <span className="text-xs text-slate-500 font-sans">/min</span>
          </div>
          <PatientTrend data={[18, 20, 22, 25, Number(vitals.rr)]} color="#10b981" height={32} />
        </div>

        {/* Temperature */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400">TEMPERATURE</span>
            <DataQualityBadge quality={vitals.quality} size="sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{vitals.temp}</span>
            <span className="text-xs text-slate-500 font-sans">°C</span>
          </div>
          <PatientTrend data={[37.5, 37.8, 38.0, 38.2]} color="#d97706" height={32} />
        </div>
      </div>

      <EventDrawer event={selectedDrawerEvent} onClose={() => setSelectedDrawerEvent(null)} />
    </div>
  );
};
