import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Video, 
  Users, 
  Clock, 
  Play, 
  HeartPulse, 
  FileText, 
  Pill, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Building2, 
  ShieldCheck,
  Calendar,
  Activity
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  updateAppointmentStatus, 
  MOCK_DOCTORS 
} from '../../data/mockEclinicData';
import { Appointment } from '../../types/eclinic';

export const EClinicDoctorWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, can } = useRBAC();
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());

  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getStoredAppointments());
    };
    window.addEventListener('eclinic_appointments_updated', handleUpdate);
    return () => window.removeEventListener('eclinic_appointments_updated', handleUpdate);
  }, []);

  // Filter doctor's patients
  const currentDoctor = MOCK_DOCTORS[0]; // Dr. Alexander Watson

  const waitingPatients = appointments.filter(
    a => a.status === 'READY_FOR_DOCTOR' || a.status === 'WAITING' || a.status === 'CHECKED_IN'
  );
  const activeConsultation = appointments.find(a => a.status === 'IN_CONSULTATION');
  const completedPatients = appointments.filter(a => a.status === 'COMPLETED');

  // Next Patient ready for doctor
  const nextReady = appointments.find(a => a.status === 'READY_FOR_DOCTOR') || waitingPatients[0];

  const handleStartConsultation = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'IN_CONSULTATION');
    navigate(`/eclinic/telemedicine?appointmentId=${apt.id}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. DOCTOR WORKSPACE COCKPIT HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <Stethoscope className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Physician Tele-OPD Console
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                ACTIVE COCKPIT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consultation queue, live patient calling, electronic SOAP notes & digital prescription hub
            </p>
          </div>
        </div>

        {/* Doctor Quick Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase block">Assigned Doctor</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentDoctor.name}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
            <span className="text-[10px] uppercase block">Queued Patients</span>
            <span className="font-black text-sm">{waitingPatients.length}</span>
          </div>
        </div>
      </div>

      {/* 2. HERO CARD: NEXT PATIENT IN QUEUE */}
      {nextReady ? (
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl border border-teal-700/60 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black font-mono text-xs shadow-md">
                  NEXT IN LINE: TOKEN {nextReady.tokenNumber}
                </span>
                <span className="text-xs font-mono text-teal-200">
                  Scheduled: {nextReady.time}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/20">
                  {nextReady.priority}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">
                {nextReady.patientName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-teal-200 font-mono">
                <span>{nextReady.patientMrn}</span>
                <span>•</span>
                <span>{nextReady.patientAge} Years Old</span>
                <span>•</span>
                <span>{nextReady.patientGender}</span>
                <span>•</span>
                <span>{nextReady.patientPhone}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs mt-2">
                <span className="text-teal-300 font-bold block mb-0.5">Chief Complaint:</span>
                <p className="text-slate-200">{nextReady.reason}</p>
              </div>

              {/* Vitals Summary Strip */}
              {nextReady.vitals ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-[10px] text-teal-200 block">BP</span>
                    <span className="font-bold text-white text-sm">
                      {nextReady.vitals.systolicBp}/{nextReady.vitals.diastolicBp} mmHg
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-[10px] text-teal-200 block">Pulse</span>
                    <span className="font-bold text-white text-sm">
                      {nextReady.vitals.pulseRate} bpm
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-[10px] text-teal-200 block">SpO2</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {nextReady.vitals.spo2}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-[10px] text-teal-200 block">Temp</span>
                    <span className="font-bold text-white text-sm">
                      {nextReady.vitals.temperature}°C
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-300 pt-1 font-mono">
                  ⚠️ Patient has not yet visited the vitals station.
                </div>
              )}
            </div>

            {/* Launch Action */}
            <div className="flex flex-col gap-3 shrink-0">
              <button
                onClick={() => handleStartConsultation(nextReady)}
                className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Launch Tele-Consultation</span>
              </button>

              <Link
                to={`/eclinic/patients?patientId=${nextReady.patientId}`}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center border border-white/20 transition-colors"
              >
                Review Full Medical Profile
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            All Queued Patients Have Been Seen
          </h3>
          <p className="text-xs text-slate-400">
            No patients currently waiting in your consultation queue.
          </p>
        </div>
      )}

      {/* 3. ACTIVE CONSULTATION & QUEUED PATIENTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Remaining Waiting Queue (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Remaining Waiting Patients ({waitingPatients.length})</span>
            </h3>
            <Link to="/eclinic/queue" className="text-xs text-teal-600 font-bold hover:underline">
              Manage Queue
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {waitingPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                Queue is empty.
              </div>
            ) : (
              waitingPatients.map(apt => (
                <div 
                  key={apt.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg font-mono font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {apt.tokenNumber}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {apt.patientName}
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {apt.patientAge}y/{apt.patientGender[0]} • {apt.time}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {apt.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                      apt.status === 'READY_FOR_DOCTOR'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}>
                      {apt.status.replace(/_/g, ' ')}
                    </span>

                    <button
                      onClick={() => handleStartConsultation(apt)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Patients Completed Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Consulted Today ({completedPatients.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Completed</span>
          </div>

          <div className="space-y-3">
            {completedPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">
                No consultations completed yet today.
              </div>
            ) : (
              completedPatients.map(apt => (
                <div key={apt.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {apt.patientName}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Completed
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Token {apt.tokenNumber} • {apt.patientMrn}
                  </div>
                  <div className="pt-1 text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>SOAP summary & Rx issued</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EClinicDoctorWorkspacePage;
