import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import { HeartPulse, Users, Bed, UserPlus, FileText, Activity, ArrowRight, TrendingUp, CheckSquare } from 'lucide-react';
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

export const NurseOverviewPage: React.FC = () => {
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);

  const nursePatients = patients.filter(p => p.assignedNurse.includes(currentUser.name) || p.assignedNurse.includes('Vikram') || p.assignedNurse.includes('Priya'));

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

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            NURSE COCKPIT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Welcome, {currentUser.name}</h1>
          <p className="text-xs text-slate-500">{currentUser.specialty || 'ICU Charge Nurse'} · {currentUser.department}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/nurse/add-patient"
            className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient (Multi-Step Form)</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Assigned Patients</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{nursePatients.length}</span>
            <span className="text-[10px] text-teal-600 font-mono">Bedside Care</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">ICU Beds Monitored</span>
            <span className="text-3xl font-black text-emerald-600 block mt-1">{nursePatients.length}</span>
            <span className="text-[10px] text-emerald-600 font-mono">Telemetry Gateway Active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Shift Status</span>
            <span className="text-3xl font-black text-purple-600 block mt-1">On Duty</span>
            <span className="text-[10px] text-purple-600 font-mono">Morning Shift Roster</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* NURSE CLINICAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bedside Telemetry Monitoring Vitals (AreaChart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Bedside Telemetry Stream</h3>
                <p className="text-[11px] text-slate-500 font-mono">Real-time Heart Rate (HR) telemetry for monitored patients</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              LIVE SENSORS
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="nurseHR1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="nurseHR2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="HR_P1" stroke="#10B981" fillOpacity={1} fill="url(#nurseHR1)" strokeWidth={2} name="Bed MICU-01 HR (bpm)" />
                <Area type="monotone" dataKey="HR_P2" stroke="#F59E0B" fillOpacity={1} fill="url(#nurseHR2)" strokeWidth={2} name="Bed MICU-02 HR (bpm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shift Tasks & Vitals Compliance (BarChart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Shift Nursing Compliance</h3>
                <p className="text-[11px] text-slate-500 font-mono">Hourly Vitals & Medication logs</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftTaskProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="VitalsLogged" fill="#10B981" radius={[6, 6, 0, 0]} name="Vitals Logged" />
                <Bar dataKey="MedsAdministered" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Meds Administered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Hub & Assigned Patient List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">Nurse Bedside Patients & Quick Vitals Entry</h2>
          </div>
          <Link to="/nurse/monitoring" className="text-xs font-bold text-teal-700 hover:underline">
            Update Vital Data →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nursePatients.map(p => (
            <div key={p.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{p.name} ({p.id})</h3>
                  <span className="text-xs text-teal-700 font-mono">{p.unitName} · {p.bedNumber}</span>
                </div>
                <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded font-mono text-[10px] font-bold border border-teal-200">
                  {p.status}
                </span>
              </div>

              <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-xl border border-slate-200 flex justify-between">
                <div><span>HR:</span> <span className="text-slate-900 font-bold">{p.vitals.hr} bpm</span></div>
                <div><span>SpO2:</span> <span className="text-teal-700 font-bold">{p.vitals.spo2}%</span></div>
                <div><span>Temp:</span> <span className="text-amber-700 font-bold">{p.vitals.temp}°C</span></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link to="/nurse/monitoring" className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold">
                  Update Monitoring Vitals
                </Link>
                <Link to="/nurse/notes" className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1">
                  <span>Add Note</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
