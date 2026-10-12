import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Bed, 
  Bell, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  ArrowUpRight,
  UserPlus,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Zap,
  Stethoscope,
  Video
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { MOCK_PATIENTS, MOCK_ALERTS } from '../data/mockData';
import { PatientRegistryModal } from '../components/patient/PatientRegistryModal';

export const DashboardPage: React.FC = () => {
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  // Metric Calculations
  const totalBeds = 15;
  const occupiedBeds = MOCK_PATIENTS.length; // 18 occupied
  const availableBeds = totalBeds - occupiedBeds; // 6 available
  const criticalPatients = MOCK_PATIENTS.filter(p => p.status === 'CRITICAL').length; // 5 critical
  const warningPatients = MOCK_PATIENTS.filter(p => p.status === 'WARNING').length; // 7 warning
  const stablePatients = MOCK_PATIENTS.filter(p => p.status === 'STABLE').length; // 6 stable
  const activeAlerts = MOCK_ALERTS.filter(a => a.status === 'ACTIVE').length; // 4 active

  // Chart 1: Bed Occupancy Trend (24-Hour Time Series)
  const occupancyTrendData = [
    { time: '00:00', occupied: 15, available: 9 },
    { time: '04:00', occupied: 16, available: 8 },
    { time: '08:00', occupied: 18, available: 6 },
    { time: '12:00', occupied: 18, available: 6 },
    { time: '16:00', occupied: 19, available: 5 },
    { time: '20:00', occupied: 18, available: 6 },
    { time: '24:00', occupied: 18, available: 6 },
  ];

  // Chart 2: Patient Severity Distribution (Pie Chart)
  const severityDistributionData = [
    { name: 'Critical', value: criticalPatients, color: '#E11D48' }, // Red-rose
    { name: 'Warning', value: warningPatients, color: '#D97706' },   // Amber
    { name: 'Stable', value: stablePatients, color: '#10B981' },     // Emerald
  ];

  // Chart 3: Alert Trends over the last 7 days (Stacked Bar Chart)
  const alertTrendsData = [
    { day: 'Mon', critical: 6, high: 10, medium: 14, info: 8 },
    { day: 'Tue', critical: 4, high: 8, medium: 12, info: 10 },
    { day: 'Wed', critical: 8, high: 14, medium: 18, info: 12 },
    { day: 'Thu', critical: 3, high: 7, medium: 10, info: 6 },
    { day: 'Fri', critical: 5, high: 9, medium: 15, info: 11 },
    { day: 'Sat', critical: 2, high: 6, medium: 8, info: 5 },
    { day: 'Sun', critical: 4, high: 8, medium: 11, info: 7 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MICU-01 COMMAND CENTER • LIVE TELEMETRY STREAM
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              ICU Central Command Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time multisystem monitoring, bed capacity management, predictive AI acuity scoring, and alert trend analysis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRegistryOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Patient Registry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Beds */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Total Beds
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalBeds}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">MICU-01 Unit Capacity</p>
          </div>
        </div>

        {/* Card 2: Occupied Beds */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Occupied
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight">{occupiedBeds}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{Math.round((occupiedBeds/totalBeds)*100)}% Occupancy Rate</p>
          </div>
        </div>

        {/* Card 3: Available Beds */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Available
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{availableBeds}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ready for Admission</p>
          </div>
        </div>

        {/* Card 4: Critical Patients */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Critical Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{criticalPatients}</div>
            <p className="text-[11px] text-rose-500 font-medium mt-0.5">High Acuity Priority</p>
          </div>
        </div>

        {/* Card 5: Warning Patients */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Warning
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{warningPatients}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Moderate Observation</p>
          </div>
        </div>

        {/* Card 6: Active Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Active Alerts
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center animate-pulse">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeAlerts}</div>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Requires Acknowledgment</p>
          </div>
        </div>
      </div>

      {/* 3 Interactive Recharts Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bed Occupancy 24h Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Bed Occupancy Trend (24h)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hourly bed utilization monitoring</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
              75% Avg
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrendData}>
                <defs>
                  <linearGradient id="occupiedColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} domain={[0, 24]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="occupied" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#occupiedColor)" name="Occupied Beds" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Patient Severity Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-rose-600" />
                Patient Acuity Severity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clinical status breakdown</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
              18 Patients
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Alert Trends 7-Day Stacked */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                7-Day Alert Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Telemetry alarm volume</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              Weekly Summary
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="critical" stackId="a" fill="#E11D48" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#D97706" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#2563EB" name="Medium" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
            Quick Clinical Workstation Navigation
          </h2>
          <span className="text-xs font-mono text-slate-400">14 Workstations Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Link to="/patients" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Users className="w-5 h-5 mx-auto text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">Patients</span>
          </Link>

          <Link to="/icu-beds" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Bed className="w-5 h-5 mx-auto text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">ICU Beds</span>
          </Link>

          <Link to="/live-monitoring" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Activity className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">Live Stream</span>
          </Link>

          <Link to="/devices" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Cpu className="w-5 h-5 mx-auto text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">Devices</span>
          </Link>

          <Link to="/nursing" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Stethoscope className="w-5 h-5 mx-auto text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">Nursing</span>
          </Link>

          <Link to="/alerts" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Bell className="w-5 h-5 mx-auto text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">Alerts Center</span>
          </Link>

          <Link to="/virtual-icu" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-center space-y-2 group">
            <Video className="w-5 h-5 mx-auto text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate">Virtual ICU</span>
          </Link>
        </div>
      </div>

      {/* Patient Registry Modal */}
      <PatientRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
