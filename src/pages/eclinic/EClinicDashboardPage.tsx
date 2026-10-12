import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Stethoscope, 
  HeartPulse, 
  ArrowUpRight, 
  Plus, 
  ChevronRight, 
  Play, 
  Building2,
  Activity,
  Shield,
  Filter
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  MOCK_CLINICS, 
  MOCK_DOCTORS,
  updateAppointmentStatus
} from '../../data/mockEclinicData';
import { Appointment } from '../../types/eclinic';

export const EClinicDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, can, permissions } = useRBAC();
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [selectedClinicId, setSelectedClinicId] = useState<string>(MOCK_CLINICS[0].id);

  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getStoredAppointments());
    };
    window.addEventListener('eclinic_appointments_updated', handleUpdate);
    return () => window.removeEventListener('eclinic_appointments_updated', handleUpdate);
  }, []);

  const currentClinic = MOCK_CLINICS.find(c => c.id === selectedClinicId) || MOCK_CLINICS[0];

  // Derived counts
  const todayTotal = appointments.length;
  const waitingList = appointments.filter(a => a.status === 'WAITING' || a.status === 'CHECKED_IN');
  const readyList = appointments.filter(a => a.status === 'READY_FOR_DOCTOR');
  const inConsultationList = appointments.filter(a => a.status === 'IN_CONSULTATION');
  const completedList = appointments.filter(a => a.status === 'COMPLETED');

  // Next patient for doctor
  const nextPatient = appointments.find(a => 
    a.status === 'READY_FOR_DOCTOR' || a.status === 'WAITING' || a.status === 'IN_CONSULTATION'
  );

  const handleCallNext = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'IN_CONSULTATION');
    navigate(`/eclinic/telemedicine?appointmentId=${apt.id}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & FACILITY SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Stethoscope className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                E-Clinic Digital OPD
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                LIVE NODE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-definition tele-consultation, digital triage & outpatient workflows
            </p>
          </div>
        </div>

        {/* Clinic Node Selector & Role Pill */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {MOCK_CLINICS.map(clinic => (
                <option key={clinic.id} value={clinic.id} className="dark:bg-slate-900">
                  {clinic.clinicName}
                </option>
              ))}
            </select>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center gap-1.5 text-xs font-mono font-bold text-teal-800 dark:text-teal-300">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>ROLE: {role}</span>
          </div>
        </div>
      </div>

      {/* 2. ROLE-TAILORED BANNER / NEXT PATIENT SPOTLIGHT */}
      {role === 'DOCTOR' && nextPatient ? (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl border border-teal-700/50 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black font-mono">
                NEXT PATIENT READY
              </span>
              <span className="text-xs font-mono text-teal-200">
                Token {nextPatient.tokenNumber} • {nextPatient.time}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {nextPatient.patientName} ({nextPatient.patientAge}y / {nextPatient.patientGender})
            </h3>
            <p className="text-xs text-teal-100/80 line-clamp-1">
              Complaint: {nextPatient.reason}
            </p>
            {nextPatient.vitals && (
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-teal-200">
                <span>BP: {nextPatient.vitals.systolicBp}/{nextPatient.vitals.diastolicBp}</span>
                <span>SpO2: {nextPatient.vitals.spo2}%</span>
                <span>Pulse: {nextPatient.vitals.pulseRate} bpm</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 z-10">
            <Link
              to={`/eclinic/telemedicine?appointmentId=${nextPatient.id}`}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/30 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Consultation Now</span>
            </Link>
            <Link
              to="/eclinic/doctor-workspace"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              Doctor Workspace
            </Link>
          </div>
        </div>
      ) : role === 'RECEPTIONIST' || role === 'CLINIC_OPERATOR' ? (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              OPD Patient Reception & Intake Desk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Directly issue queue tokens, check-in booked appointments, or triage walk-ins for vitals capture.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/eclinic/queue"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Walk-in</span>
            </Link>
            {can('canCaptureVitals') && (
              <Link
                to="/eclinic/vitals"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HeartPulse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Capture Vitals</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}

      {/* 3. FOUR KEY KPI METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Scheduled
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {todayTotal}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Today's Volume
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {completedList.length} completed • {waitingList.length + readyList.length} pending
          </div>
        </div>

        {/* Waiting in Queue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Waiting in Queue
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {waitingList.length + readyList.length}
            </span>
            <span className="text-xs text-slate-500">
              Avg. wait: ~18 mins
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {readyList.length} vitals recorded (Doctor Ready)
          </div>
        </div>

        {/* In Consultation */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              In Consultation
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {inConsultationList.length}
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 animate-pulse">
              Live Stream
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Tele-room 01 Active
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed OPD
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {completedList.length}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              100% Rx Issued
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Clinical summaries filed
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE GRID: LIVE QUEUE (LEFT) + DOCTOR ROSTER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Queue Table (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Triage Queue</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patients prioritized for tele-consultation and vitals assessment
              </p>
            </div>
            <Link
              to="/eclinic/queue"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 flex items-center gap-1 transition-colors"
            >
              <span>View Full Queue</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Token</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Patient</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Assigned Doctor</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Vitals</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.slice(0, 5).map(apt => {
                  const isReady = apt.status === 'READY_FOR_DOCTOR';
                  const isInConsult = apt.status === 'IN_CONSULTATION';
                  const isDone = apt.status === 'COMPLETED';

                  return (
                    <tr 
                      key={apt.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                        <span className="px-2 py-1 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                          {apt.tokenNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {apt.patientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {apt.patientMrn} • {apt.patientAge}y/{apt.patientGender[0]}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {apt.doctorName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {apt.specialty}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${
                          isInConsult
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 animate-pulse'
                            : isReady
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : isDone
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}>
                          {isInConsult && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                          {apt.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {apt.vitals ? (
                          <div className="space-y-0.5 font-mono text-[11px]">
                            <span className="text-slate-700 dark:text-slate-300 block font-bold">
                              {apt.vitals.systolicBp}/{apt.vitals.diastolicBp} mmHg
                            </span>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400">
                              SpO2: {apt.vitals.spo2}% | {apt.vitals.pulseRate} bpm
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 italic">
                            Pending Vitals
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {can('canStartConsultation') && (isReady || isInConsult) ? (
                          <button
                            onClick={() => handleCallNext(apt)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>{isInConsult ? 'Resume' : 'Call'}</span>
                          </button>
                        ) : can('canCaptureVitals') && !apt.vitals ? (
                          <Link
                            to={`/eclinic/vitals?appointmentId=${apt.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1 transition-all"
                          >
                            <HeartPulse className="w-3 h-3 text-teal-600" />
                            <span>Record</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/eclinic/patients?patientId=${apt.patientId}`}
                            className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                          >
                            Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Tele-Specialists on Duty */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tele-Doctors on Duty
                </h3>
                <p className="text-[11px] text-slate-400">
                  Remote specialist roster and consultation availability
                </p>
              </div>
              <Link to="/eclinic/doctors" className="text-xs font-bold text-teal-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {MOCK_DOCTORS.map(doc => (
                <div key={doc.doctorId} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        doc.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {doc.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-teal-600 dark:text-teal-400">
                        <span>{doc.waitingPatientsCount} waiting</span>
                        <span>•</span>
                        <span>{doc.completedTodayCount} seen</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                    doc.isOnline
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200'
                  }`}>
                    {doc.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Clinical Hub */}
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-5 border border-teal-800/40 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>OPD Quick Navigator</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Shortcuts tailored for your operational permissions.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link
                to="/eclinic/patients"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-bold flex flex-col items-start gap-1"
              >
                <Users className="w-4 h-4 text-teal-300" />
                <span>Patient Master</span>
              </Link>

              <Link
                to="/eclinic/appointments"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-bold flex flex-col items-start gap-1"
              >
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>Appointment Slots</span>
              </Link>

              {can('canCaptureVitals') && (
                <Link
                  to="/eclinic/vitals"
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-bold flex flex-col items-start gap-1"
                >
                  <HeartPulse className="w-4 h-4 text-rose-300" />
                  <span>Vitals Entry</span>
                </Link>
              )}

              {can('canStartConsultation') && (
                <Link
                  to="/eclinic/doctor-workspace"
                  className="p-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 transition-colors text-xs font-bold flex flex-col items-start gap-1 text-emerald-200"
                >
                  <Video className="w-4 h-4 text-emerald-300" />
                  <span>Tele-Workspace</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EClinicDashboardPage;
