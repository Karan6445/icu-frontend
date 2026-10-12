import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import { Stethoscope, Users, Bed, FileText, HeartPulse, AlertTriangle, ArrowRight, Plus, CheckCircle2, Clock, Activity, TrendingUp, CheckSquare, FileSpreadsheet } from 'lucide-react';
import { addClinicalNote } from '../../store/slices/patientSlice';
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
  Cell
} from 'recharts';

export const DoctorOverviewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);

  const [noteModalPatientId, setNoteModalPatientId] = useState<string | null>(null);
  const [obsNote, setObsNote] = useState('');
  const [remark, setRemark] = useState('');

  // Doctor's assigned patients
  const doctorPatients = patients.filter(p => p.assignedClinician.includes(currentUser.name) || p.assignedClinician.includes('Ananya'));

  // Patients with active shift handovers assigned to incoming doctor
  const incomingHandoverPatients = patients.filter(
    p => p.latestDoctorHandover?.incomingDoctor
  );

  // Doctor Workstation Chart Mock Data
  const doctorVitalsTrend = [
    { time: '06:00', HeartRate: 88, SpO2: 98, MAP: 85 },
    { time: '08:00', HeartRate: 94, SpO2: 97, MAP: 82 },
    { time: '10:00', HeartRate: 102, SpO2: 95, MAP: 90 },
    { time: '12:00', HeartRate: 96, SpO2: 98, MAP: 88 },
    { time: '14:00', HeartRate: 90, SpO2: 99, MAP: 86 },
    { time: '16:00', HeartRate: 92, SpO2: 98, MAP: 87 }
  ];

  const patientAcuityData = [
    { category: 'Critical (Red)', count: doctorPatients.filter(p => p.status === 'CRITICAL').length, fill: '#EF4444' },
    { category: 'High Obs (Amber)', count: doctorPatients.filter(p => p.status === 'HIGH').length, fill: '#F59E0B' },
    { category: 'Stable (Teal)', count: doctorPatients.filter(p => p.status === 'MEDIUM' || p.status === 'STABLE').length, fill: '#10B981' }
  ];

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteModalPatientId && obsNote) {
      dispatch(addClinicalNote({
        patientId: noteModalPatientId,
        doctorName: currentUser.name,
        note: obsNote,
        remark: remark || 'Routine Morning Round'
      }));
      setNoteModalPatientId(null);
      setObsNote('');
      setRemark('');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            DOCTOR WORKSTATION
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Welcome, {currentUser.name}</h1>
          <p className="text-xs text-slate-500">{currentUser.specialty || 'Critical Care Lead'} · {currentUser.department}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/doctor/reports"
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Patient Report</span>
          </Link>
          <Link
            to="/doctor/patients"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Assigned Patients ({doctorPatients.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Assigned Patients</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{doctorPatients.length}</span>
            <span className="text-[10px] text-teal-700 font-mono font-bold">Under Active Care</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-rose-600 uppercase">High Priority Triage</span>
            <span className="text-3xl font-black text-rose-600 block mt-1">
              {doctorPatients.filter(p => p.status === 'CRITICAL' || p.status === 'HIGH').length}
            </span>
            <span className="text-[10px] text-rose-700 font-mono font-bold">Requires Round Note</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Assigned ICU Beds</span>
            <span className="text-3xl font-black text-emerald-600 block mt-1">{doctorPatients.length}</span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">MICU & SICU Beds</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Bed className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* DOCTOR CLINICAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Assigned Patients Vital Trends (AreaChart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0F766E]" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assigned Patients Vitals Stream</h3>
                <p className="text-[11px] text-slate-500 font-mono">Average HR (bpm), SpO2 (%) & MAP (mmHg) over last 10 hours</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              TELEMETRY
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={doctorVitalsTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="docHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="docSpO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F766E', borderColor: '#0D655E', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="HeartRate" stroke="#0F766E" fillOpacity={1} fill="url(#docHR)" strokeWidth={2} name="Heart Rate (bpm)" />
                <Area type="monotone" dataKey="SpO2" stroke="#10B981" fillOpacity={1} fill="url(#docSpO2)" strokeWidth={2} name="SpO2 (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Triage Acuity Breakdown (BarChart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0F766E]" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assigned Acuity Distribution</h3>
                <p className="text-[11px] text-slate-500 font-mono">Patient severity load</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientAcuityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F766E', borderColor: '#0D655E', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Patient Count">
                  {patientAcuityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Doctor Assigned Patients Roster */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-base font-extrabold text-slate-900">Assigned Patient Trajectory Cards</h2>
          </div>
          <Link to="/doctor/clinical-notes" className="text-xs font-bold text-[#0F766E] hover:underline">
            Clinical Notes Log →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctorPatients.map(p => (
            <div key={p.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 hover:border-teal-500/60 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{p.name} ({p.id})</h3>
                  <span className="text-xs text-[#0F766E] font-mono font-bold">{p.unitName} · {p.bedNumber}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                  p.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {p.status}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-mono bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <div><span className="text-slate-500">Diagnosis:</span> <span className="font-bold text-slate-900">{p.admittingDiagnosis}</span></div>
                <div><span className="text-slate-500">Vitals:</span> <span className="text-[#0F766E] font-bold">HR {p.vitals.hr}</span> | <span className="text-slate-900 font-bold">SpO2 {p.vitals.spo2}%</span> | <span className="text-slate-600">MAP {p.vitals.map}</span></div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNoteModalPatientId(p.id)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                  <Link
                    to={`/doctor/reports?patientId=${p.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Report</span>
                  </Link>
                </div>
                <Link to={`/patient/${p.id}`} className="text-xs text-[#0F766E] hover:underline font-bold flex items-center gap-1">
                  <span>Full Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Clinical Note Modal */}
      {noteModalPatientId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveNote} className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Clinical Round Note</h3>
              <button type="button" onClick={() => setNoteModalPatientId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Clinical Observation & Assessment *</label>
                <textarea
                  rows={4}
                  required
                  value={obsNote}
                  onChange={(e) => setObsNote(e.target.value)}
                  placeholder="Enter detailed round observations, ventilator adjustments, or medication titrations..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Doctor Remark / Follow-Up Instruction</label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. Repeat ABG in 2 hours / Continue Sedation"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setNoteModalPatientId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold text-xs shadow-sm">
                Save Clinical Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
