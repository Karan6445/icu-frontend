import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  Legend, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Bed, 
  HeartPulse, 
  ShieldCheck, 
  Bell, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';

// Mock Data Sets for 4 Required Charts
const BED_UTILIZATION_DATA = [
  { time: 'Mon', MICU: 92, SICU: 85, CICU: 78, NICU: 70, average: 81.25 },
  { time: 'Tue', MICU: 95, SICU: 88, CICU: 82, NICU: 75, average: 85.0 },
  { time: 'Wed', MICU: 90, SICU: 92, CICU: 85, NICU: 80, average: 86.75 },
  { time: 'Thu', MICU: 98, SICU: 90, CICU: 88, NICU: 82, average: 89.5 },
  { time: 'Fri', MICU: 96, SICU: 95, CICU: 90, NICU: 85, average: 91.5 },
  { time: 'Sat', MICU: 88, SICU: 82, CICU: 80, NICU: 78, average: 82.0 },
  { time: 'Sun', MICU: 85, SICU: 80, CICU: 75, NICU: 72, average: 78.0 }
];

const MORTALITY_TREND_DATA = [
  { month: 'May', predictedSOFA: 14.2, actualMortality: 11.5, nationalBenchmark: 12.8 },
  { month: 'Jun', predictedSOFA: 13.8, actualMortality: 10.8, nationalBenchmark: 12.8 },
  { month: 'Jul', predictedSOFA: 15.1, actualMortality: 12.2, nationalBenchmark: 12.8 },
  { month: 'Aug', predictedSOFA: 12.9, actualMortality: 9.4, nationalBenchmark: 12.8 },
  { month: 'Sep', predictedSOFA: 14.5, actualMortality: 10.1, nationalBenchmark: 12.8 },
  { month: 'Oct', predictedSOFA: 13.2, actualMortality: 8.9, nationalBenchmark: 12.8 }
];

const ALERT_TREND_DATA = [
  { timeSlot: '00:00', Critical: 2, High: 5, Medium: 12, Low: 8 },
  { timeSlot: '04:00', Critical: 1, High: 3, Medium: 8, Low: 6 },
  { timeSlot: '08:00', Critical: 4, High: 8, Medium: 18, Low: 14 },
  { timeSlot: '12:00', Critical: 3, High: 10, Medium: 22, Low: 16 },
  { timeSlot: '16:00', Critical: 5, High: 12, Medium: 25, Low: 20 },
  { timeSlot: '20:00', Critical: 2, High: 7, Medium: 15, Low: 10 }
];

const COMPLIANCE_TREND_DATA = [
  { week: 'Wk 1', HandHygiene: 92, VAPBundle: 88, CLABSI: 95, DualSignoff: 86, target: 90 },
  { week: 'Wk 2', HandHygiene: 94, VAPBundle: 90, CLABSI: 96, DualSignoff: 88, target: 90 },
  { week: 'Wk 3', HandHygiene: 91, VAPBundle: 85, CLABSI: 94, DualSignoff: 89, target: 90 },
  { week: 'Wk 4', HandHygiene: 95, VAPBundle: 92, CLABSI: 98, DualSignoff: 91, target: 90 },
  { week: 'Wk 5', HandHygiene: 96, VAPBundle: 94, CLABSI: 99, DualSignoff: 94, target: 90 },
  { week: 'Wk 6', HandHygiene: 98, VAPBundle: 96, CLABSI: 100, DualSignoff: 96, target: 90 }
];

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | 'YTD'>('30D');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                ICU Clinical, Quality & Operational Analytics Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time data visualization powered by Recharts • Responsive chart widgets • Clinical KPI tracking
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Filter Controls */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          {(['7D', '30D', '90D', 'YTD'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bed Occupancy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Avg Bed Occupancy Rate
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span>86.4%</span>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                +2.1%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        {/* Actual vs Predicted Mortality */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Actual vs Predicted Mortality
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
              <span>8.9%</span>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                -4.3% SOFA
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        {/* Compliance Index */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Protocol Compliance Index
            </span>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono flex items-center gap-2">
              <span>96.0%</span>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                Exceeds 90% Target
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Daily Alarms Vol */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              24h Telemetry Alarm Volume
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono flex items-center gap-2">
              <span>170</span>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                17 Critical
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4 REQUIRED RECHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: BED UTILIZATION */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Bed className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                1. ICU Bed Utilization Trend (%)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              MICU / SICU / CICU / NICU
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BED_UTILIZATION_DATA}>
                <defs>
                  <linearGradient id="colorMICU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSICU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis domain={[50, 100]} fontSize={11} stroke="#64748b" tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="MICU" stroke="#0D9488" fillOpacity={1} fill="url(#colorMICU)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="SICU" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSICU)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="CICU" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="NICU" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: MORTALITY TREND */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                2. Predicted SOFA vs Actual ICU Mortality Trend (%)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Risk-Adjusted Survival
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MORTALITY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis domain={[0, 20]} fontSize={11} stroke="#64748b" tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={12.8} label={{ value: 'National Benchmark (12.8%)', fill: '#94a3b8', fontSize: 10 }} stroke="#94a3b8" strokeDasharray="4 4" />
                <Line type="monotone" name="SOFA Predicted Risk %" dataKey="predictedSOFA" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="Actual ICU Mortality %" dataKey="actualMortality" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: ALERT TREND */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Bell className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                3. 24h Telemetry Alert Breakdown by Severity
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-500">
              Critical / High / Med / Low
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ALERT_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="timeSlot" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Critical" fill="#F43F5E" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="High" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Medium" fill="#EAB308" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Low" fill="#3B82F6" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: COMPLIANCE TREND */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                4. Quality Bundle & SOP Compliance Score (%)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-teal-500">
              Target: &gt; 90%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COMPLIANCE_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="week" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis domain={[80, 100]} fontSize={11} stroke="#64748b" tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={90} label={{ value: 'Target 90%', fill: '#10B981', fontSize: 10 }} stroke="#10B981" strokeDasharray="3 3" />
                <Line type="monotone" name="Hand Hygiene %" dataKey="HandHygiene" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="VAP Care Bundle %" dataKey="VAPBundle" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="CLABSI Care Bundle %" dataKey="CLABSI" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="Dual Signoff %" dataKey="DualSignoff" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
