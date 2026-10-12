import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Activity, 
  Check, 
  AlertTriangle, 
  Save, 
  ArrowRight, 
  Scale, 
  Thermometer, 
  Droplet, 
  Wind,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  updateAppointmentVitals,
  getAppointmentById 
} from '../../data/mockEclinicData';
import { EClinicVitals, Appointment } from '../../types/eclinic';

export const EClinicVitalsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, can, permissions } = useRBAC();
  const appointments = getStoredAppointments();

  const appointmentIdFromUrl = searchParams.get('appointmentId');
  const [selectedAptId, setSelectedAptId] = useState<string>(
    appointmentIdFromUrl || appointments[0]?.id || ''
  );

  const currentAppointment = appointments.find(a => a.id === selectedAptId) || appointments[0];

  // Vitals State
  const [systolic, setSystolic] = useState<number>(currentAppointment?.vitals?.systolicBp || 120);
  const [diastolic, setDiastolic] = useState<number>(currentAppointment?.vitals?.diastolicBp || 80);
  const [pulse, setPulse] = useState<number>(currentAppointment?.vitals?.pulseRate || 74);
  const [spo2, setSpo2] = useState<number>(currentAppointment?.vitals?.spo2 || 98);
  const [temp, setTemp] = useState<number>(currentAppointment?.vitals?.temperature || 36.8);
  const [weight, setWeight] = useState<number>(currentAppointment?.vitals?.weightKg || 68);
  const [height, setHeight] = useState<number>(currentAppointment?.vitals?.heightCm || 168);
  const [bloodSugar, setBloodSugar] = useState<number>(currentAppointment?.vitals?.bloodGlucose || 110);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync when appointment selection changes
  useEffect(() => {
    if (currentAppointment?.vitals) {
      setSystolic(currentAppointment.vitals.systolicBp);
      setDiastolic(currentAppointment.vitals.diastolicBp);
      setPulse(currentAppointment.vitals.pulseRate);
      setSpo2(currentAppointment.vitals.spo2);
      setTemp(currentAppointment.vitals.temperature);
      if (currentAppointment.vitals.weightKg) setWeight(currentAppointment.vitals.weightKg);
      if (currentAppointment.vitals.heightCm) setHeight(currentAppointment.vitals.heightCm);
      if (currentAppointment.vitals.bloodGlucose) setBloodSugar(currentAppointment.vitals.bloodGlucose);
    }
  }, [selectedAptId]);

  // Real-time BMI
  const bmi = (weight > 0 && height > 0)
    ? Number((weight / ((height / 100) * (height / 100))).toFixed(1))
    : 22.0;

  // Real-time Warnings Evaluation
  const warnings: string[] = [];
  if (systolic >= 140 || diastolic >= 90) warnings.push('Elevated Blood Pressure (Stage 1/2 HTN range)');
  if (systolic < 90) warnings.push('Hypotensive trend (<90 mmHg systolic)');
  if (pulse > 100) warnings.push('Resting Tachycardia (>100 bpm)');
  if (pulse < 55) warnings.push('Resting Bradycardia (<55 bpm)');
  if (spo2 < 95) warnings.push('Reduced Oxygen Saturation (<95% SpO2)');
  if (temp >= 38.0) warnings.push('Pyrexia / Elevated Temperature (>38.0°C)');
  if (bloodSugar > 140) warnings.push('Elevated Blood Sugar (>140 mg/dL)');

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAppointment) return;

    const newVitals: EClinicVitals = {
      id: `VIT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: currentAppointment.patientId,
      appointmentId: currentAppointment.id,
      systolicBp: Number(systolic),
      diastolicBp: Number(diastolic),
      pulseRate: Number(pulse),
      spo2: Number(spo2),
      temperature: Number(temp),
      bloodGlucose: Number(bloodSugar),
      weightKg: Number(weight),
      heightCm: Number(height),
      bmi,
      warnings,
      recordedBy: `${role} Operator`,
      recordedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    updateAppointmentVitals(currentAppointment.id, newVitals);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Digital Vitals Capture & Triage Station
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              STATION 01
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record physiological telemetry, automated BMI, and flag clinical warnings before doctor handoff
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Vitals Recorded & Marked "Ready for Doctor"</span>
          </div>
        )}
      </div>

      {/* 2. SELECT PATIENT FROM ACTIVE QUEUE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Triage Patient
            </label>
            <select
              value={selectedAptId}
              onChange={(e) => setSelectedAptId(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-900 dark:text-white cursor-pointer focus:outline-none"
            >
              {appointments.map(apt => (
                <option key={apt.id} value={apt.id} className="dark:bg-slate-900 font-sans">
                  [{apt.tokenNumber}] {apt.patientName} — {apt.patientAge}y/{apt.patientGender[0]} ({apt.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentAppointment && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>MRN: <strong className="text-slate-800 dark:text-slate-200">{currentAppointment.patientMrn}</strong></span>
            <span>•</span>
            <span>Complaint: <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[200px] inline-block align-bottom">{currentAppointment.reason}</strong></span>
          </div>
        )}
      </div>

      {/* 3. VITALS ENTRY FORM & LIVE GAUGES */}
      <form onSubmit={handleSaveVitals} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Blood Pressure Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Blood Pressure
              </span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Systolic (mmHg)</label>
                <input
                  type="number"
                  min="60"
                  max="260"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Diastolic (mmHg)</label>
                <input
                  type="number"
                  min="40"
                  max="160"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Normal range: 100-130 / 60-85 mmHg
            </div>
          </div>

          {/* Pulse Rate Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Heart / Pulse Rate
              </span>
              <HeartPulse className="w-4 h-4 text-rose-500" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block font-mono">Pulse (bpm)</label>
              <input
                type="number"
                min="30"
                max="220"
                required
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Normal adult range: 60-100 bpm
            </div>
          </div>

          {/* SpO2 Oxygen Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Oxygen Saturation
              </span>
              <Wind className="w-4 h-4 text-emerald-500" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block font-mono">SpO2 (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                required
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Normal baseline: 95-100% on ambient air
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Body Temperature
              </span>
              <Thermometer className="w-4 h-4 text-amber-500" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block font-mono">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                min="32"
                max="44"
                required
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Normal oral/tympanic: 36.5 - 37.5°C
            </div>
          </div>
        </div>

        {/* 4. SECOND ROW: GLUCOSE, HEIGHT, WEIGHT, AUTOMATED BMI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Blood Glucose */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Random Blood Glucose
              </span>
              <Droplet className="w-4 h-4 text-purple-500" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block font-mono">RBS (mg/dL)</label>
              <input
                type="number"
                min="40"
                max="500"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Normal random: &lt;140 mg/dL
            </div>
          </div>

          {/* Height and Weight */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Anthropometry
              </span>
              <Scale className="w-4 h-4 text-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Height (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Weight (kg)</label>
                <input
                  type="number"
                  min="3"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Automated BMI Display */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between border border-teal-700/50">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 block">
                AUTOMATED BODY MASS INDEX
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black font-mono">
                  {bmi}
                </span>
                <span className="text-xs font-bold text-teal-200">
                  kg/m²
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-teal-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">Category:</span>
              <span className="font-bold text-emerald-300">
                {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. CLINICAL WARNINGS LIST */}
        {warnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Telemetry Alert Flags Detected ({warnings.length})</span>
            </div>
            <ul className="list-disc list-inside text-xs space-y-0.5 font-mono">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Vitals & Mark Ready for Doctor</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EClinicVitalsPage;
