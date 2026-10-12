import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateVitals } from '../../store/slices/patientSlice';
import { Activity, CheckCircle2, HeartPulse, Save } from 'lucide-react';

export const NursePatientMonitoringPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector(state => state.patient);

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'P-1024');
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const [hr, setHr] = useState(selectedPatient?.vitals.hr || 80);
  const [spo2, setSpo2] = useState(selectedPatient?.vitals.spo2 || 98);
  const [bpSystolic, setBpSystolic] = useState(selectedPatient?.vitals.bpSystolic || 120);
  const [bpDiastolic, setBpDiastolic] = useState(selectedPatient?.vitals.bpDiastolic || 80);
  const [rr, setRr] = useState(selectedPatient?.vitals.rr || 16);
  const [temp, setTemp] = useState(selectedPatient?.vitals.temp || 37.0);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    const p = patients.find(pat => pat.id === id);
    if (p) {
      setHr(p.vitals.hr);
      setSpo2(p.vitals.spo2);
      setBpSystolic(p.vitals.bpSystolic);
      setBpDiastolic(p.vitals.bpDiastolic);
      setRr(p.vitals.rr);
      setTemp(p.vitals.temp);
    }
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const mapVal = Math.round((Number(bpDiastolic) * 2 + Number(bpSystolic)) / 3);
    dispatch(updateVitals({
      patientId: selectedPatientId,
      vitals: {
        hr: Number(hr),
        spo2: Number(spo2),
        bpSystolic: Number(bpSystolic),
        bpDiastolic: Number(bpDiastolic),
        map: mapVal,
        rr: Number(rr),
        temp: Number(temp),
        quality: 'LIVE',
        timestamp: new Date().toTimeString().slice(0, 8)
      }
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-4xl mx-auto selection:bg-teal-500 selection:text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            PATIENT MONITORING DATA
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Update Bedside Vitals Telemetry</h1>
          <p className="text-xs text-slate-500">Record hourly vital metrics, oxygen saturation, mean arterial pressure, and core temperature.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Patient vitals updated successfully for {selectedPatient?.name}!</span>
        </div>
      )}

      <form onSubmit={handleSaveVitals} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="space-y-2">
          <label className="block text-slate-600 text-xs font-bold uppercase font-mono">Select Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono text-xs focus:border-teal-500 outline-none"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) - {p.unitName} {p.bedNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <label className="block text-slate-600 font-bold">Heart Rate (HR - bpm)</label>
            <input
              type="number"
              value={hr}
              onChange={(e) => setHr(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-base font-bold focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <label className="block text-slate-600 font-bold">Oxygen Saturation (SpO2 %)</label>
            <input
              type="number"
              value={spo2}
              onChange={(e) => setSpo2(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-teal-700 font-mono text-base font-bold focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <label className="block text-slate-600 font-bold">Respiration Rate (RR / min)</label>
            <input
              type="number"
              value={rr}
              onChange={(e) => setRr(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-base font-bold focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <label className="block text-slate-600 font-bold">BP Systolic (mmHg)</label>
            <input
              type="number"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-base font-bold focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <label className="block text-slate-600 font-bold">BP Diastolic (mmHg)</label>
            <input
              type="number"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-base font-bold focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <label className="block text-slate-600 font-bold">Body Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-amber-700 font-mono text-base font-bold focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Vital Telemetry Entry</span>
          </button>
        </div>
      </form>
    </div>
  );
};
