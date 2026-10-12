import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Search, 
  Video, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Award,
  Users,
  Building2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { MOCK_DOCTORS } from '../../data/mockEclinicData';
import { DoctorAvailability } from '../../types/eclinic';

export const EClinicDoctorsPage: React.FC = () => {
  const { role, can } = useRBAC();
  const [doctors, setDoctors] = useState<DoctorAvailability[]>(MOCK_DOCTORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  const specialties = ['ALL', 'General Physician', 'Pulmonologist', 'Cardiologist', 'Pediatrician'];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = 
      selectedSpecialty === 'ALL' || doc.specialty.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  const toggleDoctorStatus = (doctorId: string) => {
    setDoctors(prev => prev.map(d => {
      if (d.doctorId === doctorId) {
        return { ...d, isOnline: !d.isOnline };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tele-Specialist & Doctor Directory
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {doctors.filter(d => d.isOnline).length} ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Board-certified tele-physicians, consultation availability, and queue load balancing
          </p>
        </div>

        {can('canStartConsultation') && (
          <Link
            to="/eclinic/doctor-workspace"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>Open Doctor Workspace</span>
          </Link>
        )}
      </div>

      {/* 2. SEARCH & SPECIALTY FILTER CHIPS */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search doctor by name, qualification, or clinical specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* 3. DOCTOR ROSTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map(doc => {
          return (
            <div 
              key={doc.doctorId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-teal-500/50 transition-all space-y-4"
            >
              <div>
                {/* Doctor Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        doc.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        {doc.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                        <span>{doc.qualification}</span>
                        <span>•</span>
                        <span>{doc.experience}</span>
                      </div>
                    </div>
                  </div>

                  {/* Online/Offline Status Toggle */}
                  <button
                    onClick={() => toggleDoctorStatus(doc.doctorId)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border transition-colors cursor-pointer ${
                      doc.isOnline
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200'
                    }`}
                    title="Click to toggle availability"
                  >
                    {doc.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>

                {/* License & Assigned Clinic */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lic: {doc.licenseNumber}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.clinicName}</span>
                  </div>
                </div>

                {/* Queue Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Today's Total</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {doc.todayAppointmentsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">In Queue</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {doc.waitingPatientsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Consulted</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {doc.completedTodayCount}
                    </span>
                  </div>
                </div>

                {/* OPD Schedule */}
                <div className="mt-3 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Telemed Shift Timings
                  </span>
                  {doc.schedule.map((sch, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                      <span>{sch.dayOfWeek}</span>
                      <span>{sch.startTime} - {sch.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Link
                  to={`/eclinic/appointments`}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-colors"
                >
                  Book Patient Slot
                </Link>

                {can('canStartConsultation') && (
                  <Link
                    to="/eclinic/doctor-workspace"
                    className="flex-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Open Station</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EClinicDoctorsPage;
