import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Users,
  Bed,
  UserPlus,
  FileText,
  Activity,
  ArrowRight,
  CheckSquare,
  ShieldCheck,
  X,
  CheckCircle2,
  Sliders,
  Sparkles,
  ClipboardList,
  Layers,
  Network,
  Clock,
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  CHARGE_NURSE_DETAILED_PERMISSIONS,
  ChargeNursePermission
} from '../../config/rbacConfig';
import { updateBedStatus, BedStatus } from '../../store/slices/icuBedSlice';

export const NurseOverviewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);
  const { beds } = useAppSelector(state => state.icuBed);

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  
  // Bed Status quick update modal state
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState<string>(beds[0]?.id || 'B-101');
  const [selectedNewStatus, setSelectedNewStatus] = useState<BedStatus>('Available');
  const [bedUpdateNotice, setBedUpdateNotice] = useState<string | null>(null);

  const nursePatients = patients.filter(
    p =>
      p.assignedNurse.includes(currentUser.name) ||
      p.assignedNurse.includes('Vikram') ||
      p.assignedNurse.includes('Priya')
  );

  // Filter permissions based on category tab in modal
  const filteredPermissions =
    selectedCategoryFilter === 'ALL'
      ? CHARGE_NURSE_DETAILED_PERMISSIONS
      : CHARGE_NURSE_DETAILED_PERMISSIONS.filter(
          p => p.category === selectedCategoryFilter
        );

  const handleApplyBedStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    const bed = beds.find(b => b.id === selectedBedId);
    if (bed) {
      dispatch(
        updateBedStatus({
          bedId: selectedBedId,
          status: selectedNewStatus,
          notes: `Updated by Charge Nurse ${currentUser.name} on ${new Date().toLocaleTimeString()}`
        })
      );
      setBedUpdateNotice(
        `Bed ${bed.bedNumber} status updated to "${selectedNewStatus}" via bed:update authority.`
      );
      setTimeout(() => setBedUpdateNotice(null), 4000);
      setIsBedModalOpen(false);
    }
  };

  // Nurse Cockpit Telemetry Stream Chart Mock Data
  const telemetryData = [
    { time: '08:00', HR_P1: 82, SpO2_P1: 99, HR_P2: 95, SpO2_P2: 96 },
    { time: '09:00', HR_P1: 86, SpO2_P1: 98, HR_P2: 92, SpO2_P2: 97 },
    { time: '10:00', HR_P1: 90, SpO2_P1: 97, HR_P2: 98, SpO2_P2: 95 },
    { time: '11:00', HR_P1: 84, SpO2_P1: 99, HR_P2: 90, SpO2_P2: 98 },
    { time: '12:00', HR_P1: 88, SpO2_P1: 98, HR_P2: 89, SpO2_P2: 98 },
    { time: '13:00', HR_P1: 85, SpO2_P1: 99, HR_P2: 91, SpO2_P2: 97 }
  ];

  const shiftTaskProgress = [
    { hour: '08:00', VitalsLogged: 3, MedsAdministered: 3 },
    { hour: '10:00', VitalsLogged: 3, MedsAdministered: 2 },
    { hour: '12:00', VitalsLogged: 3, MedsAdministered: 3 },
    { hour: '14:00', VitalsLogged: 2, MedsAdministered: 1 }
  ];

  const availableBedsCount = beds.filter(b => b.status === 'Available').length;
  const occupiedBedsCount = beds.filter(b => b.status === 'Occupied').length;

  return (
    <div className="space-y-6 pb-14 font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {bedUpdateNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{bedUpdateNotice}</span>
          </div>
          <button
            onClick={() => setBedUpdateNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold rounded-full">
              CHARGE NURSE COCKPIT · CLINICAL LEAD
            </span>

            {/* 18 Permissions Active Badge */}
            <button
              onClick={() => setIsPermModalOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 hover:from-teal-500/20 hover:to-emerald-500/20 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 font-mono text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Click to inspect your 18 authoritative permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>18 Active Permissions Verified</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.specialty || 'ICU Charge Nurse & Clinical Care Lead'} · {currentUser.department} · {currentUser.hospital}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBedModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Bed className="w-4 h-4 text-teal-600" />
            <span>Update Bed Status</span>
          </button>

          <Link
            to="/nurse/add-patient"
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register & Admit Patient</span>
          </Link>
        </div>
      </div>

      {/* 4 OPERATIONAL DOMAIN ACCELERATORS (Mapping to the 18 Permissions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Domain 1: Clinical Care & Telemetry (clinical:create, read, update) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-teal-400 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                Clinical Care & Vitals
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-700">
                3 PERMS
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Bedside Telemetry</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Continuous vitals capture, telemetry monitoring & nursing notes.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              to="/nurse/monitoring"
              className="font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Capture Vitals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/nurse/notes"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Shift Notes
            </Link>
          </div>
        </div>

        {/* Domain 2: Bed & Ward Allocation (bed:create, read, update, icu:*) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Beds & ICU Units
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-700">
                6 PERMS
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {availableBedsCount} Available / {beds.length} Total
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Real-time ICU bed grid, ventilator status & status allocation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              to="/nurse/beds"
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Bed Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/bed-map"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Bed Map
            </Link>
          </div>
        </div>

        {/* Domain 3: Patient Master Census (patient:create, read, update, write, demographics:*) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Patient Census & Demographics
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-700">
                6 PERMS
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {patients.length} Active Patients
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Master patient enrollment, demographic updates & acuity triage.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              to="/nurse/patients"
              className="font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Active Census</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/nurse/add-patient"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              + Enroll
            </Link>
          </div>
        </div>

        {/* Domain 4: Admissions & Encounters (admission:create, read, update) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-400 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                Admissions & Triage
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 dark:border-purple-700">
                3 PERMS
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Admissions Intake
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Direct emergency admission, ER transfers & encounter status updates.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              to="/admin/encounters"
              className="font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Encounters Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/handover"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Handover
            </Link>
          </div>
        </div>
      </div>

      {/* NURSE CLINICAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bedside Telemetry Monitoring Vitals (AreaChart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Bedside Telemetry Stream (clinical:read)
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Continuous Heart Rate (HR) telemetry for monitored patients
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SENSORS</span>
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="nurseHR1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="nurseHR2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderRadius: '12px',
                    color: '#0F172A',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="HR_P1"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#nurseHR1)"
                  strokeWidth={2}
                  name="Bed MICU-01 HR (bpm)"
                />
                <Area
                  type="monotone"
                  dataKey="HR_P2"
                  stroke="#F59E0B"
                  fillOpacity={1}
                  fill="url(#nurseHR2)"
                  strokeWidth={2}
                  name="Bed MICU-02 HR (bpm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shift Tasks & Vitals Compliance (BarChart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Shift Compliance (clinical:update)
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Hourly vitals logging & medication administration
                </p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftTaskProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderRadius: '10px',
                    color: '#0F172A',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="VitalsLogged" fill="#10B981" radius={[6, 6, 0, 0]} name="Vitals Logged" />
                <Bar dataKey="MedsAdministered" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Meds Administered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bedside Patients Roster & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Assigned ICU Patients & Immediate Bedside Actions
              </h2>
              <p className="text-[11px] text-slate-500">
                Exercise your clinical:create (record vitals) and patient:write (clinical charting) permissions.
              </p>
            </div>
          </div>
          <Link
            to="/nurse/monitoring"
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Update All Vitals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nursePatients.map(p => (
            <div
              key={p.id}
              className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {p.name} ({p.id})
                  </h3>
                  <span className="text-xs text-teal-700 dark:text-teal-400 font-mono">
                    {p.unitName} · {p.bedNumber}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded font-mono text-[10px] font-bold border border-teal-200">
                  {p.status}
                </span>
              </div>

              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                <div>
                  <span>HR:</span>{' '}
                  <span className="text-slate-900 dark:text-white font-bold">{p.vitals.hr} bpm</span>
                </div>
                <div>
                  <span>SpO2:</span>{' '}
                  <span className="text-teal-700 dark:text-teal-400 font-bold">{p.vitals.spo2}%</span>
                </div>
                <div>
                  <span>Temp:</span>{' '}
                  <span className="text-amber-700 dark:text-amber-400 font-bold">{p.vitals.temp}°C</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  to="/nurse/monitoring"
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-xl text-xs font-bold"
                >
                  Record Vitals (clinical:create)
                </Link>
                <Link
                  to="/nurse/notes"
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1"
                >
                  <span>Add Note (clinical:update)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL 1: 18 PERMISSIONS INSPECTOR MODAL ================= */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-teal-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Charge Nurse Privilege & Security Matrix
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300">
                      18 ACTIVE PERMISSIONS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    User: {currentUser.email} • Role: CHARGE_NURSE • Facility: {currentUser.hospitalId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPermModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Security Architecture Summary Ribbons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                  Authoritative Scope
                </span>
                <span className="text-base font-black text-emerald-600">18 Granted Permissions</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Full ICU clinical & ward scope</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                  Forensic Protection
                </span>
                <span className="text-base font-black text-amber-600">0 Deletions Allowed</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Audit-immutable clinical records</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                  Clinical Boundaries
                </span>
                <span className="text-base font-black text-blue-600">Administration & MAR</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Drug prescribing reserved for Doctors</span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {[
                { id: 'ALL', label: 'All 18 Permissions (18)' },
                { id: 'Clinical Care & Telemetry', label: 'Clinical Care (3)' },
                { id: 'Bed & Ward Allocation', label: 'Bed & ICU Units (6)' },
                { id: 'Patient Census & Demographics', label: 'Patient Census (6)' },
                { id: 'Admissions & Intake Encounters', label: 'Admissions (3)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-bold ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Permissions List */}
            <div className="p-6 overflow-y-auto space-y-2.5 max-h-[50vh]">
              {filteredPermissions.map(perm => (
                <div
                  key={perm.code}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-700">
                        {perm.code}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                        {perm.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Module: {perm.module}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{perm.description}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ACTIVE</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                Showing {filteredPermissions.length} of 18 granted permissions
              </span>
              <button
                onClick={() => setIsPermModalOpen(false)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: QUICK BED STATUS UPDATER (bed:update) ================= */}
      {isBedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Update ICU Bed Status (bed:update)
                </h3>
              </div>
              <button
                onClick={() => setIsBedModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyBedStatusChange} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Select ICU Bed *
                </label>
                <select
                  value={selectedBedId}
                  onChange={e => setSelectedBedId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                >
                  {beds.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({b.icuName}) - Current: {b.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  New Operational Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Available', 'Occupied', 'Reserved', 'Maintenance'] as BedStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedNewStatus(st)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        selectedNewStatus === st
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-300 font-mono">
                Authorized under <span className="font-bold">bed:update</span> for ICU Charge Nurse.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBedModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Apply Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
