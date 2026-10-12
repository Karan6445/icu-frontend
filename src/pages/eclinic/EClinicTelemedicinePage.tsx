import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Share2, 
  Camera, 
  Maximize2, 
  HeartPulse, 
  FileText, 
  Pill, 
  Send, 
  Check, 
  AlertCircle, 
  Clock, 
  Wifi, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Download,
  Building2,
  Stethoscope,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  getStoredAppointments, 
  saveConsultationRecord, 
  FORMULARY_MEDICATIONS, 
  MOCK_CLINICS 
} from '../../data/mockEclinicData';
import { 
  Appointment, 
  ClinicalSoapNote, 
  Prescription, 
  PrescriptionItem, 
  Referral 
} from '../../types/eclinic';

export const EClinicTelemedicinePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, currentUser, can } = useRBAC();
  const appointments = getStoredAppointments();

  const appointmentId = searchParams.get('appointmentId') || appointments[0]?.id || '';
  const currentAppointment = appointments.find(a => a.id === appointmentId) || appointments[0];

  // Call Controls State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(145); // seconds
  const [activeTab, setActiveTab] = useState<'soap' | 'prescription' | 'referral'>('soap');

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SOAP State
  const [subjective, setSubjective] = useState(
    currentAppointment?.reason ? `Patient reports: ${currentAppointment.reason}` : ''
  );
  const [objective, setObjective] = useState(
    `Vitals reviewed: BP ${currentAppointment?.vitals?.systolicBp || 120}/${currentAppointment?.vitals?.diastolicBp || 80} mmHg, SpO2 ${currentAppointment?.vitals?.spo2 || 98}%, Pulse ${currentAppointment?.vitals?.pulseRate || 76} bpm. Patient alert, oriented, respiratory effort normal.`
  );
  const [assessment, setAssessment] = useState(
    'Acute upper respiratory infection with mild reactive airway features. Stable hemodynamic status.'
  );
  const [plan, setPlan] = useState(
    '1. Symptomatic relief with prescribed medications.\n2. Hydration and steam inhalation.\n3. Re-evaluate if symptoms persist beyond 5 days.'
  );

  // Prescription State
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      medicineName: 'Azithromycin 500mg',
      dosage: '500 mg',
      frequency: '1-0-0 (Once Daily)',
      duration: '3 Days',
      instructions: 'After lunch with water'
    },
    {
      medicineName: 'Paracetamol 650mg',
      dosage: '650 mg',
      frequency: 'SOS (When needed for fever)',
      duration: '5 Days',
      instructions: 'Minimum 6 hours gap between doses'
    }
  ]);

  const [selectedMed, setSelectedMed] = useState(FORMULARY_MEDICATIONS[0]?.medicineName || 'Paracetamol');
  const [medDosage, setMedDosage] = useState('500 mg');
  const [medFrequency, setMedFrequency] = useState('1-0-1 (Twice Daily)');
  const [medDuration, setMedDuration] = useState('5 Days');
  const [medInstructions, setMedInstructions] = useState('After meals');

  // Referral State
  const [referHospital, setReferHospital] = useState('PMCH Patna (Tertiary Care)');
  const [referDepartment, setReferDepartment] = useState('Pulmonary Medicine');
  const [referUrgency, setReferUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ROUTINE');
  const [referReason, setReferReason] = useState(
    'Specialist chest examination and spirometry evaluation.'
  );

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Add Item to Rx
  const handleAddMedication = () => {
    setPrescriptionItems(prev => [
      ...prev,
      {
        medicineName: selectedMed,
        dosage: medDosage,
        frequency: medFrequency,
        duration: medDuration,
        instructions: medInstructions
      }
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  // Complete Consultation
  const handleFinishConsultation = () => {
    const soapNote: ClinicalSoapNote = {
      subjective,
      objective,
      assessment,
      plan,
      doctorSignature: currentUser.name || 'Dr. Alexander Watson',
      recordedAt: new Date().toISOString()
    };

    const prescription: Prescription = {
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      appointmentId: currentAppointment.id,
      patientId: currentAppointment.patientId,
      doctorId: currentAppointment.doctorId || 'DOC-101',
      doctorName: currentAppointment.doctorName || 'Dr. Alexander Watson',
      items: prescriptionItems,
      generalAdvice: 'Adequate hydration, warm saline gargles, monitor temperature twice daily.',
      nextFollowUpDate: 'In 5 Days',
      issuedAt: new Date().toLocaleDateString()
    };

    const referral: Referral = {
      id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      appointmentId: currentAppointment.id,
      patientId: currentAppointment.patientId,
      referralHospitalName: referHospital,
      department: referDepartment,
      urgency: referUrgency,
      clinicalSummary: referReason,
      issuedAt: new Date().toLocaleDateString()
    };

    saveConsultationRecord(currentAppointment.id, soapNote, prescription, referral);
    setIsCompletedModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* 1. TOP STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider uppercase font-mono text-emerald-400">
                SECURE TELE-CONSULTATION
              </span>
              <span className="text-slate-400 font-mono text-xs">
                Room 1 • Session #{currentAppointment.tokenNumber}
              </span>
            </div>
            <span className="text-xs text-slate-300 font-bold">
              Patient: {currentAppointment.patientName} ({currentAppointment.patientAge}y/{currentAppointment.patientGender[0]})
            </span>
          </div>
        </div>

        {/* Live Call Duration & Bitrate Indicator */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-bold text-white">{formatTimer(callDuration)}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-xl">
            <Wifi className="w-3.5 h-3.5" />
            <span>HD 1080p • 24ms</span>
          </div>

          <button
            onClick={handleFinishConsultation}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Complete Consultation</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SPLIT INTERFACE: VIDEO CONSOLE (LEFT) + CLINICAL WORKSPACE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: VISUAL MOCK VIDEO FEED (SPAN 7) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Main Remote Video Window */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group">
            {/* Simulated Remote Patient Video Feed */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-teal-800/40 border-2 border-teal-400/60 flex items-center justify-center text-teal-200 text-2xl font-black shadow-xl backdrop-blur-md mb-3">
                {currentAppointment.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {currentAppointment.patientName}
              </h3>
              <p className="text-xs text-teal-300 font-mono mt-0.5">
                Connecting from: {currentAppointment.clinicName}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  AUDIO & VIDEO STREAM STABLE
                </span>
              </div>
            </div>

            {/* Simulated Audio Frequency Visualizer */}
            <div className="absolute bottom-16 left-4 flex items-end gap-1 h-6">
              {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>

            {/* Local Doctor PIP Window (Bottom Right) */}
            <div className="absolute bottom-3 right-3 w-28 sm:w-36 aspect-video bg-slate-900 rounded-xl border border-teal-500/50 shadow-xl overflow-hidden flex flex-col items-center justify-center text-center p-2 z-20">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                DR
              </div>
              <span className="text-[9px] font-mono text-slate-300 mt-1 truncate max-w-full">
                {currentUser.name || 'You (Doctor)'}
              </span>
              <span className="text-[8px] font-mono text-emerald-400">
                Self View Active
              </span>
            </div>

            {/* Video Controls Overlay (Bottom Center) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 flex items-center gap-3 z-30 shadow-lg">
              <button
                onClick={() => setIsAudioMuted(prev => !prev)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isAudioMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoMuted(prev => !prev)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isVideoMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoMuted ? 'Start Camera' : 'Stop Camera'}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(prev => !prev)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isScreenSharing ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Share Screen / PACS Imaging"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleFinishConsultation}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md"
                title="End Consultation"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Vitals Telemetry Banner Below Video */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">
                  Live Patient Telemetry
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                STREAMING
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {currentAppointment?.vitals?.systolicBp || 122}/{currentAppointment?.vitals?.diastolicBp || 82}
                </span>
                <span className="text-[9px] text-slate-400">mmHg</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {currentAppointment?.vitals?.pulseRate || 78}
                </span>
                <span className="text-[9px] text-slate-400">bpm</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {currentAppointment?.vitals?.spo2 || 98}%
                </span>
                <span className="text-[9px] text-slate-400">ambient</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Temperature</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                  {currentAppointment?.vitals?.temperature || 36.8}°C
                </span>
                <span className="text-[9px] text-slate-400">normothermic</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTEGRATED CLINICAL PANEL (SPAN 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
          {/* Clinical Workspace Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 p-2 gap-1 bg-slate-50 dark:bg-slate-800/40">
            <button
              onClick={() => setActiveTab('soap')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'soap'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SOAP Notes</span>
            </button>

            <button
              onClick={() => setActiveTab('prescription')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'prescription'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Prescription ({prescriptionItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('referral')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'referral'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tertiary Referral</span>
            </button>
          </div>

          {/* TAB 1: SOAP CLINICAL NOTES */}
          {activeTab === 'soap' && (
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[600px] text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subjective (Symptoms / Patient History)
                </label>
                <textarea
                  rows={3}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Objective (Clinical Findings & Tele-Examination)
                </label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assessment (Working Diagnosis)
                </label>
                <textarea
                  rows={2}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Plan (Therapy & Follow-up Instructions)
                </label>
                <textarea
                  rows={3}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DIGITAL PRESCRIPTION (Rx) BUILDER */}
          {activeTab === 'prescription' && (
            <div className="p-4 space-y-4 overflow-y-auto max-h-[600px] text-xs">
              {/* Add Medication Strip */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Add From Formulary Roster
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Medicine</label>
                    <select
                      value={selectedMed}
                      onChange={(e) => {
                        const name = e.target.value;
                        setSelectedMed(name);
                        const med = FORMULARY_MEDICATIONS.find(m => m.medicineName === name);
                        if (med && med.strength) setMedDosage(med.strength);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none"
                    >
                      {FORMULARY_MEDICATIONS.map(m => (
                        <option key={m.id} value={m.medicineName}>
                          {m.medicineName} ({m.genericName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Dosage</label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Frequency</label>
                    <select
                      value={medFrequency}
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none"
                    >
                      <option value="1-0-1 (Twice Daily)">1-0-1 (Twice Daily)</option>
                      <option value="1-0-0 (Once Daily - Morning)">1-0-0 (Once Daily - Morning)</option>
                      <option value="0-0-1 (Once Daily - Night)">0-0-1 (Once Daily - Night)</option>
                      <option value="1-1-1 (Thrice Daily)">1-1-1 (Thrice Daily)</option>
                      <option value="SOS (As needed)">SOS (As needed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Duration</label>
                    <input
                      type="text"
                      value={medDuration}
                      onChange={(e) => setMedDuration(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To Prescription</span>
                </button>
              </div>

              {/* Prescription Items List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Active Prescription Items ({prescriptionItems.length})
                </span>

                {prescriptionItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {idx + 1}. {item.medicineName} ({item.dosage})
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                        {item.frequency} • {item.duration}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.instructions}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMedication(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove Medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TERTIARY REFERRAL */}
          {activeTab === 'referral' && (
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[600px] text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Referral Tertiary Hospital / Medical College *
                </label>
                <select
                  value={referHospital}
                  onChange={(e) => setReferHospital(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="PMCH Patna (Patna Medical College & Hospital)">
                    PMCH Patna (Patna Medical College & Hospital)
                  </option>
                  <option value="AIIMS Patna (All India Institute of Medical Sciences)">
                    AIIMS Patna (All India Institute of Medical Sciences)
                  </option>
                  <option value="DMCH Darbhanga (Darbhanga Medical College)">
                    DMCH Darbhanga (Darbhanga Medical College)
                  </option>
                  <option value="SKMCH Muzaffarpur (Sri Krishna Medical College)">
                    SKMCH Muzaffarpur (Sri Krishna Medical College)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Specialist Department
                  </label>
                  <input
                    type="text"
                    value={referDepartment}
                    onChange={(e) => setReferDepartment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Referral Priority
                  </label>
                  <select
                    value={referUrgency}
                    onChange={(e) => setReferUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                  >
                    <option value="ROUTINE">Routine Elective</option>
                    <option value="URGENT">Urgent (Within 48h)</option>
                    <option value="EMERGENCY">Emergency ICU Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Transfer Summary & Findings
                </label>
                <textarea
                  rows={4}
                  value={referReason}
                  onChange={(e) => setReferReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Complete Button */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Dr. Sign: {currentUser.name || 'Dr. Alexander Watson'}
            </span>
            <button
              onClick={handleFinishConsultation}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Sign & File Encounter</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONSULTATION FILED MODAL */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 text-center space-y-4 text-slate-900 dark:text-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-black tracking-tight">
                Consultation Completed & Filed
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                SOAP note recorded, digital prescription issued to pharmacy, and encounter status marked COMPLETED.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono text-left space-y-1">
              <div>Patient: <strong>{currentAppointment.patientName}</strong></div>
              <div>Token: <strong>{currentAppointment.tokenNumber}</strong></div>
              <div>Rx Items: <strong>{prescriptionItems.length} Medications</strong></div>
              <div>Duration: <strong>{formatTimer(callDuration)}</strong></div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/eclinic/doctor-workspace"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Call Next Patient</span>
              </Link>

              <Link
                to="/eclinic"
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EClinicTelemedicinePage;
