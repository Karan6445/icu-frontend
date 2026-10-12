import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import { Users, Search, Stethoscope, ArrowRight, Eye, HeartPulse, FileSpreadsheet } from 'lucide-react';

export const DoctorAssignedPatientsPage: React.FC = () => {
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);
  const [query, setQuery] = useState('');

  const doctorPatients = patients.filter(p => p.assignedClinician.includes(currentUser.name) || p.assignedClinician.includes('Ananya'));
  const filtered = doctorPatients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.admittingDiagnosis.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            DOCTOR WORKSTATION
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Assigned Patients ({doctorPatients.length})</h1>
          <p className="text-xs text-slate-500">Patients currently assigned under your critical care supervision.</p>
        </div>

        <Link
          to="/doctor/reports"
          className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Generate Patient Reports</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search assigned patient by name, ID or diagnosis..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E] shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:border-teal-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                <span className="text-xs font-mono font-bold text-[#0F766E]">{p.id} · {p.mrn} · {p.bedNumber} ({p.unitName})</span>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                p.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-600"><span className="text-slate-500">Diagnosis:</span> <span className="text-slate-900 font-bold">{p.admittingDiagnosis}</span></div>
              <div className="text-slate-600"><span className="text-slate-500">Nurse:</span> <span className="text-slate-800">{p.assignedNurse}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Link
                to={`/doctor/reports?patientId=${p.id}`}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Generate Report</span>
              </Link>
              <Link to={`/patient/${p.id}`} className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs">
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
