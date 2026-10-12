import React, { useState } from 'react';
import { 
  HeartPulse, 
  Search, 
  Play, 
  Pause, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sliders, 
  Check, 
  X,
  Droplet,
  Syringe,
  History
} from 'lucide-react';

interface InfusionPump {
  id: string;
  pumpId: string;
  drug: string;
  concentration: string;
  rate: string;
  doseRate: string;
  vtbi: string;
  infused: string;
  status: 'INFUSING' | 'PAUSED' | 'STANDBY';
  channel: string;
  lastUpdated: string;
}

interface ScheduledMedication {
  id: string;
  drug: string;
  dose: string;
  route: 'IV' | 'PO' | 'SC' | 'INHALATION';
  frequency: string;
  nextDue: string;
  status: 'ACTIVE' | 'DUE_SOON' | 'HELD';
  prescriber: string;
  indication: string;
}

interface MarEntry {
  id: string;
  timeSlot: string;
  drug: string;
  dose: string;
  status: 'ADMINISTERED' | 'DUE' | 'HELD' | 'REFUSED';
  administeredBy?: string;
  timestamp?: string;
}

export const MedicationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INFUSIONS' | 'SCHEDULED' | 'MAR'>('INFUSIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedForAction, setSelectedMedForAction] = useState<ScheduledMedication | null>(null);
  const [actionType, setActionType] = useState<'ADMINISTER' | 'HOLD' | 'STOP'>('ADMINISTER');
  const [holdReason, setHoldReason] = useState('');

  const [infusions, setInfusions] = useState<InfusionPump[]>([
    {
      id: 'INF-01',
      pumpId: 'Alaris-Pump-04A',
      channel: 'Channel A',
      drug: 'Norepinephrine (Noradrenaline)',
      concentration: '4 mg / 50 mL D5W (80 mcg/mL)',
      rate: '6.0 mL/hr',
      doseRate: '0.08 mcg/kg/min',
      vtbi: '38.4 mL',
      infused: '11.6 mL',
      status: 'INFUSING',
      lastUpdated: 'Just now'
    },
    {
      id: 'INF-02',
      pumpId: 'Alaris-Pump-04B',
      channel: 'Channel B',
      drug: 'Vasopressin',
      concentration: '20 Units / 100 mL NS (0.2 U/mL)',
      rate: '12.0 mL/hr',
      doseRate: '0.04 Units/min',
      vtbi: '64.0 mL',
      infused: '36.0 mL',
      status: 'INFUSING',
      lastUpdated: '1 min ago'
    },
    {
      id: 'INF-03',
      pumpId: 'Alaris-Pump-04C',
      channel: 'Channel C',
      drug: 'Propofol 1%',
      concentration: '1000 mg / 100 mL (10 mg/mL)',
      rate: '15.0 mL/hr',
      doseRate: '25 mcg/kg/min',
      vtbi: '45.0 mL',
      infused: '55.0 mL',
      status: 'INFUSING',
      lastUpdated: 'Just now'
    },
    {
      id: 'INF-04',
      pumpId: 'Alaris-Pump-04D',
      channel: 'Channel D',
      drug: 'Fentanyl Citrate',
      concentration: '1000 mcg / 100 mL (10 mcg/mL)',
      rate: '5.0 mL/hr',
      doseRate: '50 mcg/hr',
      vtbi: '75.0 mL',
      infused: '25.0 mL',
      status: 'INFUSING',
      lastUpdated: '2 min ago'
    }
  ]);

  const [scheduledMeds, setScheduledMeds] = useState<ScheduledMedication[]>([
    {
      id: 'MED-101',
      drug: 'Meropenem IV',
      dose: '1 g in 100 mL NS over 3 hours (Extended Infusion)',
      route: 'IV',
      frequency: 'Every 8 Hours',
      nextDue: '13:00 (In 15 mins)',
      status: 'DUE_SOON',
      prescriber: 'Dr. Anand Verma',
      indication: 'Severe Hospital-Acquired Pneumonia / Sepsis'
    },
    {
      id: 'MED-102',
      drug: 'Vancomycin IV',
      dose: '1.25 g in 250 mL D5W over 90 mins (Trough targeted)',
      route: 'IV',
      frequency: 'Every 12 Hours',
      nextDue: '16:00',
      status: 'ACTIVE',
      prescriber: 'Dr. Anand Verma',
      indication: 'MRSA coverage pending blood cultures'
    },
    {
      id: 'MED-103',
      drug: 'Pantoprazole IV',
      dose: '40 mg IV Push',
      route: 'IV',
      frequency: 'Once Daily (08:00)',
      nextDue: 'Tomorrow 08:00',
      status: 'ACTIVE',
      prescriber: 'Dr. Ananya Roy',
      indication: 'Stress ulcer prophylaxis for mechanically ventilated patient'
    },
    {
      id: 'MED-104',
      drug: 'Enoxaparin (LMWH)',
      dose: '40 mg Subcutaneous',
      route: 'SC',
      frequency: 'Once Daily (20:00)',
      nextDue: 'Today 20:00',
      status: 'ACTIVE',
      prescriber: 'Dr. Anand Verma',
      indication: 'DVT / VTE Thromboprophylaxis'
    }
  ]);

  const marEntries: MarEntry[] = [
    { id: 'MAR-1', timeSlot: '08:00', drug: 'Pantoprazole IV 40mg', dose: '40 mg', status: 'ADMINISTERED', administeredBy: 'RN Priya Singh', timestamp: '08:05' },
    { id: 'MAR-2', timeSlot: '08:00', drug: 'Meropenem IV 1g', dose: '1 g', status: 'ADMINISTERED', administeredBy: 'RN Vikram Singh', timestamp: '08:10' },
    { id: 'MAR-3', timeSlot: '13:00', drug: 'Meropenem IV 1g', dose: '1 g', status: 'DUE' },
    { id: 'MAR-4', timeSlot: '16:00', drug: 'Vancomycin IV 1.25g', dose: '1.25 g', status: 'DUE' },
    { id: 'MAR-5', timeSlot: '20:00', drug: 'Enoxaparin SC 40mg', dose: '40 mg', status: 'DUE' }
  ];

  const handleTogglePump = (id: string) => {
    setInfusions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'INFUSING' ? 'PAUSED' : 'INFUSING' };
      }
      return p;
    }));
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForAction) return;

    if (actionType === 'ADMINISTER') {
      alert(`[MAR AUDIT] ${selectedMedForAction.drug} administered by verified staff ID. Barcode verified.`);
      setScheduledMeds(prev => prev.map(m => m.id === selectedMedForAction.id ? { ...m, status: 'ACTIVE', nextDue: 'Completed' } : m));
    } else if (actionType === 'HOLD') {
      alert(`[MAR AUDIT] ${selectedMedForAction.drug} HELD. Clinical Reason: "${holdReason}". Attending notified.`);
      setScheduledMeds(prev => prev.map(m => m.id === selectedMedForAction.id ? { ...m, status: 'HELD' } : m));
    }
    setSelectedMedForAction(null);
    setHoldReason('');
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 11: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-800 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 11
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Rahul Sharma (42M) · Bed 04 · Encounter ENC-90821
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Medication & Smart Infusion Management</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Continuous smart pump telemetry, dose-error reduction system (DERS), eMAR barcode administration.
          </p>
        </div>

        {/* Allergy Warning Strip */}
        <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/80 px-3 py-2 rounded-xl text-xs font-mono">
          <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> VERIFIED PATIENT ALLERGIES
          </span>
          <span className="text-rose-900 dark:text-white font-bold">Penicillin (Anaphylaxis) · Sulfa Drugs</span>
        </div>
      </div>

      {/* Tabs Toolbar: INFUSIONS | SCHEDULED | MAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('INFUSIONS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'INFUSIONS'
                ? 'bg-teal-700 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Smart Infusion Pumps ({infusions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'SCHEDULED'
                ? 'bg-teal-700 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Scheduled Medications ({scheduledMeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MAR')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'MAR'
                ? 'bg-teal-700 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>eMAR Matrix (24-Hour)</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drug or pump..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-600 text-slate-900 dark:text-white w-48 sm:w-56 placeholder-slate-400"
          />
        </div>
      </div>

      {/* ================= TAB 1: SMART INFUSIONS ================= */}
      {activeTab === 'INFUSIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infusions.map(inf => (
            <div
              key={inf.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-500 transition-all duration-200 flex flex-col justify-between text-slate-800 dark:text-slate-100"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-teal-700 dark:text-teal-400 font-bold text-xs">{inf.channel} · {inf.pumpId}</span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">{inf.drug}</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{inf.concentration}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border flex items-center gap-1 ${
                    inf.status === 'INFUSING'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  }`}>
                    {inf.status === 'INFUSING' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{inf.status}</span>
                  </span>
                </div>

                {/* Primary Dose Rate & Flow Rate Matrix */}
                <div className="grid grid-cols-2 gap-3 my-3 font-mono">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-bold">TITRATED DOSE RATE</span>
                    <span className="text-xl font-black text-rose-600 dark:text-rose-400 block mt-0.5">{inf.doseRate}</span>
                    <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold">DERS Guardrails Normal</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-bold">PUMP FLOW RATE</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">{inf.rate}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">VTBI: {inf.vtbi}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
                  <span>Total Infused: <strong className="text-slate-900 dark:text-white">{inf.infused}</strong></span>
                  <span>Sync: <strong className="text-emerald-600 dark:text-emerald-400">{inf.lastUpdated}</strong></span>
                </div>
              </div>

              {/* Pump Controls */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 font-mono text-xs">
                <button
                  onClick={() => alert(`Titration dialog opened for ${inf.drug}`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700"
                >
                  Titrate Rate
                </button>
                <button
                  onClick={() => handleTogglePump(inf.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-white transition-colors shadow-xs ${
                    inf.status === 'INFUSING'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {inf.status === 'INFUSING' ? 'Pause Pump' : 'Resume Pump'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 2: SCHEDULED MEDICATIONS ================= */}
      {activeTab === 'SCHEDULED' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Medication / Strength</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Frequency</th>
                  <th className="p-3.5">Next Due</th>
                  <th className="p-3.5">Prescriber / Indication</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {scheduledMeds.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 transition-colors">
                    <td className="p-3.5">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">{med.drug}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{med.dose}</div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-teal-800 dark:text-teal-300 text-[10px]">
                        {med.route}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {med.frequency}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] border ${
                        med.status === 'DUE_SOON'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 animate-pulse'
                          : med.status === 'HELD'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}>
                        {med.nextDue}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div>{med.indication}</div>
                      <div className="text-[10px] font-mono text-teal-700 dark:text-teal-400 mt-0.5">{med.prescriber}</div>
                    </td>

                    <td className="p-3.5 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedMedForAction(med);
                            setActionType('ADMINISTER');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] shadow-xs"
                        >
                          Administer
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMedForAction(med);
                            setActionType('HOLD');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/60 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-200 border border-slate-200 dark:border-slate-700 text-[11px]"
                        >
                          Hold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: eMAR MATRIX ================= */}
      {activeTab === 'MAR' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
            <span className="font-bold text-teal-700 dark:text-teal-400 uppercase">Electronic MAR Execution Grid (24-Hour Window)</span>
            <span className="text-slate-500 dark:text-slate-400">Barcode Scanning Enabled · Dual-Sign Mandatory for Narcotics</span>
          </div>

          <div className="space-y-2">
            {marEntries.map(entry => (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400 font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                    {entry.timeSlot}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{entry.drug}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-sans">Dose: {entry.dose}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {entry.status === 'ADMINISTERED' ? (
                    <div className="text-right">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> GIVEN at {entry.timestamp}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{entry.administeredBy}</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 text-[10px] font-black">
                      PENDING MAR CONFIRMATION
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMINISTRATION & HOLD MODAL */}
      {selectedMedForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {actionType === 'ADMINISTER' ? 'Verify 5-Rights & Administer' : 'Hold Medication'}
              </h3>
              <button onClick={() => setSelectedMedForAction(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">DRUG & PRESCRIBED DOSE</span>
                <span className="text-base font-bold text-teal-700 dark:text-teal-300">{selectedMedForAction.drug}</span>
                <p className="text-slate-700 dark:text-slate-300 font-mono">{selectedMedForAction.dose}</p>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block pt-1">
                  Route: {selectedMedForAction.route} · Frequency: {selectedMedForAction.frequency}
                </span>
              </div>

              {actionType === 'HOLD' ? (
                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">REASON FOR HOLDING (AUDIT LOGGED):</label>
                  <input
                    type="text"
                    required
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="e.g. SBP < 90, NPO for surgery, patient refused..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Right Patient: Rahul Sharma (P-1024)</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Right Medication: {selectedMedForAction.drug}</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Right Dose & Route: {selectedMedForAction.route}</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Right Time: {selectedMedForAction.nextDue}</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Verified No Allergy Conflict</div>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmAction} className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMedForAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  actionType === 'HOLD' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-teal-600 hover:bg-teal-500'
                }`}
              >
                {actionType === 'HOLD' ? 'Confirm Hold' : 'Sign & Record to MAR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
