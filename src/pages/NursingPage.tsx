import React, { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { 
  Stethoscope, 
  Save, 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserCheck, 
  Droplets, 
  Activity, 
  HeartPulse, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { MOCK_PATIENTS } from '../data/mockData';
import { NursingAssessmentFormValues } from '../types/icu';

// Pain Scale metadata
const PAIN_LEVELS = [
  { score: 0, label: 'No Pain', color: 'bg-emerald-500 text-white border-emerald-600', face: '😊' },
  { score: 1, label: 'Minimal', color: 'bg-emerald-400 text-white border-emerald-500', face: '🙂' },
  { score: 2, label: 'Mild', color: 'bg-teal-500 text-white border-teal-600', face: '😐' },
  { score: 3, label: 'Tolerable', color: 'bg-cyan-600 text-white border-cyan-700', face: '🫤' },
  { score: 4, label: 'Moderate', color: 'bg-yellow-500 text-white border-yellow-600', face: '🙁' },
  { score: 5, label: 'Noticeable', color: 'bg-amber-500 text-white border-amber-600', face: '😣' },
  { score: 6, label: 'Distressing', color: 'bg-orange-500 text-white border-orange-600', face: '😖' },
  { score: 7, label: 'Severe', color: 'bg-orange-600 text-white border-orange-700', face: '😫' },
  { score: 8, label: 'Intense', color: 'bg-rose-500 text-white border-rose-600', face: '😭' },
  { score: 9, label: 'Excruciating', color: 'bg-rose-600 text-white border-rose-700', face: '😱' },
  { score: 10, label: 'Unbearable', color: 'bg-red-700 text-white border-red-800 animate-pulse', face: '🤯' }
];

const PAIN_CHARACTER_OPTIONS = [
  'Sharp', 'Dull', 'Throbbing', 'Burning', 'Aching', 'Cramping', 'Radiating', 'Pressure', 'Stabbing'
];

const PAIN_INTERVENTIONS = [
  'IV Opioid Analgesic', 'Non-Opioid Analgesic PO', 'Epidural Bolus', 'Ice/Cold Pack', 'Heat Therapy', 'Repositioning', 'Relaxation Techniques'
];

export const NursingPage: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState('P-1024');
  const [activeTab, setActiveTab] = useState<'pain' | 'intake' | 'output' | 'notes' | 'summary'>('pain');
  const [showToast, setShowToast] = useState(false);

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedPatientId) || MOCK_PATIENTS[0];

  const defaultValues: NursingAssessmentFormValues = {
    patientId: selectedPatientId,
    assessmentTimestamp: new Date().toISOString().slice(0, 16),
    pain: {
      painScore: 3,
      location: 'Surgical Incision (Abdomen)',
      character: ['Aching', 'Dull'],
      interventions: ['Non-Opioid Analgesic PO', 'Repositioning'],
      reassessmentTime: '30 mins post-intervention',
      notes: 'Patient reports mild incision ache on coughing.'
    },
    fluidIntake: {
      oral: 150,
      ivFluids: 650,
      bloodProducts: 0,
      enteralFeed: 250,
      otherIntake: 0
    },
    fluidOutput: {
      urine: 520,
      urineCatheterType: 'Foley Catheter (14 Fr)',
      woundDrains: 45,
      emesisNG: 30,
      stool: 0,
      otherOutput: 0
    },
    clinicalNotes: {
      neurologicalNotes: 'Patient alert & oriented x4. GCS 15. Pupils 3mm equal & reactive to light.',
      cardiovascularNotes: 'HR 78 bpm, Sinus Rhythm. S1/S2 present, no murmurs. Peripheral pulses 2+ bilaterally.',
      respiratoryNotes: 'Lungs clear to auscultation bilaterally. SpO2 98% on room air. Resp rate 16/min.',
      gastrointestinalNotes: 'Abdomen soft, mildly tender near surgical dressing. Normal bowel sounds in 4 quadrants.',
      skinIntegrityNotes: 'Skin intact, dry and warm. Braden Score 19 (Low Risk). Surgical dressing dry & intact.',
      safetyChecklist: {
        fallRiskAssessed: true,
        sideRailsUp: true,
        callBellInReach: true,
        linesTubesSecured: true
      }
    },
    shiftSummary: {
      shiftType: 'DAY',
      nurseName: 'Priya Singh',
      nurseBadgeId: 'RN-88042',
      patientTrajectory: 'STABLE',
      attendingNotified: false,
      attendingDoctorName: 'Dr. Rahul Sharma',
      shiftHandoverNotes: 'Shift complete without acute events. Pain well managed with oral analgesics. Fluid balance +255 mL.'
    }
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm<NursingAssessmentFormValues>({
    defaultValues
  });

  // Watch fluid intake and output values for live auto-calculation
  const intakeValues = useWatch({ control, name: 'fluidIntake' });
  const outputValues = useWatch({ control, name: 'fluidOutput' });
  const painScore = useWatch({ control, name: 'pain.painScore' });

  const totalIntake = (Number(intakeValues?.oral) || 0) +
                      (Number(intakeValues?.ivFluids) || 0) +
                      (Number(intakeValues?.bloodProducts) || 0) +
                      (Number(intakeValues?.enteralFeed) || 0) +
                      (Number(intakeValues?.otherIntake) || 0);

  const totalOutput = (Number(outputValues?.urine) || 0) +
                      (Number(outputValues?.woundDrains) || 0) +
                      (Number(outputValues?.emesisNG) || 0) +
                      (Number(outputValues?.stool) || 0) +
                      (Number(outputValues?.otherOutput) || 0);

  const netBalance = totalIntake - totalOutput;

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    setValue('patientId', patientId);
  };

  const handleAutoFillDemo = () => {
    reset({
      ...defaultValues,
      patientId: selectedPatientId,
      assessmentTimestamp: new Date().toISOString().slice(0, 16)
    });
  };

  const onSubmit = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const currentPainMeta = PAIN_LEVELS.find(p => p.score === Number(painScore)) || PAIN_LEVELS[3];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Nursing Shift Assessment Saved</h4>
            <p className="text-xs text-slate-300">
              Shift record for {selectedPatient.name} ({selectedPatient.bedNumber}) signed & committed to EHR.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Stethoscope className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Bedside Nursing Clinical Assessment Form
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                React Hook Form State Management • Live Fluid Auto-Calculation • 5 Clinical Sections
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Preset Auto-Fill</span>
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Shift Assessment</span>
          </button>
        </div>
      </div>

      {/* Patient Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">Active Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {MOCK_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>
                Bed {p.bedNumber} — {p.name} (MRN: {p.mrn})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="font-bold text-slate-400">Diagnosis:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedPatient.admittingDiagnosis}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>Entry Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('pain')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pain'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-950/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <span>1. Pain Assessment</span>
          {painScore > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
              Score: {painScore}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('intake')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'intake'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-950/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span>2. Fluid Intake</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            {totalIntake} mL
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('output')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'output'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-950/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>3. Fluid Output & Balance</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            {netBalance >= 0 ? `+${netBalance}` : netBalance} mL
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-950/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>4. Clinical Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'summary'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-950/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>5. Shift Summary</span>
        </button>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1: PAIN ASSESSMENT */}
        {activeTab === 'pain' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                  <HeartPulse className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                    Pain Assessment & Management (NRS 0-10)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Numeric Rating Scale, pain location, pain qualities, and intervention tracking
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${currentPainMeta.color}`}>
                {currentPainMeta.face} {currentPainMeta.score} — {currentPainMeta.label}
              </span>
            </div>

            {/* Pain Score Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Pain Severity Score (0 = No Pain, 10 = Unbearable Pain)
              </label>
              
              <Controller
                name="pain.painScore"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-11 gap-2">
                    {PAIN_LEVELS.map((level) => {
                      const isSelected = Number(field.value) === level.score;
                      return (
                        <button
                          key={level.score}
                          type="button"
                          onClick={() => field.onChange(level.score)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'ring-4 ring-teal-500/30 scale-105 font-bold shadow-lg ' + level.color
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="text-xl">{level.face}</span>
                          <span className="text-sm font-bold font-mono">{level.score}</span>
                          <span className="text-[9px] truncate w-full font-sans leading-none">{level.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Pain Location & Character Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Pain Anatomical Location
                </label>
                <select
                  {...register('pain.location', { required: 'Pain location is required' })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Surgical Incision (Abdomen)">Surgical Incision (Abdomen)</option>
                  <option value="Chest / Sternum">Chest / Sternum</option>
                  <option value="Head / Cranial">Head / Cranial</option>
                  <option value="Lower Back / Lumbar">Lower Back / Lumbar</option>
                  <option value="Left Arm / Shoulder">Left Arm / Shoulder</option>
                  <option value="Right Arm / Shoulder">Right Arm / Shoulder</option>
                  <option value="Lower Extremity">Lower Extremity</option>
                  <option value="Generalized Body Aches">Generalized Body Aches</option>
                </select>
                {errors.pain?.location && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errors.pain.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Reassessment Timing / Schedule
                </label>
                <input
                  type="text"
                  {...register('pain.reassessmentTime')}
                  placeholder="e.g. 30 mins post IV analgesia"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Pain Character Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Pain Character & Qualities (Select all that apply)
              </label>
              <Controller
                name="pain.character"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {PAIN_CHARACTER_OPTIONS.map((char) => {
                      const isChecked = field.value?.includes(char);
                      return (
                        <button
                          key={char}
                          type="button"
                          onClick={() => {
                            const newArr = isChecked
                              ? field.value.filter((item: string) => item !== char)
                              : [...(field.value || []), char];
                            field.onChange(newArr);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '} {char}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Interventions Provided */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Nursing & Pharmacological Interventions
              </label>
              <Controller
                name="pain.interventions"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {PAIN_INTERVENTIONS.map((item) => {
                      const isChecked = field.value?.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            const newArr = isChecked
                              ? field.value.filter((i: string) => i !== item)
                              : [...(field.value || []), item];
                            field.onChange(newArr);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '} {item}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Pain Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Pain Assessment Narrative Notes
              </label>
              <textarea
                rows={3}
                {...register('pain.notes')}
                placeholder="Enter additional details regarding pain response, patient comfort, or non-verbal cues..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('intake')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to Fluid Intake</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: FLUID INTAKE */}
        {activeTab === 'intake' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Droplets className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                    Fluid Intake Monitoring (mL)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record oral fluids, IV infusions, blood products, and enteral nutrition
                  </p>
                </div>
              </div>

              {/* Total Intake Display Card */}
              <div className="px-4 py-2 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-2xl flex items-center gap-3">
                <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">TOTAL INTAKE:</span>
                <span className="text-lg font-extrabold font-mono text-cyan-600 dark:text-cyan-400">{totalIntake} mL</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Oral Intake */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Oral Fluids (Water, Juice, Ice)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidIntake.oral', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* IV Fluids */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  IV Infusions (NS, RL, D5W, Carrier)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidIntake.ivFluids', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Blood Products */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Blood Products (PRBC, FFP, Platelets)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidIntake.bloodProducts', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Enteral Feed */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Enteral Nutrition / Tube Feed / TPN
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidIntake.enteralFeed', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Other Intake */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Other Intake (Medication Flushes, Dialysis)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidIntake.otherIntake', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('pain')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Back to Pain
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('output')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to Fluid Output</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: FLUID OUTPUT & BALANCE */}
        {activeTab === 'output' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                    Fluid Output & Net Balance (mL)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track urine, surgical drains, emesis, stool, and total net fluid balance
                  </p>
                </div>
              </div>

              {/* Net Balance Status Badge */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                netBalance >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60'
              }`}>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    NET FLUID BALANCE:
                  </div>
                  <div className={`text-xl font-black font-mono flex items-center gap-1.5 ${
                    netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {netBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>{netBalance >= 0 ? `+${netBalance}` : netBalance} mL</span>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 border-l border-slate-300 dark:border-slate-700 pl-3">
                  <div>Intake: <span className="font-mono font-bold">{totalIntake} mL</span></div>
                  <div>Output: <span className="font-mono font-bold">{totalOutput} mL</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Urine Output */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Urine Output
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">mL/hr calc</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidOutput.urine', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
                <select
                  {...register('fluidOutput.urineCatheterType')}
                  className="w-full mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="Foley Catheter (14 Fr)">Foley Catheter (14 Fr)</option>
                  <option value="Foley Catheter (16 Fr)">Foley Catheter (16 Fr)</option>
                  <option value="Texas Catheter (External)">Texas Catheter (External)</option>
                  <option value="Spontaneous Voiding">Spontaneous Voiding</option>
                  <option value="Nephrostomy Tube">Nephrostomy Tube</option>
                </select>
              </div>

              {/* Surgical Drains */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Wound & Surgical Drains (JP, Hemovac)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidOutput.woundDrains', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Emesis & NG Tube */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Emesis / Nasogastric (NG) Suction
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidOutput.emesisNG', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Stool Output */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Stool / Diarrhea / Ostomy Output
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidOutput.stool', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Other Output */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Other Loss (Ultrafiltration, Chest Tube)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('fluidOutput.otherOutput', { valueAsNumber: true })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">mL</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('intake')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Back to Intake
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to Clinical Notes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: CLINICAL NOTES */}
        {activeTab === 'notes' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Organ Systems Assessment Notes & Patient Safety
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive nursing system evaluation and safety checks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Neurological */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Neurological System Notes
                </label>
                <textarea
                  rows={3}
                  {...register('clinicalNotes.neurologicalNotes')}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                />
              </div>

              {/* Cardiovascular */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Cardiovascular System Notes
                </label>
                <textarea
                  rows={3}
                  {...register('clinicalNotes.cardiovascularNotes')}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                />
              </div>

              {/* Respiratory */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Respiratory System Notes
                </label>
                <textarea
                  rows={3}
                  {...register('clinicalNotes.respiratoryNotes')}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                />
              </div>

              {/* Gastrointestinal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Gastrointestinal & Abdominal Notes
                </label>
                <textarea
                  rows={3}
                  {...register('clinicalNotes.gastrointestinalNotes')}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                />
              </div>

              {/* Skin Integrity */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Skin Integrity & Braden Pressure Injury Notes
                </label>
                <textarea
                  rows={2}
                  {...register('clinicalNotes.skinIntegrityNotes')}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Safety Checklist Cards */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Mandatory Bedside Safety Verification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-teal-500 transition-colors">
                  <input
                    type="checkbox"
                    {...register('clinicalNotes.safetyChecklist.fallRiskAssessed')}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Fall Risk Assessed</span>
                </label>

                <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-teal-500 transition-colors">
                  <input
                    type="checkbox"
                    {...register('clinicalNotes.safetyChecklist.sideRailsUp')}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Side Rails Up (x2/x4)</span>
                </label>

                <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-teal-500 transition-colors">
                  <input
                    type="checkbox"
                    {...register('clinicalNotes.safetyChecklist.callBellInReach')}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Call Bell in Reach</span>
                </label>

                <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-teal-500 transition-colors">
                  <input
                    type="checkbox"
                    {...register('clinicalNotes.safetyChecklist.linesTubesSecured')}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Lines/Tubes Verified</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('output')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Back to Output
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to Shift Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 5: SHIFT SUMMARY & SIGN-OFF */}
        {activeTab === 'summary' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Shift Summary & Nurse Sign-off
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Finalize shift handover record, physician notifications, and electronic signature
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nurse Name & ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Primary Staff Nurse Name
                </label>
                <input
                  type="text"
                  {...register('shiftSummary.nurseName', { required: 'Nurse name required' })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Nurse Badge / Staff ID
                </label>
                <input
                  type="text"
                  {...register('shiftSummary.nurseBadgeId', { required: 'Nurse ID required' })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Patient Overall Trajectory Trend
                </label>
                <select
                  {...register('shiftSummary.patientTrajectory')}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="STABLE">🟢 STABLE (No acute changes)</option>
                  <option value="IMPROVING">📈 IMPROVING (Positive progress)</option>
                  <option value="DETERIORATING">⚠️ DETERIORATING (Requires close monitoring)</option>
                  <option value="CRITICAL">🔴 CRITICAL (Active escalation)</option>
                </select>
              </div>
            </div>

            {/* Handover Narrative */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Shift Handover Narrative Notes & Care Recommendations
              </label>
              <textarea
                rows={4}
                {...register('shiftSummary.shiftHandoverNotes', { required: 'Handover summary notes are required' })}
                placeholder="Synthesize key shift findings, pending lab results, medication changes..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
              />
              {errors.shiftSummary?.shiftHandoverNotes && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.shiftSummary.shiftHandoverNotes.message}</p>
              )}
            </div>

            {/* Final Sign-off Box */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-teal-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Electronic Clinical Attestation</h4>
                    <p className="text-xs text-slate-400">
                      I attest that the information entered in this assessment is accurate and verified.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>SIGN & SUBMIT ASSESSMENT</span>
                </button>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Back to Notes
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NursingPage;
