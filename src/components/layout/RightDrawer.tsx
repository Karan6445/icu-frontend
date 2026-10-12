import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Bell,
  CheckSquare,
  AlertTriangle,
  Heart,
  Activity,
  Wind,
  Thermometer,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Plus,
  Clock,
  Check,
  CheckCircle2,
  Syringe,
  FileSpreadsheet
} from 'lucide-react';

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'patient' | 'alerts' | 'tasks';
  selectedPatientId?: string;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  defaultTab = 'patient',
  selectedPatientId = 'P-1024'
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'patient' | 'alerts' | 'tasks'>(defaultTab);

  // Synchronize when defaultTab changes
  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Mock patient quick details
  const patient = {
    id: selectedPatientId,
    name: 'Rahul Sharma',
    mrn: 'MRN-2024-8849',
    age: 42,
    gender: 'Male',
    bedNumber: 'Bed 04',
    unitName: 'MICU-01',
    diagnosis: 'Severe Community-Acquired Pneumonia, Septic Shock',
    codeStatus: 'FULL CODE',
    allergies: ['Penicillin (Anaphylaxis)', 'Sulfa Drugs (Rash)'],
    doctor: 'Dr. Anand Verma (Intensivist)',
    nurse: 'RN Priya Singh',
    vitals: {
      hr: 88,
      bp: '118/76 (MAP 90)',
      spo2: 98,
      rr: 16,
      temp: '37.1 °C',
      etco2: '36 mmHg',
      gcs: '15/15'
    },
    lines: [
      { name: 'Right Internal Jugular CVC', day: 'Day 3', site: 'Neck' },
      { name: 'Radial Arterial Line (Left)', day: 'Day 2', site: 'Wrist' },
      { name: 'Endotracheal Tube 7.5mm', day: 'Day 1', depth: '22cm at teeth' },
      { name: 'Foley Urinary Catheter', day: 'Day 3', uop: '55 ml/hr' }
    ]
  };

  // Mock Active Alerts
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-101',
      severity: 'CRITICAL',
      title: 'Tachycardia / Arrhythmia Warning',
      message: 'Sustained heart rate > 125 bpm for 4 minutes (telemetry)',
      time: '2 mins ago',
      source: 'Philips IntelliVue MX800',
      acknowledged: false
    },
    {
      id: 'ALT-102',
      severity: 'WARNING',
      title: 'Ventilator High Peak Pressure',
      message: 'Peak Inspiratory Pressure 38 cmH2O (Limit: 35 cmH2O)',
      time: '14 mins ago',
      source: 'Hamilton-G5 Vent',
      acknowledged: true
    },
    {
      id: 'ALT-103',
      severity: 'ADVISORY',
      title: 'Lab Result Critical: Serum Lactate',
      message: 'Lactate reported 3.8 mmol/L (Baseline: 1.8)',
      time: '28 mins ago',
      source: 'Central Pathology LIS',
      acknowledged: true
    }
  ]);

  // Mock Quick Tasks
  const [tasks, setTasks] = useState([
    { id: 'TSK-1', title: 'Administer IV Meropenem 1g', due: 'In 10 min', type: 'MED', done: false },
    { id: 'TSK-2', title: 'Send 4-Hour Arterial Blood Gas (ABG)', due: 'In 35 min', type: 'LAB', done: false },
    { id: 'TSK-3', title: 'Perform Neurological GCS & Pupil Assessment', due: 'Hourly', type: 'NURSE', done: true },
    { id: 'TSK-4', title: 'Acknowledge Chest X-Ray Portable', due: 'Pending Review', type: 'ORDER', done: false }
  ]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-800 dark:text-slate-200 animate-in slide-in-from-right duration-300 select-none">
      {/* Drawer Top Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <h2 className="font-black text-sm text-slate-900 dark:text-white tracking-wide uppercase font-sans">
            Quick Details Panel
          </h2>
          <span className="text-[10px] font-mono text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-1.5 py-0.5 rounded font-bold">
            {patient.bedNumber}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3 Nav Tabs: Patient | Alerts | Tasks */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 text-xs font-bold font-mono">
        <button
          onClick={() => setActiveTab('patient')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'patient'
              ? 'border-teal-600 text-teal-700 bg-white dark:bg-teal-950/30 dark:border-teal-400 dark:text-teal-300 shadow-xs'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all relative ${
            activeTab === 'alerts'
              ? 'border-rose-600 text-rose-700 bg-white dark:bg-rose-950/30 dark:border-rose-500 dark:text-rose-300 shadow-xs'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Alerts</span>
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'tasks'
              ? 'border-amber-600 text-amber-700 bg-white dark:bg-amber-950/30 dark:border-amber-400 dark:text-amber-300 shadow-xs'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-700 dark:text-slate-300 font-bold">
            {tasks.filter(t => !t.done).length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* ================= TAB 1: PATIENT ================= */}
        {activeTab === 'patient' && (
          <div className="space-y-4 text-xs">
            {/* Primary Identification Card */}
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{patient.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {patient.id} · {patient.mrn} · {patient.age}y / {patient.gender}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40">
                  {patient.codeStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">ADMITTING DIAGNOSIS</span>
                <span className="text-slate-800 dark:text-white font-semibold">{patient.diagnosis}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">ATTENDING PHYSICIAN</span>
                  <span className="text-teal-700 dark:text-teal-300 font-bold truncate block">{patient.doctor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">PRIMARY NURSE</span>
                  <span className="text-teal-700 dark:text-teal-300 font-bold truncate block">{patient.nurse}</span>
                </div>
              </div>
            </div>

            {/* Live Vitals Snapshot */}
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  LIVE VITALS TELEMETRY
                </span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">● REALTIME</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">HEART RATE</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">{patient.vitals.hr}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">bpm</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">BLOOD PRESS.</span>
                  <span className="text-sm font-black text-purple-700 dark:text-purple-300 leading-tight block mt-0.5">{patient.vitals.bp}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">SpO2</span>
                  <span className="text-lg font-black text-sky-600 dark:text-sky-400">{patient.vitals.spo2}%</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Room Air</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">RESP RATE</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{patient.vitals.rr}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">/min</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">TEMP</span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-300">{patient.vitals.temp}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">GCS NEURO</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{patient.vitals.gcs}</span>
                </div>
              </div>
            </div>

            {/* Allergies Card */}
            <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 font-bold block flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                VERIFIED ALLERGIES & CONTRAINDICATIONS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((alg, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {alg}
                  </span>
                ))}
              </div>
            </div>

            {/* Lines, Tubes & Drains */}
            <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block uppercase">
                Active Invasive Lines & Drains
              </span>
              <div className="space-y-1.5">
                {patient.lines.map((line, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-900 dark:text-white font-semibold">{line.name}</span>
                    <span className="text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.2 rounded border border-teal-200 dark:border-teal-800 text-[10px] font-bold">
                      {line.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Navigation */}
            <button
              onClick={() => {
                onClose();
                navigate(`/patient/${patient.id}`);
              }}
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>Open Complete 12-Tab Patient Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= TAB 2: ALERTS ================= */}
        {activeTab === 'alerts' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold">ACTIVE UNIT ALERTS</span>
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                {alerts.filter(a => !a.acknowledged).length} PENDING ACK
              </span>
            </div>

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border shadow-xs transition-all ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/80 dark:text-rose-100'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/80 dark:text-amber-100'
                    : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className={`w-3.5 h-3.5 ${
                      alert.severity === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'
                    }`} />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{alert.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">{alert.time}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{alert.message}</p>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{alert.source}</span>
                  {alert.acknowledged ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition-colors shadow-xs"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                onClose();
                navigate('/alerts');
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold font-mono text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <span>View Alert Center (Screen 18)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= TAB 3: TASKS ================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold">CLINICAL ORDERS & TASKS</span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                {tasks.filter(t => !t.done).length} REMAINING
              </span>
            </div>

            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 shadow-xs ${
                  task.done
                    ? 'bg-slate-50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800/60 opacity-60'
                    : 'bg-white border-slate-200 hover:border-teal-500 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    task.done ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900'
                  }`}
                >
                  {task.done && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`block font-semibold text-xs leading-snug ${task.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="text-amber-600 dark:text-amber-300 font-bold">{task.due}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-300 font-bold">
                      {task.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/nursing');
                }}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold font-mono text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <span>Go to Nursing Flowsheet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightDrawer;
