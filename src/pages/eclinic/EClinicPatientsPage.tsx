import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  Clock, 
  HeartPulse, 
  Video, 
  Lock, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Stethoscope
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  saveAppointments, 
  MOCK_DOCTORS, 
  MOCK_CLINICS 
} from '../../data/mockEclinicData';
import { Appointment, AppointmentPriority } from '../../types/eclinic';

export const EClinicPatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, can, permissions } = useRBAC();
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form State for New Patient Registration
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    phone: '',
    doctorId: MOCK_DOCTORS[0].doctorId,
    priority: 'ROUTINE' as AppointmentPriority,
    reason: ''
  });

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.reason.trim()) return;

    const doctor = MOCK_DOCTORS.find(d => d.doctorId === formData.doctorId) || MOCK_DOCTORS[0];
    const newId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAptId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const nextTokenNum = `TK-0${appointments.length + 1}`;

    const newAppointment: Appointment = {
      id: newAptId,
      tokenNumber: nextTokenNum,
      clinicId: MOCK_CLINICS[0].id,
      clinicName: MOCK_CLINICS[0].clinicName,
      patientId: newId,
      patientName: formData.name.trim(),
      patientMrn: `MRN-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientAge: Number(formData.age) || 30,
      patientGender: formData.gender,
      patientPhone: formData.phone.trim(),
      doctorId: doctor.doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'WAITING',
      priority: formData.priority,
      reason: formData.reason.trim(),
      waitingDurationMinutes: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    saveAppointments(updated);
    setIsRegisterModalOpen(false);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      doctorId: MOCK_DOCTORS[0].doctorId,
      priority: 'ROUTINE',
      reason: ''
    });
  };

  // Unique patients derived from appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = filterGender === 'ALL' || apt.patientGender === filterGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              E-Clinic Patient Registry
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {appointments.length} REGISTRATIONS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Outpatient demographics, digital queue tokens, and role-governed clinical summaries
          </p>
        </div>

        {can('canRegisterPatient') && (
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Walk-in Patient</span>
          </button>
        )}
      </div>

      {/* 2. RECEPTIONIST PRIVACY NOTICE (If active role is RECEPTIONIST) */}
      {!can('canViewClinicalHistory') && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Privacy Mask Active:</span> As a <strong>{role}</strong>, sensitive clinical diagnoses, previous doctor notes, and SOAP clinical evaluations are hidden in compliance with medical data governance.
          </div>
        </div>
      )}

      {/* 3. FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Name, MRN, Token, or Mobile Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Gender:</span>
          {['ALL', 'Male', 'Female'].map(g => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterGender === g
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PATIENT CARDS & TABLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map(apt => {
          const hasVitals = !!apt.vitals;
          const isDone = apt.status === 'COMPLETED';

          return (
            <div 
              key={apt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-teal-500/50 transition-all group"
            >
              <div>
                {/* Header Row: Token + Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                    {apt.tokenNumber}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                    apt.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : apt.status === 'READY_FOR_DOCTOR'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                  }`}>
                    {apt.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Patient Demographic */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {apt.patientName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                    <span>{apt.patientMrn}</span>
                    <span>•</span>
                    <span>{apt.patientAge} Years</span>
                    <span>•</span>
                    <span>{apt.patientGender}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{apt.patientPhone}</span>
                  </div>
                </div>

                {/* Clinical Context or Privacy Mask */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Chief Complaint
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {apt.reason}
                  </p>

                  {/* Vitals or Medical History */}
                  {can('canViewClinicalHistory') ? (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-mono">
                      {hasVitals ? (
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span>BP: {apt.vitals?.systolicBp}/{apt.vitals?.diastolicBp}</span>
                          <span>SpO2: {apt.vitals?.spo2}%</span>
                          <span>BMI: {apt.vitals?.bmi}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 italic">
                          Vitals Pending Capture
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Clinical history locked for role</span>
                    </div>
                  )}
                </div>

                {/* Assigned Doctor */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold">{apt.doctorName}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {can('canCaptureVitals') && !hasVitals ? (
                  <Link
                    to={`/eclinic/vitals?appointmentId=${apt.id}`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Capture Vitals</span>
                  </Link>
                ) : can('canStartConsultation') && (apt.status === 'READY_FOR_DOCTOR' || apt.status === 'IN_CONSULTATION') ? (
                  <Link
                    to={`/eclinic/telemedicine?appointmentId=${apt.id}`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Video Consult</span>
                  </Link>
                ) : (
                  <Link
                    to={`/eclinic/queue`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View in Queue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. REGISTER WALK-IN PATIENT MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Register Walk-in Patient</h3>
                  <p className="text-xs text-slate-400">Issue queue token & triage for digital OPD</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="110"
                    placeholder="35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="PRIORITY">Priority</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Tele-Doctor / Specialty *
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {MOCK_DOCTORS.map(doc => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.name} — {doc.specialty} ({doc.isOnline ? 'Online' : 'Offline'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chief Symptoms / Reason for Visit *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe chief complaints, duration of fever/pain, cough, prior medications..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Issue Token & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EClinicPatientsPage;
