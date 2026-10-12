import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import {
  Users,
  Bed,
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminOverviewPage: React.FC = () => {
  const { patients } = useAppSelector(state => state.patient);
  const { beds, units } = useAppSelector(state => state.icuBed);
  const { doctors } = useAppSelector(state => state.doctor);
  const { nurses } = useAppSelector(state => state.nurse);
  const { shifts } = useAppSelector(state => state.shift);

  // Statistics Calculation
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'CRITICAL' || p.status === 'HIGH' || p.status === 'MEDIUM').length;
  const totalDoctors = doctors.length;
  const totalNurses = nurses.length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const criticalPatients = patients.filter(p => p.status === 'CRITICAL').length;
  const activeShifts = shifts.filter(s => s.activeStatus === 'ACTIVE').length;

  // Recharts Data Sets
  const unitCapacityData = units.map(u => ({
    name: u.code,
    fullName: u.name,
    Occupied: u.occupiedBeds,
    Available: u.availableBeds,
  }));

  const patientAcuityData = [
    { name: 'Critical (Red)', value: patients.filter(p => p.status === 'CRITICAL').length || 2, color: '#EF4444' },
    { name: 'High Observation (Amber)', value: patients.filter(p => p.status === 'HIGH').length || 3, color: '#F59E0B' },
    { name: 'Medium Care (Teal)', value: patients.filter(p => p.status === 'MEDIUM').length || 4, color: '#10B981' },
    { name: 'Stable (Gray)', value: patients.filter(p => p.status === 'STABLE').length || 2, color: '#6B7280' }
  ];

  const admissionTrendData = [
    { time: '00:00', Admissions: 2, Discharges: 1, Occupancy: 72 },
    { time: '04:00', Admissions: 4, Discharges: 2, Occupancy: 76 },
    { time: '08:00', Admissions: 7, Discharges: 5, Occupancy: 82 },
    { time: '12:00', Admissions: 5, Discharges: 6, Occupancy: 79 },
    { time: '16:00', Admissions: 8, Discharges: 4, Occupancy: 85 },
    { time: '20:00', Admissions: 3, Discharges: 3, Occupancy: 83 }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            ADMINISTRATION CONSOLE
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">ICU Admin System Overview</h1>
          <p className="text-xs text-slate-500">Enterprise operational analytics, real-time bed capacity graphs, staff rosters, and patient triage distribution.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/beds"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2"
          >
            <Bed className="w-4 h-4 text-teal-600" />
            <span>Manage Beds</span>
          </Link>
          <Link
            to="/admin/patients"
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md"
          >
            <Users className="w-4 h-4" />
            <span>Manage Patients</span>
          </Link>
        </div>
      </div>

      {/* 8 Required Admin Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Total Patients</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{totalPatients}</span>
            <span className="text-[10px] text-teal-700 font-mono font-bold">Registered Census</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Active Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Active Patients</span>
            <span className="text-3xl font-black text-emerald-600 block mt-1">{activePatients}</span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">In-Unit Care</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Total Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Total Doctors</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{totalDoctors}</span>
            <span className="text-[10px] text-teal-700 font-mono font-bold">Attending Consultants</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Total Nurses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Total Nurses</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{totalNurses}</span>
            <span className="text-[10px] text-blue-700 font-mono font-bold">Registered Nurses</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        {/* 5. Available Beds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Available Beds</span>
            <span className="text-3xl font-black text-emerald-600 block mt-1">{availableBeds}</span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">Ready for Admission</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        {/* 6. Occupied Beds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Occupied Beds</span>
            <span className="text-3xl font-black text-amber-600 block mt-1">{occupiedBeds}</span>
            <span className="text-[10px] text-amber-700 font-mono font-bold">Continuous Telemetry</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        {/* 7. Critical Patients */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-rose-600 uppercase">Critical Patients</span>
            <span className="text-3xl font-black text-rose-600 block mt-1">{criticalPatients}</span>
            <span className="text-[10px] text-rose-700 font-mono font-bold">High Triage Priority</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* 8. Active Shifts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Active Shifts</span>
            <span className="text-3xl font-black text-purple-600 block mt-1">{activeShifts}</span>
            <span className="text-[10px] text-purple-700 font-mono font-bold">On Duty Staff Roster</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ADMIN ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bed Capacity by Unit (BarChart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0F766E]" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Unit-wise ICU Bed Capacity</h3>
                <p className="text-[11px] text-slate-500 font-mono">Available vs Occupied beds across MICU, SICU, CICU, NICU</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              REAL-TIME
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitCapacityData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F766E', borderColor: '#0D655E', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Occupied" fill="#0F766E" radius={[6, 6, 0, 0]} name="Occupied Beds" />
                <Bar dataKey="Available" fill="#10B981" radius={[6, 6, 0, 0]} name="Available Beds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Patient Acuity Breakdown (PieChart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#0F766E]" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Patient Acuity Triage</h3>
                <p className="text-[11px] text-slate-500 font-mono">Census distribution by severity</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientAcuityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patientAcuityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F766E', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{totalPatients}</span>
              <span className="text-[10px] font-mono text-slate-500">Patients</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {patientAcuityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium truncate">{item.name.split(' ')[0]}</span>
                <span className="font-bold font-mono text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: 24-Hour Admissions & Occupancy Trend (AreaChart) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0F766E]" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">24-Hour Admission vs Discharge Flow</h3>
              <p className="text-[11px] text-slate-500 font-mono">Real-time ICU throughput and percentage bed occupancy rate</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={admissionTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDischarges" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0F766E', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Admissions" stroke="#0F766E" fillOpacity={1} fill="url(#colorAdmissions)" strokeWidth={2} />
              <Area type="monotone" dataKey="Discharges" stroke="#10B981" fillOpacity={1} fill="url(#colorDischarges)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table View Component 1: Active ICU Patients Summary Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">Active ICU Patients Census Table</h2>
          </div>
          <Link to="/admin/patients" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
            <span>View All Patients ({patients.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Patient Name</th>
                <th className="p-3">MRN / ID</th>
                <th className="p-3">Unit / Bed</th>
                <th className="p-3">Acuity Status</th>
                <th className="p-3">Attending Doctor</th>
                <th className="p-3">Assigned Nurse</th>
                <th className="p-3">Vitals (HR / SpO2 / MAP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {patients.slice(0, 5).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div>{p.name}</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{p.age}Y · {p.gender} · {p.bloodGroup}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{p.mrn}</td>
                  <td className="p-3">
                    <span className="font-bold text-teal-700 dark:text-teal-400">{p.unitName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{p.bedNumber}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      p.status === 'CRITICAL'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                        : p.status === 'HIGH'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800 dark:text-slate-200">{p.assignedClinician}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200">{p.assignedNurse}</td>
                  <td className="p-3 font-mono text-xs">
                    <span className="text-slate-900 dark:text-white font-bold">{p.vitals.hr} bpm</span> / <span className="text-teal-700 dark:text-teal-400 font-bold">{p.vitals.spo2}%</span> / <span className="text-slate-600 dark:text-slate-400">{p.vitals.map} mmHg</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table View Component 2: ICU Unit Bed Capacity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-extrabold text-slate-900">ICU Units Capacity Summary</h2>
            </div>
            <Link to="/admin/beds" className="text-xs font-bold text-teal-700 hover:underline">
              Bed Status →
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {units.map(u => (
              <div key={u.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{u.name} ({u.code})</h4>
                  <span className="text-[10px] text-slate-500">{u.floor} · Lead: {u.headDoctor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-bold">
                    {u.availableBeds} Available
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-bold">
                    {u.occupiedBeds} / {u.totalBeds} Occupied
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Staff Shifts Summary Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-extrabold text-slate-900">Active Duty Roster</h2>
            </div>
            <Link to="/admin/shifts" className="text-xs font-bold text-teal-700 hover:underline">
              Shift Roster →
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {shifts.map(s => (
              <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{s.name} ({s.unit})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.activeStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {s.timeRange}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <span className="text-slate-500">Doctors:</span> {s.assignedDoctors.join(', ')}
                </div>
                <div className="text-[11px] text-slate-700">
                  <span className="text-slate-500">Nurses:</span> {s.assignedNurses.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
