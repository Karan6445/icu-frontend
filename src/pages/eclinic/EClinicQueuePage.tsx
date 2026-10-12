import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Filter, 
  Clock, 
  Video, 
  HeartPulse, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Play, 
  Plus, 
  Volume2, 
  Printer, 
  Stethoscope, 
  Building2,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  saveAppointments, 
  updateAppointmentStatus, 
  MOCK_DOCTORS, 
  MOCK_CLINICS 
} from '../../data/mockEclinicData';
import { Appointment, AppointmentStatus, AppointmentPriority } from '../../types/eclinic';

export const EClinicQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { role, can, permissions } = useRBAC();
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [callingToken, setCallingToken] = useState<string | null>(null);
  const [printedToken, setPrintedToken] = useState<Appointment | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getStoredAppointments());
    };
    window.addEventListener('eclinic_appointments_updated', handleUpdate);
    return () => window.removeEventListener('eclinic_appointments_updated', handleUpdate);
  }, []);

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    updateAppointmentStatus(id, newStatus);
    setAppointments(getStoredAppointments());
  };

  const handleCallPatient = (apt: Appointment) => {
    setCallingToken(apt.tokenNumber);
    // Simulate hospital PA audio chime
    setTimeout(() => {
      setCallingToken(null);
      handleStatusChange(apt.id, 'IN_CONSULTATION');
      navigate(`/eclinic/telemedicine?appointmentId=${apt.id}`);
    }, 1500);
  };

  const filtered = appointments.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesDoctor = doctorFilter === 'ALL' || a.doctorId === doctorFilter;
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
    return matchesStatus && matchesDoctor && matchesPriority;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & AUDIO CALL NOTIFICATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Live OPD Queue & Triage Desk
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Token sequencing, check-in triage, vital assessment pipeline, and doctor calling
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {can('canRegisterPatient') && (
            <Link
              to="/eclinic/patients"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient</span>
            </Link>
          )}

          {can('canStartConsultation') && (
            <Link
              to="/eclinic/doctor-workspace"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Doctor Workspace</span>
            </Link>
          )}
        </div>
      </div>

      {/* AUDIO CHIME SIMULATION BANNER */}
      {callingToken && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider block">
                PA AUDIO ANNOUNCEMENT
              </span>
              <span className="text-base font-black">
                "Attention Please: Calling Token {callingToken} to Digital Tele-Room 1"
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full">
            CONNECTING...
          </span>
        </div>
      )}

      {/* 2. FILTER STRIP */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-500 mr-1">Status:</span>
          {['ALL', 'WAITING', 'CHECKED_IN', 'READY_FOR_DOCTOR', 'IN_CONSULTATION', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[11px] transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Doctor and Priority Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Doctor:</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
            >
              <option value="ALL">All Doctors</option>
              {MOCK_DOCTORS.map(doc => (
                <option key={doc.doctorId} value={doc.doctorId}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="ROUTINE">Routine</option>
              <option value="PRIORITY">Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. QUEUE LIST TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Assigned Doctor</th>
                <th className="py-3 px-4">Vitals Status</th>
                <th className="py-3 px-4">Queue State</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-mono">
                    No patients match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((apt, index) => {
                  const hasVitals = !!apt.vitals;
                  const isReady = apt.status === 'READY_FOR_DOCTOR';
                  const isInConsult = apt.status === 'IN_CONSULTATION';
                  const isWaiting = apt.status === 'WAITING';
                  const isCheckedIn = apt.status === 'CHECKED_IN';
                  const isCompleted = apt.status === 'COMPLETED';

                  return (
                    <tr 
                      key={apt.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        apt.priority === 'EMERGENCY' ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      {/* Token */}
                      <td className="py-4 px-4 font-mono font-black text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                            apt.priority === 'EMERGENCY'
                              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                              : 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                          }`}>
                            {apt.tokenNumber}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {apt.patientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {apt.patientAge}y / {apt.patientGender[0]} • {apt.patientPhone}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">
                          {apt.reason}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          apt.priority === 'EMERGENCY'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-black'
                            : apt.priority === 'URGENT'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : apt.priority === 'PRIORITY'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {apt.priority}
                        </span>
                      </td>

                      {/* Doctor */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {apt.doctorName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {apt.specialty.split('&')[0].trim()}
                        </div>
                      </td>

                      {/* Vitals */}
                      <td className="py-4 px-4">
                        {hasVitals ? (
                          <div className="space-y-0.5 font-mono text-[11px]">
                            <span className="text-slate-900 dark:text-white font-bold block">
                              {apt.vitals?.systolicBp}/{apt.vitals?.diastolicBp} mmHg
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              SpO2: {apt.vitals?.spo2}% | {apt.vitals?.pulseRate} bpm
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Vitals Pending</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${
                          isInConsult
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 animate-pulse'
                            : isReady
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : isCheckedIn
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            : isCompleted
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        }`}>
                          {isInConsult && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                          {apt.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Wait Time */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{apt.waitingDurationMinutes} mins</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Token button */}
                          <button
                            onClick={() => setPrintedToken(apt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Print Token Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Check-In Action (if Waiting) */}
                          {isWaiting && can('canCheckIn') && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'CHECKED_IN')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Check In
                            </button>
                          )}

                          {/* Capture Vitals Action */}
                          {can('canCaptureVitals') && !hasVitals && !isCompleted && (
                            <Link
                              to={`/eclinic/vitals?appointmentId=${apt.id}`}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-[11px] flex items-center gap-1"
                            >
                              <HeartPulse className="w-3 h-3" />
                              <span>Vitals</span>
                            </Link>
                          )}

                          {/* Call / Start Consultation (Doctor / Admin) */}
                          {can('canStartConsultation') && (isReady || isInConsult || isCheckedIn) && (
                            <button
                              onClick={() => handleCallPatient(apt)}
                              className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>{isInConsult ? 'Resume' : 'Call'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. THERMAL TOKEN RECEIPT SLIP MODAL */}
      {printedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 font-mono text-xs border border-slate-300">
            {/* Thermal Print Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h2 className="text-sm font-black tracking-wider uppercase">
                NAIMIFY E-CLINIC
              </h2>
              <p className="text-[10px] text-slate-500">
                {printedToken.clinicName}
              </p>
              <p className="text-[10px] text-slate-400">
                Outpatient Digital Queue Token
              </p>
            </div>

            {/* Giant Token Display */}
            <div className="my-5 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                YOUR TOKEN NUMBER
              </span>
              <div className="text-4xl font-black tracking-tight text-teal-800">
                {printedToken.tokenNumber}
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold mt-2 inline-block">
                Priority: {printedToken.priority}
              </span>
            </div>

            {/* Patient & Clinic Details */}
            <div className="space-y-1.5 border-t border-b border-dashed border-slate-400 py-3 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold">{printedToken.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MRN:</span>
                <span className="font-bold">{printedToken.patientMrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Doctor:</span>
                <span className="font-bold">{printedToken.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issued At:</span>
                <span>{printedToken.time}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px] text-slate-500">
              Please proceed to Vitals Capture Station and await announcement on digital monitors.
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPrintedToken(null)}
                className="flex-1 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setPrintedToken(null);
                }}
                className="flex-1 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EClinicQueuePage;
