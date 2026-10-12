import React, { useState } from 'react';
import {
  UserPlus,
  X,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Bed,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import { PatientService } from '../../services/patientService';
import { MOCK_USERS } from '../../data/mockData';
import { ClinicalStatus, ReviewPriority, CodeStatus, Patient } from '../../types/icu';
import { useAppDispatch } from '../../store/hooks';
import { registerPatientThunk } from '../../store/slices/patientSlice';

interface PatientRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientRegistered?: (newPatient: Patient) => void;
}

export const PatientRegistryModal: React.FC<PatientRegistryModalProps> = ({
  isOpen,
  onClose,
  onPatientRegistered
}) => {
  if (!isOpen) return null;

  const dispatch = useAppDispatch();

  // Filter available Doctors and Nurses from MOCK_USERS
  const doctorsList = MOCK_USERS.filter((u) => u.role === 'DOCTOR' || u.role === 'SYSTEM_ADMIN');
  const nursesList = MOCK_USERS.filter((u) => u.role === 'RN' || u.role === 'NP' || u.role === 'CCR');

  // Available ICU Beds list
  const availableBedsList = [
    'ICU-18', 'ICU-19', 'ICU-20', 'ICU-21', 'ICU-22', 'ICU-23', 'ICU-24',
    'ICU-04', 'ICU-08', 'ICU-12', 'ICU-14', 'ICU-16'
  ];

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(54);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [mrn, setMrn] = useState(`UHID-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [emergencyContact, setEmergencyContact] = useState('+91 98765-43210');
  
  // Bed & Unit
  const [unitName, setUnitName] = useState('MICU-01');
  const [bedNumber, setBedNumber] = useState('ICU-18');
  const [codeStatus, setCodeStatus] = useState<CodeStatus>('FULL CODE');

  // Clinical Status & Diagnosis
  const [admittingDiagnosis, setAdmittingDiagnosis] = useState('Severe ARDS & Septic Shock secondary to pneumonia');
  const [status, setStatus] = useState<ClinicalStatus>('CRITICAL');
  const [reviewPriority, setReviewPriority] = useState<ReviewPriority>('CRITICAL');

  // Doctor & Nurse Assignment (REQUIRED FEATURE)
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorsList[0]?.id || 'DR-104');
  const [selectedNurseId, setSelectedNurseId] = useState(nursesList[0]?.id || 'RN-204');

  // Initial Vitals Baseline
  const [hr, setHr] = useState<number>(108);
  const [bpSystolic, setBpSystolic] = useState<number>(115);
  const [bpDiastolic, setBpDiastolic] = useState<number>(72);
  const [spo2, setSpO2] = useState<number>(94);
  const [temp, setTemp] = useState<number>(37.8);
  const [rr, setRr] = useState<number>(24);

  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedDoc = doctorsList.find((d) => d.id === selectedDoctorId) || doctorsList[0];
    const assignedNurseObj = nursesList.find((n) => n.id === selectedNurseId) || nursesList[0];

    const mapVal = Math.round((bpSystolic + 2 * bpDiastolic) / 3);

    const newPatient = PatientService.addPatient({
      name: name.trim(),
      mrn: mrn.trim(),
      age: Number(age),
      gender,
      bedNumber,
      unitName,
      status,
      reviewPriority,
      admittingDiagnosis,
      assignedClinicianId: assignedDoc.id,
      assignedClinician: assignedDoc.name,
      assignedNurseId: assignedNurseObj.id,
      assignedNurse: assignedNurseObj.name,
      assignedNurseRole: assignedNurseObj.role,
      codeStatus,
      vitals: {
        hr: { value: hr, unit: 'bpm', timestamp: 'Just Now', source: 'Bedside Monitor', quality: 'LIVE' },
        spo2: { value: spo2, unit: '%', timestamp: 'Just Now', source: 'Pulse Oximeter', quality: 'LIVE' },
        bpSystolic: { value: bpSystolic, unit: 'mmHg', timestamp: 'Just Now', source: 'NIBP Cuff', quality: 'LIVE' },
        bpDiastolic: { value: bpDiastolic, unit: 'mmHg', timestamp: 'Just Now', source: 'NIBP Cuff', quality: 'LIVE' },
        map: { value: mapVal, unit: 'mmHg', timestamp: 'Just Now', source: 'Calculated', quality: 'LIVE' },
        rr: { value: rr, unit: 'bpm', timestamp: 'Just Now', source: 'Resp Sensor', quality: 'LIVE' },
        temp: { value: temp, unit: '°C', timestamp: 'Just Now', source: 'Core Probe', quality: 'LIVE' },
      }
    });

    // Sync with backend API
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Patient';
    const lastName = nameParts.slice(1).join(' ') || 'Record';
    const genderEnum = gender === 'M' ? 'MALE' : gender === 'F' ? 'FEMALE' : 'OTHER';
    const birthYear = new Date().getFullYear() - (Number(age) || 45);
    const dob = `${birthYear}-01-15`;

    dispatch(
      registerPatientThunk({
        data: {
          mrn: mrn.trim(),
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: genderEnum as any,
          blood_group: 'O_POSITIVE',
          emergency_contact_phone: emergencyContact,
          chronic_conditions: admittingDiagnosis ? [{ name: admittingDiagnosis }] : [],
        },
      })
    );

    setSuccessNotice(`Patient ${newPatient.name} (${newPatient.mrn}) successfully admitted to ${newPatient.bedNumber} and assigned to ${newPatient.assignedClinician} & Nurse ${newPatient.assignedNurse}!`);

    if (onPatientRegistered) {
      onPatientRegistered(newPatient);
    }

    setTimeout(() => {
      setSuccessNotice(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col p-5 sm:p-6 my-auto">
        {/* Fixed Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 leading-tight">
                <span>Patient Admission & Clinical Registry</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Demographics, bed allocation, and clinician/nurse assignment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast Banner */}
        {successNotice && (
          <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md flex items-center gap-2.5 text-xs font-bold my-2 shrink-0 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Scrollable Compact Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3 py-3 text-xs pr-1">
          {/* Section 1: Demographics & Personal Details */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5 font-mono">
              <UserCheck className="w-3.5 h-3.5" />
              <span>1. Demographics & Identification</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  Full Patient Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 font-mono">
                  UHID / MRN
                </label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-teal-600 dark:text-teal-400 font-mono font-bold focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  Age & Gender
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-14 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold text-center text-xs focus:outline-none"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium text-xs focus:outline-none"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: MANDATORY REQUESTED FEATURE — Clinician & Nurse Assignment */}
          <div className="space-y-2 bg-teal-500/5 dark:bg-teal-950/20 p-3 rounded-2xl border border-teal-500/30">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5 font-mono">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>2. Attending Doctor & Primary Nurse Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Doctor Assignment Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-0.5 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-blue-600" />
                  <span>Assign Attending Doctor *</span>
                </label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                >
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty || doc.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nurse Assignment Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-0.5 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-emerald-600" />
                  <span>Assign Primary Shift Nurse *</span>
                </label>
                <select
                  required
                  value={selectedNurseId}
                  onChange={(e) => setSelectedNurseId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                >
                  {nursesList.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.subRole || n.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: ICU Bed & Unit Assignment */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5 font-mono">
              <Bed className="w-3.5 h-3.5" />
              <span>3. ICU Bed Allocation & Acuity Classification</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  ICU Unit
                </label>
                <select
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
                >
                  <option value="MICU-01">MICU-01 (Medical ICU)</option>
                  <option value="SICU-01">SICU-01 (Surgical ICU)</option>
                  <option value="CICU-01">CICU-01 (Cardiac ICU)</option>
                  <option value="NICU-01">NICU-01 (Neuro ICU)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 font-mono">
                  Select ICU Bed *
                </label>
                <select
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400 font-mono font-bold text-xs focus:outline-none"
                >
                  {availableBedsList.map((bed) => (
                    <option key={bed} value={bed}>
                      {bed} (Available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  Clinical Acuity
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClinicalStatus)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="STABLE">STABLE</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  Code Status
                </label>
                <select
                  value={codeStatus}
                  onChange={(e) => setCodeStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
                >
                  <option value="FULL CODE">FULL CODE</option>
                  <option value="DNR">DNR</option>
                  <option value="DNI">DNI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Clinical Diagnosis */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>4. Admitting Clinical Diagnosis</span>
            </h3>

            <div>
              <input
                type="text"
                required
                value={admittingDiagnosis}
                onChange={(e) => setAdmittingDiagnosis(e.target.value)}
                placeholder="e.g. Severe ARDS & Septic Shock secondary to pneumonia..."
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Initial Vitals Baseline */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>5. Initial Vital Baseline</span>
            </h3>

            <div className="grid grid-cols-5 gap-2 font-mono text-center">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-emerald-500 font-bold block">HR (bpm)</span>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full text-center font-black text-sm text-emerald-500 bg-transparent focus:outline-none mt-0.5"
                />
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-cyan-500 font-bold block">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpO2(Number(e.target.value))}
                  className="w-full text-center font-black text-sm text-cyan-500 bg-transparent focus:outline-none mt-0.5"
                />
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-amber-500 font-bold block">BP Sys/Dia</span>
                <div className="flex items-center justify-center gap-0.5 mt-0.5 text-xs">
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-8 text-center font-black text-amber-500 bg-transparent focus:outline-none"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-8 text-center font-black text-amber-500 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-rose-500 font-bold block">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full text-center font-black text-sm text-rose-500 bg-transparent focus:outline-none mt-0.5"
                />
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-purple-500 font-bold block">RR (bpm)</span>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  className="w-full text-center font-black text-sm text-purple-500 bg-transparent focus:outline-none mt-0.5"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            type="button"
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient & Assign Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
};
