import { useAppSelector } from '../../store/hooks';
import { Bed, Activity } from 'lucide-react';

export const NurseBedMonitoringPage: React.FC = () => {
  const { beds } = useAppSelector(state => state.icuBed);
  const { patients } = useAppSelector(state => state.patient);

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            NURSE COCKPIT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">ICU Bed Monitoring Roster</h1>
          <p className="text-xs text-slate-500">Continuous telemetry & equipment attachment overview for assigned ICU beds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beds.slice(0, 6).map(b => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-teal-700" />
                <span className="font-extrabold text-slate-900 text-base">{b.bedNumber}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                b.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {b.status}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div><span className="text-slate-500">Unit:</span> <span className="font-bold text-slate-900">{b.icuName}</span></div>
              <div><span className="text-slate-500">Patient:</span> <span className="text-teal-700 font-bold">{b.assignedPatientName || 'None'}</span></div>
              <div><span className="text-slate-500">Monitor:</span> <span className="text-slate-700">{b.monitorModel}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
