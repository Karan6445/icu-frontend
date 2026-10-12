import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  User, 
  Stethoscope, 
  Check, 
  X, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  saveAppointments, 
  MOCK_DOCTORS, 
  MOCK_CLINICS 
} from '../../data/mockEclinicData';
import { Appointment } from '../../types/eclinic';

export const EClinicAppointmentsPage: React.FC = () => {
  const { role, can } = useRBAC();
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking Form State
  const [bookForm, setBookForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'Male' as 'Male' | 'Female' | 'Other',
    doctorId: MOCK_DOCTORS[0].doctorId,
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    reason: ''
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.patientName.trim() || !bookForm.patientPhone.trim()) return;

    const doctor = MOCK_DOCTORS.find(d => d.doctorId === bookForm.doctorId) || MOCK_DOCTORS[0];
    const newApt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: `TK-0${appointments.length + 1}`,
      clinicId: MOCK_CLINICS[0].id,
      clinicName: MOCK_CLINICS[0].clinicName,
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: bookForm.patientName.trim(),
      patientMrn: `MRN-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientAge: Number(bookForm.patientAge) || 40,
      patientGender: bookForm.patientGender,
      patientPhone: bookForm.patientPhone.trim(),
      doctorId: doctor.doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: bookForm.date,
      time: bookForm.time,
      status: 'WAITING',
      priority: 'ROUTINE',
      reason: bookForm.reason.trim() || 'Scheduled Tele-Consultation',
      waitingDurationMinutes: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newApt, ...appointments];
    setAppointments(updated);
    saveAppointments(updated);
    setIsBookModalOpen(false);
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesDoctor = selectedDoctorId === 'ALL' || a.doctorId === selectedDoctorId;
    return matchesDoctor;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. HEADER & BOOK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Appointment Schedule & Telemed Slots
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              SLOT MANAGER
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Booked tele-health consults, doctor calendars, and digital outpatient appointments
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book Telemed Slot</span>
        </button>
      </div>

      {/* 2. DATE SELECTOR & DOCTOR FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-slate-900 dark:text-white">Active Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Filter Specialist:</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="ALL">All Available Doctors</option>
            {MOCK_DOCTORS.map(doc => (
              <option key={doc.doctorId} value={doc.doctorId}>
                {doc.name} ({doc.specialty.split('&')[0].trim()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. TIME SLOT CHRONOLOGICAL LIST */}
      <div className="space-y-3">
        {filteredAppointments.map(apt => {
          const isDone = apt.status === 'COMPLETED';
          const isInConsult = apt.status === 'IN_CONSULTATION';

          return (
            <div 
              key={apt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-mono font-black text-center shrink-0 min-w-[85px]">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs">{apt.time}</span>
                </div>

                {/* Patient Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {apt.patientName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {apt.tokenNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {apt.patientAge}y / {apt.patientGender} • {apt.patientPhone}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    Complaint: {apt.reason}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span className="font-semibold">{apt.doctorName}</span>
                    <span className="text-slate-400">• {apt.specialty}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isInConsult
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 animate-pulse'
                    : isDone
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}>
                  {apt.status.replace(/_/g, ' ')}
                </span>

                {can('canStartConsultation') && !isDone && (
                  <Link
                    to={`/eclinic/telemedicine?appointmentId=${apt.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. BOOK TELEMED SLOT MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Book Tele-Health Slot</h3>
                  <p className="text-xs text-slate-400">Schedule remote consultation with a specialist</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Patient Name"
                    value={bookForm.patientName}
                    onChange={(e) => setBookForm({ ...bookForm, patientName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={bookForm.patientPhone}
                    onChange={(e) => setBookForm({ ...bookForm, patientPhone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="42"
                    value={bookForm.patientAge}
                    onChange={(e) => setBookForm({ ...bookForm, patientAge: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={bookForm.patientGender}
                    onChange={(e) => setBookForm({ ...bookForm, patientGender: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Tele-Doctor
                </label>
                <select
                  value={bookForm.doctorId}
                  onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {MOCK_DOCTORS.map(doc => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.name} — {doc.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={bookForm.time}
                    onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Symptoms
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary reason for consult..."
                  value={bookForm.reason}
                  onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EClinicAppointmentsPage;
