import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  Bed, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  Stethoscope, 
  Cpu, 
  ChevronLeft,
  Pill,
  TestTube,
  CheckCircle2,
  Calendar,
  MessageSquarePlus
} from 'lucide-react';
import { MOCK_PATIENTS, MOCK_DEVICES } from '../data/mockData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { AddRemarkModal } from '../components/patient/AddRemarkModal';

export const PatientDashboardPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TELEMETRY' | 'LABS' | 'MEDS' | 'DEVICES' | 'NOTES' | 'HISTORY'>('OVERVIEW');
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);

  // Redux patients state if available, or fallback to mockData
  const { patients: reduxPatients } = useAppSelector(state => state.patient);

  // Find patient or fallback to Ramesh Gupta / first mock patient
  const reduxPatient = reduxPatients.find(p => p.id === patientId || p.bedNumber === patientId);
  const mockPatient = MOCK_PATIENTS.find(p => p.id === patientId || p.bedNumber === patientId) || MOCK_PATIENTS[0];

  const patient = reduxPatient || mockPatient;

  const getVal = (v: any) => (typeof v === 'object' && v !== null && 'value' in v ? v.value : v);
  const codeStatusStr = (patient as any).codeStatus || 'FULL CODE';

  // Local list of remarks added during session to immediately display in UI
  const [localRemarks, setLocalRemarks] = useState<Array<{ id: string; category: string; priority: string; doctorName: string; details: string; date: string }>>([
    {
      id: 'rem-1',
      category: 'Ventilator / Respiratory Plan',
      priority: 'HIGH (Priority Round Directive)',
      doctorName: 'Dr. Rahul Sharma',
      details: 'Maintain VC-AC mode, FiO2 40%, target PaO2 > 80 mmHg. Weaning assessment at 08:00 AM if ABG stable.',
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }
  ]);

  const handleRemarkAdded = (data: { category: string; priority: string; doctorName: string; details: string }) => {
    setLocalRemarks(prev => [
      {
        id: `rem-${Date.now()}`,
        category: data.category,
        priority: data.priority,
        doctorName: data.doctorName,
        details: data.details,
        date: new Date().toISOString().slice(0, 16).replace('T', ' ')
      },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button & Patient Identity Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </button>
        <span className="text-xs font-mono text-slate-400">Single Patient Hub • Bed {patient.bedNumber}</span>
      </div>

      {/* Main Patient Identity Card Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center border-2 border-teal-400 shadow-md shrink-0">
            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-sans">{patient.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                patient.status === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  : patient.status === 'WARNING'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              }`}>
                {patient.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>MRN: <strong className="text-slate-800 dark:text-slate-200">{patient.mrn}</strong></span>
              <span>•</span>
              <span>Bed: <strong className="text-slate-800 dark:text-slate-200">{patient.bedNumber}</strong></span>
              <span>•</span>
              <span>Age/Gender: <strong className="text-slate-800 dark:text-slate-200">{patient.age}y / {patient.gender}</strong></span>
            </div>
          </div>
        </div>

        {/* Attending Team & Safety Badges */}
        <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
          <div className="space-y-1 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Attending Team</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">{patient.assignedClinician}</div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">RN: {patient.assignedNurse}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900">
              ALLERGIES: Penicillin
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 font-mono">
              {codeStatusStr}
            </span>
            <button
              onClick={() => setIsAddRemarkOpen(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] active:bg-[#0A524D] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ml-1"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Add Remark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Clinical Overview
        </button>

        <button
          onClick={() => setActiveTab('TELEMETRY')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'TELEMETRY'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Live Telemetry & Vitals
        </button>

        <button
          onClick={() => setActiveTab('LABS')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'LABS'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Labs & Diagnostics
        </button>

        <button
          onClick={() => setActiveTab('MEDS')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'MEDS'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Medications & MAR
        </button>

        <button
          onClick={() => setActiveTab('DEVICES')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DEVICES'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Connected Devices
        </button>

        <button
          onClick={() => setActiveTab('NOTES')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'NOTES'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Clinical Notes & Progress
        </button>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Live Vitals Gauge Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Heart Rate</span>
              <div className="text-2xl font-black text-rose-600 font-mono">{String(getVal(patient.vitals.hr))} <span className="text-xs font-normal text-slate-400">bpm</span></div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Blood Pressure</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{String(getVal(patient.vitals.bpSystolic))}/{String(getVal(patient.vitals.bpDiastolic))}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">SpO2 Oxygen</span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">{String(getVal(patient.vitals.spo2))}%</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">MAP</span>
              <div className="text-2xl font-black text-amber-600 font-mono">{String(getVal(patient.vitals.map))} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Resp Rate</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{String(getVal(patient.vitals.rr))} <span className="text-xs font-normal text-slate-400">/min</span></div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Temperature</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{String(getVal(patient.vitals.temp))}°C</div>
            </div>
          </div>

          {/* 2 Columns: Clinical Summary & Latest Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Primary Diagnosis & Clinical Summary
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                {patient.admittingDiagnosis}. Patient admitted for intensive monitoring, vasopressor titration, and invasive ventilatory support. Systemic inflammatory response monitored closely.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Latest Nursing Shift Assessment
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div><strong>Neurological:</strong> Sedated (RASS -2), pupils equal and reactive 3mm.</div>
                <div><strong>Respiratory:</strong> Ventilated on VC-AC mode, FiO2 40%, PEEP 8 cmH2O. Equal air entry bilateral.</div>
                <div><strong>Cardiovascular:</strong> Norepinephrine infusion ongoing to maintain MAP &gt; 65 mmHg.</div>
              </div>
            </div>
          </div>

          {/* Clinical Remarks & Directives Log */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-teal-600" />
                <span>Recorded Clinical Remarks & Directives</span>
              </h2>
              <button
                onClick={() => setIsAddRemarkOpen(true)}
                className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Add Remark</span>
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {localRemarks.map((rem) => (
                <div key={rem.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-[#0F766E] dark:text-teal-300 font-bold rounded-lg text-[11px]">
                        {rem.category}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded-md text-[10px]">
                        {rem.priority}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {rem.doctorName} • {rem.date}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-sans pt-1">
                    {rem.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: TELEMETRY */}
      {activeTab === 'TELEMETRY' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">Continuous Telemetry Streams</h2>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Live Stream Active
            </span>
          </div>
          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center font-mono text-xs text-teal-400">
            [ EKG Lead II • SpO2 Pleth Waveform • Arterial Line Waveform Rendering Container ]
          </div>
        </div>
      )}

      {/* Tab Content: LABS */}
      {activeTab === 'LABS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <TestTube className="w-5 h-5 text-teal-600" />
            Recent Laboratory Diagnostics & Blood Gas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Test Name</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Reference Range</th>
                  <th className="py-3 px-4">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                <tr><td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Arterial pH</td><td className="py-3 px-4">7.36</td><td className="py-3 px-4 text-slate-500">7.35 - 7.45</td><td className="py-3 px-4 text-emerald-600 font-bold">NORMAL</td></tr>
                <tr><td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">PaO2</td><td className="py-3 px-4">92 mmHg</td><td className="py-3 px-4 text-slate-500">80 - 100 mmHg</td><td className="py-3 px-4 text-emerald-600 font-bold">NORMAL</td></tr>
                <tr><td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Lactate</td><td className="py-3 px-4 text-amber-600 font-bold">2.8 mmol/L</td><td className="py-3 px-4 text-slate-500">0.5 - 1.6 mmol/L</td><td className="py-3 px-4 text-amber-600 font-bold">HIGH</td></tr>
                <tr><td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">WBC Count</td><td className="py-3 px-4 text-rose-600 font-bold">14.8 K/uL</td><td className="py-3 px-4 text-slate-500">4.5 - 11.0 K/uL</td><td className="py-3 px-4 text-rose-600 font-bold">CRITICAL HIGH</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: MEDS */}
      {activeTab === 'MEDS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Active Continuous Infusions & MAR Schedule
          </h2>
          <div className="space-y-3 font-sans text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Norepinephrine Infusion</span>
                <span className="block text-slate-500">Dose: 0.08 mcg/kg/min • Rate: 4.2 mL/hr</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">RUNNING</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: DEVICES */}
      {activeTab === 'DEVICES' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-600" />
            Bedside Connected Devices Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {MOCK_DEVICES.slice(0, 4).map((device) => (
              <div key={device.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{device.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">CONNECTED</span>
                </div>
                <div className="text-slate-500 font-mono">Model: {device.model} • SN: {device.ipAddress}</div>
                <div className="text-slate-500 font-mono">Gateway: {device.gatewayId}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: NOTES */}
      {activeTab === 'NOTES' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Multidisciplinary Clinical Notes Log
            </h2>
            <button
              onClick={() => setIsAddRemarkOpen(true)}
              className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Add Remark</span>
            </button>
          </div>
          <div className="space-y-3 text-xs">
            {localRemarks.map((rem) => (
              <div key={rem.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>{rem.category} ({rem.priority.split(' ')[0]})</span>
                  <span className="font-mono text-slate-400">{rem.date} • {rem.doctorName}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {rem.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Clinical Patient Remark Modal */}
      <AddRemarkModal
        isOpen={isAddRemarkOpen}
        onClose={() => setIsAddRemarkOpen(false)}
        patientId={patient.id}
        patientName={patient.name}
        bedNumber={patient.bedNumber}
        onRemarkAdded={handleRemarkAdded}
      />
    </div>
  );
};

export default PatientDashboardPage;
