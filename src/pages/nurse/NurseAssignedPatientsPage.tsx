import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import { Users, Search, Eye, Activity } from 'lucide-react';

export const NurseAssignedPatientsPage: React.FC = () => {
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);
  const [query, setQuery] = useState('');

  const nursePatients = patients.filter(p => p.assignedNurse.includes(currentUser.name) || p.assignedNurse.includes('Vikram') || p.assignedNurse.includes('Priya'));
  const filtered = nursePatients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.bedNumber.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            NURSE COCKPIT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Assigned Nurse Bed Roster ({nursePatients.length})</h1>
          <p className="text-xs text-slate-500">Bedside patients assigned for shift monitoring and nursing interventions.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search assigned nurse patient by name or bed..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-500 shadow-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{p.name} ({p.id})</h3>
                <span className="text-xs font-mono text-teal-700">{p.unitName} · {p.bedNumber}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                p.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-600"><span className="text-slate-500">Diagnosis:</span> <span className="text-slate-900 font-bold">{p.admittingDiagnosis}</span></div>
              <div className="text-slate-600"><span className="text-slate-500">Doctor:</span> <span className="text-teal-700 font-bold">{p.assignedClinician}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Link to={`/patient/${p.id}`} className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow">
                <Eye className="w-3.5 h-3.5" />
                <span>Open Patient Cockpit</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
