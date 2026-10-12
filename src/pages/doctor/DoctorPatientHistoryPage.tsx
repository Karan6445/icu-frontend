import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Clock, FileText, HeartPulse } from 'lucide-react';

export const DoctorPatientHistoryPage: React.FC = () => {
  const { patients } = useAppSelector(state => state.patient);
  const [selectedId, setSelectedId] = useState(patients[0]?.id || 'P-1024');

  const patient = patients.find(p => p.id === selectedId) || patients[0];

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            PATIENT HISTORY
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Historical Records & Admissions</h1>
          <p className="text-xs text-slate-500">Review patient past medical conditions, prior ICU admissions, and diagnostic reports history.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
        <label className="text-xs text-slate-700 font-bold font-mono">Select Patient:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#0F766E]"
        >
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.admittingDiagnosis}</option>
          ))}
        </select>
      </div>

      {patient && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm font-mono text-xs">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
              <span className="text-[#0F766E] font-bold">{patient.id} · {patient.mrn} · {patient.age}Y · {patient.gender}</span>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-[#0F766E] rounded-lg border border-teal-200 font-bold">
              {patient.unitName} ({patient.bedNumber})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Medical History</span>
              <p className="text-slate-900 font-sans text-xs">{patient.medicalHistory || 'No prior chronic conditions recorded.'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Allergies</span>
              <p className="text-rose-600 font-sans text-xs font-bold">{patient.allergies || 'No known allergies.'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Uploaded Diagnostic Documents</h3>
            {patient.documents && patient.documents.length > 0 ? (
              <div className="space-y-2">
                {patient.documents.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      <span className="font-bold text-slate-900">{doc.name}</span>
                    </div>
                    <span className="text-slate-500">{doc.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-xs">No documents uploaded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
