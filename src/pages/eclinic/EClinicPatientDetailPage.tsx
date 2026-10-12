import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Phone, 
  HeartPulse, 
  Video, 
  FileText, 
  Pill, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Stethoscope,
  Share2
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { getStoredAppointments } from '../../data/mockEclinicData';

export const EClinicPatientDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, can } = useRBAC();
  
  const patientId = searchParams.get('patientId') || 'PT-1001';
  const appointments = getStoredAppointments();
  const patientAppointment = appointments.find(a => a.patientId === patientId) || appointments[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'notes' | 'prescriptions'>('overview');

  const canViewClinical = can('canViewClinicalHistory');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. TOP NAVIGATION & BACK */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/eclinic/patients')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {can('canCaptureVitals') && (
            <Link
              to={`/eclinic/vitals?appointmentId=${patientAppointment.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>Capture Vitals</span>
            </Link>
          )}

          {can('canStartConsultation') && (
            <Link
              to={`/eclinic/telemedicine?appointmentId=${patientAppointment.id}`}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Launch Tele-Consult</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. PATIENT PROFILE BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/20">
            {patientAppointment.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {patientAppointment.patientName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {patientAppointment.tokenNumber}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {patientAppointment.patientMrn}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono flex-wrap">
              <span>{patientAppointment.patientAge} Years</span>
              <span>•</span>
              <span>{patientAppointment.patientGender}</span>
              <span>•</span>
              <span>Mobile: {patientAppointment.patientPhone}</span>
              <span>•</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{patientAppointment.clinicName}</span>
            </div>
          </div>
        </div>

        {/* Status Chip */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Current OPD Status
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase border ${
            patientAppointment.status === 'COMPLETED'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : patientAppointment.status === 'READY_FOR_DOCTOR'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {patientAppointment.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Encounter Overview
        </button>

        <button
          onClick={() => setActiveTab('vitals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'vitals'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Vitals Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SOAP Clinical Notes</span>
          {!canViewClinical && <Lock className="w-3 h-3 text-amber-500" />}
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Prescriptions & Referrals</span>
          {!canViewClinical && <Lock className="w-3 h-3 text-amber-500" />}
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chief Complaint & Reason */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Today's Visit Details</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Chief Complaint / Symptoms</span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {patientAppointment.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 block font-semibold">Triage Priority</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {patientAppointment.priority}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Assigned Tele-Doctor</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {patientAppointment.doctorName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Vitals Glance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Latest Recorded Vitals</span>
            </h3>
            {patientAppointment.vitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">BP (Systolic/Dia)</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    {patientAppointment.vitals.systolicBp}/{patientAppointment.vitals.diastolicBp}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Pulse Rate</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    {patientAppointment.vitals.pulseRate} bpm
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">SpO2 Oxygen</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {patientAppointment.vitals.spo2}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Temperature</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    {patientAppointment.vitals.temperature}°C
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Blood Sugar</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    {patientAppointment.vitals.bloodGlucose || '--'} mg/dL
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">BMI</span>
                  <span className="text-sm font-black font-mono text-teal-600 dark:text-teal-400">
                    {patientAppointment.vitals.bmi || '--'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">
                No vitals recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vitals Tab */}
      {activeTab === 'vitals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vitals Examination Record
            </h3>
            {can('canCaptureVitals') && (
              <Link
                to={`/eclinic/vitals?appointmentId=${patientAppointment.id}`}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
              >
                + New Reading
              </Link>
            )}
          </div>

          {patientAppointment.vitals ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-mono">Blood Pressure</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1 block">
                    {patientAppointment.vitals.systolicBp}/{patientAppointment.vitals.diastolicBp} mmHg
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-mono">Heart Rate</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1 block">
                    {patientAppointment.vitals.pulseRate} bpm
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-mono">Oxygen Saturation</span>
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {patientAppointment.vitals.spo2}%
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-mono">Body Temperature</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1 block">
                    {patientAppointment.vitals.temperature}°C
                  </span>
                </div>
              </div>

              {patientAppointment.vitals.warnings && patientAppointment.vitals.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">
                    Telemetry Alerts Detected:
                  </span>
                  <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 text-xs">
                    {patientAppointment.vitals.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-mono">
                Recorded by: {patientAppointment.vitals.recordedBy} at {patientAppointment.vitals.recordedAt}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              No digital vitals captured for this encounter.
            </div>
          )}
        </div>
      )}

      {/* Notes & Prescriptions: Strictly Masked for Receptionist */}
      {(activeTab === 'notes' || activeTab === 'prescriptions') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          {!canViewClinical ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Lock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Records Access Restricted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                As a <strong>{role}</strong>, you do not have permission to view physician clinical notes, SOAP evaluations, diagnoses, or prescriptions.
              </p>
              <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                To test clinical view, switch role to DOCTOR or NURSE in the Dev Role Switcher.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeTab === 'notes' ? 'Physician SOAP Clinical Assessment' : 'Prescription & Drug Formulary'}
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div><strong>Subjective:</strong> Patient reports episodic symptoms, denies chest tightness.</div>
                <div><strong>Objective:</strong> Chest clear bilaterally, heart sounds normal, no peripheral edema.</div>
                <div><strong>Assessment:</strong> Stable outpatient course. Routine management maintained.</div>
                <div><strong>Plan:</strong> Continue medications, maintain low-sodium diet, review in 3 weeks.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EClinicPatientDetailPage;
