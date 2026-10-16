import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addClinicalNote,
  addNursingNote,
  updateDoctorShiftHandover,
  addDoctorHandoverUpdate,
  DoctorHandoverUpdate
} from '../store/slices/patientSlice';
import {
  createNurseHandoverThunk,
  createShiftHandoverThunk,
} from '../store/slices/operationsSlice';
import { HandoverService } from '../services/handoverService';
import { HandoverRecord } from '../types/icu';
import {
  CheckSquare,
  ClipboardCheck,
  UserCheck,
  ShieldCheck,
  FileText,
  Send,
  Stethoscope,
  HeartPulse,
  Activity,
  Lock,
  User,
  Bed,
  Search,
  History,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Pill,
  Wind,
  Check,
  ArrowRight,
  Sliders
} from 'lucide-react';

const DOCTOR_ROSTER = [
  'Dr. Amit Kumar (AIIMS Patna - HOD Critical Care)',
  'Dr. Priya Sharma (PMCH Patna - Senior Intensivist)',
  'Dr. Rajesh Verma (IGIMS Patna - Pulmonary Lead)',
  'Dr. Sneha Roy (NMCH Patna - Critical Care Specialist)',
  'Dr. Sunita Mishra (DMCH Darbhanga - ICU Consultant)',
  'Dr. Ramesh Kumar (SKMCH Muzaffarpur - Senior Physician)'
];

const NURSE_ROSTER = [
  'Nurse Priya Singh (Senior RN Lead)',
  'Nurse Ananya Sen (ICU Charge Nurse)',
  'Nurse Vikram Singh (Critical Care RN)',
  'Nurse Anjali Deshmukh (Shift In-Charge RN)',
  'Nurse Pooja Kumari (Senior ICU Specialist)',
  'Nurse Rahul Sharma (Ventilator Care RN)'
];

export const ShiftHandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser, activeRole } = useAppSelector(state => state.auth);

  // Distinguish Nurse Dashboard from Doctor Dashboard
  const isNurseDashboard = activeRole === 'NURSE' || location.pathname.includes('/nurse');
  const isDoctorDashboard = !isNurseDashboard;

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'P-1024');
  const [searchFilter, setSearchFilter] = useState('');

  // Selected Patient object memoized for fast rendering
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Format current logged-in doctor name
  const loggedInDoctorName = useMemo(() => {
    if (currentUser?.role === 'DOCTOR' || activeRole === 'DOCTOR') {
      if (currentUser.name.includes('(')) return currentUser.name;
      const dept = currentUser.department || currentUser.specialty || 'Critical Care Lead';
      return `${currentUser.name} (${dept})`;
    }
    return selectedPatient?.assignedClinician || 'Dr. Ananya Roy (PMCH / AIIMS Intensivist Lead)';
  }, [currentUser, activeRole, selectedPatient]);

  // Format current logged-in nurse name
  const loggedInNurseName = useMemo(() => {
    if (currentUser?.role === 'NURSE' || activeRole === 'NURSE') {
      if (currentUser.name.includes('(')) return currentUser.name;
      const dept = currentUser.department || 'Medical ICU Nursing';
      return `${currentUser.name} (${dept})`;
    }
    return selectedPatient?.assignedNurse || 'Nurse Priya Sharma (Medical ICU Nursing)';
  }, [currentUser, activeRole, selectedPatient]);

  // Outgoing doctor options
  const outgoingDoctorOptions = useMemo(() => {
    const list = [
      loggedInDoctorName,
      ...DOCTOR_ROSTER.filter(d => !d.toLowerCase().includes(currentUser?.name?.toLowerCase() || 'ananya'))
    ];
    return Array.from(new Set(list));
  }, [loggedInDoctorName, currentUser]);

  // Outgoing nurse options
  const outgoingNurseOptions = useMemo(() => {
    const list = [
      loggedInNurseName,
      ...NURSE_ROSTER.filter(n => !n.toLowerCase().includes(currentUser?.name?.toLowerCase() || 'priya'))
    ];
    return Array.from(new Set(list));
  }, [loggedInNurseName, currentUser]);

  // Outgoing / Incoming Staff State
  const [outgoingDoctor, setOutgoingDoctor] = useState(loggedInDoctorName);
  const [incomingDoctor, setIncomingDoctor] = useState(DOCTOR_ROSTER[1]);
  const [outgoingNurse, setOutgoingNurse] = useState(loggedInNurseName);
  const [incomingNurse, setIncomingNurse] = useState(NURSE_ROSTER[1]);

  // ISBAR Textarea Editable States (Used directly by Doctor, or fallback for Nurse)
  const [situationText, setSituationText] = useState('');
  const [backgroundText, setBackgroundText] = useState('');
  const [assessmentText, setAssessmentText] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [saveDirectivesSuccess, setSaveDirectivesSuccess] = useState(false);

  // Incoming Doctor Update & Shift Takeover State
  const [incomingDoctorReviewer, setIncomingDoctorReviewer] = useState<string>(DOCTOR_ROSTER[1]);
  const [doctorUpdateType, setDoctorUpdateType] = useState<
    'TAKEOVER' | 'DIRECTIVES_UPDATE' | 'CLINICAL_ADDENDUM' | 'VENTILATOR_WEANING' | 'MEDICATION_CHANGE' | 'ENDORSEMENT'
  >('TAKEOVER');
  const [doctorUpdateNote, setDoctorUpdateNote] = useState('');
  const [doctorDirectivesAddendum, setDoctorDirectivesAddendum] = useState('');
  const [syncDirectivesWithRec, setSyncDirectivesWithRec] = useState(true);
  const [setAsAssigned, setSetAsAssigned] = useState(true);
  const [doctorUpdateSuccess, setDoctorUpdateSuccess] = useState(false);
  const [doctorTakeoverSuccess, setDoctorTakeoverSuccess] = useState(false);
  const [showNursingHistoryForDoctor, setShowNursingHistoryForDoctor] = useState(false);

  // Nurse Shift Update Form State (Bottom field for nurse transition)
  const [newNurseShift, setNewNurseShift] = useState('Evening Shift (15:00 - 23:00)');
  const [nurseHandoverNotes, setNurseHandoverNotes] = useState('');
  const [nurseSpecialAlert, setNurseSpecialAlert] = useState('');
  const [nurseHandoverSuccess, setNurseHandoverSuccess] = useState(false);

  // Modal & Notification States
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signOffPIN, setSignOffPIN] = useState('');
  const [pinError, setPinError] = useState('');
  const [signOffSuccess, setSignOffSuccess] = useState(false);
  const [lastSignedRecord, setLastSignedRecord] = useState<HandoverRecord | null>(null);
  const [pastHandovers, setPastHandovers] = useState<HandoverRecord[]>([]);

  // Update ISBAR content & roster defaults when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      if (isDoctorDashboard) {
        setOutgoingDoctor(loggedInDoctorName);
      } else {
        setOutgoingNurse(loggedInNurseName);
      }

      // Load Doctor's latest handover directives if available
      if (selectedPatient.latestDoctorHandover) {
        setSituationText(selectedPatient.latestDoctorHandover.situation);
        setBackgroundText(selectedPatient.latestDoctorHandover.background);
        setAssessmentText(selectedPatient.latestDoctorHandover.assessment);
        setRecommendationText(selectedPatient.latestDoctorHandover.recommendation);
        setDoctorDirectivesAddendum('');
        if (selectedPatient.latestDoctorHandover.incomingDoctor) {
          setIncomingDoctor(selectedPatient.latestDoctorHandover.incomingDoctor);
          setIncomingDoctorReviewer(selectedPatient.latestDoctorHandover.incomingDoctor);
        } else {
          setIncomingDoctorReviewer(loggedInDoctorName);
        }
      } else {
        const ventMode = selectedPatient.ventilator?.mode
          ? `Ventilator Mode: ${selectedPatient.ventilator.mode}`
          : 'PRVC Mechanical Ventilation';

        setSituationText(
          `Admitted to ICU for ${selectedPatient.admittingDiagnosis}. Patient status is ${selectedPatient.status}. Airway: ${ventMode}. Data Quality: ${selectedPatient.vitals.quality}.`
        );

        setBackgroundText(
          `Admitted on ${selectedPatient.admissionTime}. History: ${selectedPatient.medicalHistory || 'Hypertension, Type-2 Diabetes'}. Invasive Arterial Line in Right Radial, Central Line in Right Subclavian. Allergies: ${selectedPatient.allergies || 'Penicillin'}.`
        );

        const vitals = selectedPatient.vitals;
        setAssessmentText(
          `Latest Vitals — HR: ${vitals.hr} bpm, BP: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg, SpO2: ${vitals.spo2}%, MAP: ${vitals.map} mmHg, Temp: ${vitals.temp}°C, RR: ${vitals.rr}/min.`
        );

        const defaultRec = `Continue mechanical ventilation weaning protocol. Repeat arterial blood gas (ABG) in 2 hours. Maintain MAP > 65 mmHg with titratable Norepinephrine infusion. Re-evaluate sedatives on evening rounds.`;
        setRecommendationText(defaultRec);
        setDoctorDirectivesAddendum('');
        setIncomingDoctorReviewer(DOCTOR_ROSTER[1]);
      }

      // Load past handovers
      const history = HandoverService.getHandoversForPatient(selectedPatient.id);
      setPastHandovers(history);
    }
  }, [selectedPatientId, loggedInDoctorName, loggedInNurseName, isDoctorDashboard]);

  // Doctor: Save updated clinical directives to patient record in Redux
  const handleSaveDoctorDirectives = () => {
    dispatch(
      updateDoctorShiftHandover({
        patientId: selectedPatient.id,
        doctorName: outgoingDoctor,
        incomingDoctor: incomingDoctor,
        situation: situationText,
        background: backgroundText,
        assessment: assessmentText,
        recommendation: recommendationText,
        lastUpdatedBy: outgoingDoctor,
        handoverStatus: 'DIRECTIVES_UPDATED'
      })
    );
    dispatch(
      addClinicalNote({
        patientId: selectedPatient.id,
        doctorName: outgoingDoctor,
        note: `[CLINICAL SHIFT DIRECTIVES UPDATED] Situation: ${situationText.slice(0, 120)}... Rec: ${recommendationText}`,
        remark: 'Doctor Shift Update'
      })
    );
    setSaveDirectivesSuccess(true);
    setTimeout(() => setSaveDirectivesSuccess(false), 4000);
  };

  // Incoming Doctor: Add Clinical Update & append revised directives
  const handleAddDoctorUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorUpdateNote.trim()) return;

    const existingDirectives = (selectedPatient.latestDoctorHandover?.recommendation || recommendationText).trim();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDateStr = new Date().toLocaleDateString([], { day: '2-digit', month: 'short' });

    // Strictly append the new doctor's additions, preserving original directives intact
    let finalCombinedPlan = existingDirectives;
    if (doctorDirectivesAddendum.trim()) {
      const addendumBlock = `[ADDENDUM by ${incomingDoctorReviewer} • ${nowDateStr} ${nowTimeStr}]:\n${doctorDirectivesAddendum.trim()}`;
      finalCombinedPlan = existingDirectives ? `${existingDirectives}\n\n${addendumBlock}` : addendumBlock;
    }

    dispatch(
      addDoctorHandoverUpdate({
        patientId: selectedPatient.id,
        doctorName: incomingDoctorReviewer,
        updateType: doctorUpdateType,
        note: doctorUpdateNote.trim(),
        setAsAssignedClinician: setAsAssigned,
        revisedRecommendation: syncDirectivesWithRec ? finalCombinedPlan : undefined,
        revisedDirectives: syncDirectivesWithRec
          ? {
              situation: situationText,
              background: backgroundText,
              assessment: assessmentText,
              recommendation: finalCombinedPlan
            }
          : undefined
      })
    );

    if (syncDirectivesWithRec) {
      setRecommendationText(finalCombinedPlan);
    }

    setDoctorDirectivesAddendum('');
    setDoctorUpdateNote('');
    setDoctorUpdateSuccess(true);
    setTimeout(() => setDoctorUpdateSuccess(false), 5000);
  };

  // Incoming Doctor: Quick One-Click Duty Shift Takeover
  const handleQuickTakeover = () => {
    const defaultTakeoverNote = `Duty shift formally taken over by ${incomingDoctorReviewer}. Previous attending clinical directives reviewed, verified with ICU nursing team, and patient telemetry assessed bedside.`;
    dispatch(
      addDoctorHandoverUpdate({
        patientId: selectedPatient.id,
        doctorName: incomingDoctorReviewer,
        updateType: 'TAKEOVER',
        note: defaultTakeoverNote,
        setAsAssignedClinician: true,
        revisedRecommendation: recommendationText
      })
    );
    setDoctorTakeoverSuccess(true);
    setTimeout(() => setDoctorTakeoverSuccess(false), 5000);
  };

  const handleAppendSnippet = (snippet: string) => {
    setDoctorUpdateNote(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${snippet}` : snippet;
    });
  };

  const handleAppendDirectiveSnippet = (snippet: string) => {
    setDoctorDirectivesAddendum(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${snippet}` : snippet;
    });
  };

  // Nurse: Add new shift handover update at the bottom (for the incoming nurse)
  const handleAddNurseHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseHandoverNotes.trim()) return;

    const formattedNote = nurseSpecialAlert.trim()
      ? `${nurseHandoverNotes.trim()} \n[🚨 URGENT FLAG FOR INCOMING NURSE: ${nurseSpecialAlert.trim()}]`
      : nurseHandoverNotes.trim();

    dispatch(
      addNursingNote({
        patientId: selectedPatient.id,
        nurseName: outgoingNurse,
        note: formattedNote,
        shift: newNurseShift
      })
    );

    setNurseHandoverNotes('');
    setNurseSpecialAlert('');
    setNurseHandoverSuccess(true);
    setTimeout(() => {
      setNurseHandoverSuccess(false);
    }, 5000);
  };

  // Handle Handover Sign-Off Submit
  const handleConfirmSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signOffPIN || signOffPIN.length < 4) {
      setPinError('Please enter a valid 4-digit PIN (e.g. 1234)');
      return;
    }

    // Create Handover Record
    const record = HandoverService.createShiftHandover(
      selectedPatient.id,
      'DR-CURR',
      outgoingDoctor,
      'RN-CURR',
      outgoingNurse,
      'DR-NEW',
      incomingDoctor,
      'RN-NEW',
      incomingNurse,
      new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      new Date().toISOString(),
      `[ISBAR HANDOVER] ${situationText} | Rec: ${recommendationText}`,
      assessmentText,
      `Latest Doctor Note: ${situationText}`,
      `Latest Nurse Note: Bedside monitoring stable`,
      `Ventilator & Titrations active`,
      0
    );

    if (isNurseDashboard) {
      dispatch(
        addNursingNote({
          patientId: selectedPatient.id,
          nurseName: outgoingNurse,
          note: `[SHIFT HANDOVER SIGN-OFF] Handed over patient to ${incomingNurse}. Doctor Directives verified. Status: ${nurseHandoverNotes || 'Patient stable on handover transfer.'}`,
          shift: newNurseShift
        })
      );
      // Synchronize with ICU Operations Backend (POST /api/v1/operations/nurse-handovers)
      dispatch(
        createNurseHandoverThunk({
          admission_id: (selectedPatient as any).admissionId || selectedPatient.id || 'a1d63183-f727-4a4c-a8d8-a12db1454282',
          incoming_nurse_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
          situation: situationText || `Handover to ${incomingNurse}`,
          background: backgroundText || `Bedside monitoring active in ${selectedPatient.bedNumber}`,
          assessment: assessmentText || nurseHandoverNotes || 'Patient stable on handover transfer',
          recommendation: recommendationText || 'Continue standard ICU monitoring and scheduled medications',
          lines_and_devices: []
        })
      );
    } else {
      // Doctor Sign-Off: update patient doctor handover directives in Redux
      dispatch(
        updateDoctorShiftHandover({
          patientId: selectedPatient.id,
          doctorName: outgoingDoctor,
          incomingDoctor: incomingDoctor,
          situation: situationText,
          background: backgroundText,
          assessment: assessmentText,
          recommendation: recommendationText
        })
      );

      dispatch(
        addClinicalNote({
          patientId: selectedPatient.id,
          doctorName: outgoingDoctor,
          note: `[ISBAR SHIFT HANDOVER] Handed over patient care to ${incomingDoctor}. Recommendations: ${recommendationText}`,
          remark: 'Shift Handover Sign-Off'
        })
      );

      // Synchronize with ICU Operations Backend (POST /api/v1/operations/shift-handovers)
      dispatch(
        createShiftHandoverThunk({
          icu_id: '4d97e6e2-e4a4-41f0-95b2-428f7e80de88',
          incoming_incharge_id: 'e2224da6-d357-4563-a854-7bf86106423d',
          shift_type: 'MORNING_TO_EVENING',
          shift_date: new Date().toISOString().split('T')[0],
          census_summary: {
            total_patients: patients.length,
            critical_patients: patients.filter(p => p.status === 'CRITICAL').length,
            ventilated_patients: patients.filter(p => Boolean(p.ventilator)).length,
          },
          safety_concerns: `[DOCTOR ISBAR] ${situationText} | Assessment: ${assessmentText} | Plan: ${recommendationText}`,
        })
      );
    }

    setLastSignedRecord(record);
    setPastHandovers(prev => [record, ...prev]);
    setShowSignOffModal(false);
    setSignOffSuccess(true);
    setSignOffPIN('');
    setPinError('');

    setTimeout(() => {
      setSignOffSuccess(false);
    }, 6000);
  };

  // Filter patient worklist efficiently with useMemo
  const filteredPatients = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.bedNumber.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.admittingDiagnosis.toLowerCase().includes(query)
    );
  }, [patients, searchFilter]);

  // Doctor directives data to display (read-only for nurse)
  const activeDoctorName = selectedPatient.latestDoctorHandover?.doctorName || selectedPatient.assignedClinician;
  const activeDoctorTimestamp = selectedPatient.latestDoctorHandover?.timestamp || 'Latest Shift Round';
  const activeSituation = selectedPatient.latestDoctorHandover?.situation || situationText;
  const activeBackground = selectedPatient.latestDoctorHandover?.background || backgroundText;
  const activeAssessment = selectedPatient.latestDoctorHandover?.assessment || assessmentText;
  const activeRecommendation = selectedPatient.latestDoctorHandover?.recommendation || recommendationText;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <CheckSquare className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-mono text-[10px] font-bold uppercase border border-teal-300">
                  {isNurseDashboard ? 'NURSE SHIFT HANDOVER' : 'DOCTOR SHIFT HANDOVER'}
                </span>
                <span className="text-xs text-slate-400 font-mono">ISBAR Protocol</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {isNurseDashboard
                  ? 'Nurse Shift Handover & Care Transition Workstation'
                  : 'Clinician Shift Handover & ISBAR Workstation'}
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isNurseDashboard
              ? 'Review attending doctor clinical directives, complete bedside nurse transfer, and document shift handover notes for incoming nursing staff.'
              : 'Time-boxed clinician shift handover, structured ISBAR transfer of care, and verified electronic sign-offs for ICU patients.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/operations')}
            className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-slate-300 dark:border-slate-700"
            title="Open Full ICU Operations, Rounds & Handovers Hub"
          >
            <ClipboardCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>ICU Operations & Rounds Hub</span>
          </button>
          <button
            onClick={() => setShowSignOffModal(true)}
            className="px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign-Off Shift Handover</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {signOffSuccess && lastSignedRecord && (
        <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm block">Shift Handover Signed Off & Verified</span>
              <p className="text-[11px] opacity-90 font-sans">
                Handover ID: <strong>{lastSignedRecord.id}</strong> • Outgoing:{' '}
                {isDoctorDashboard ? lastSignedRecord.previousDoctorName : lastSignedRecord.previousNurseName} ➔ Incoming:{' '}
                {isDoctorDashboard ? lastSignedRecord.newDoctorName : lastSignedRecord.newNurseName}
              </p>
            </div>
          </div>
          <span className="text-[10px] px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold">
            VERIFIED SIGNATURE
          </span>
        </div>
      )}

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Selection Worklist */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
              <Bed className="w-5 h-5 text-teal-600" />
              ICU Patients Worklist
            </h2>
            <span className="text-xs text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {filteredPatients.length} Patients
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bed, Patient, MRN..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredPatients.map(p => {
              const isSelected = selectedPatient.id === p.id;
              const isCritical = p.status === 'CRITICAL';
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#0F766E] text-white border-[#0D655E] shadow-md ring-2 ring-teal-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Bed {p.bedNumber}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        isCritical
                          ? isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-teal-100 text-teal-800 border border-teal-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="font-extrabold text-sm truncate mt-2">{p.name}</div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {p.admittingDiagnosis}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-white/20 dark:border-slate-700">
                    <span>MRN: {p.mrn}</span>
                    <span>Priority: {p.reviewPriority}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Main Workstation Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header detail */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-teal-700 uppercase">
                  ISBAR SHIFT TRANSFER RECORD
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-sans mt-0.5">
                  {selectedPatient.name} (Bed {selectedPatient.bedNumber})
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  MRN: {selectedPatient.mrn} • Age: {selectedPatient.age}y {selectedPatient.gender} • Admitted:{' '}
                  {selectedPatient.admissionTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800">
                  Transfer Active
                </span>
              </div>
            </div>

            {/* Clinician Roster Transfer Selection */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/60 border border-teal-100 dark:border-slate-700 text-xs font-sans space-y-4">
              {/* Doctor Dashboard View: Show Doctor Shift Handover Roster & Takeover Status */}
              {isDoctorDashboard && (
                <div className="space-y-4">
                  {/* Status Banner for Incoming Doctor */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border-2 border-teal-500/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 border border-teal-300">
                          Handover Transfer Status
                        </span>
                        {selectedPatient.latestDoctorHandover?.handoverStatus === 'TAKEN_OVER' ? (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Shift Taken Over by {selectedPatient.latestDoctorHandover?.lastUpdatedBy || selectedPatient.latestDoctorHandover?.incomingDoctor || incomingDoctor}
                          </span>
                        ) : selectedPatient.latestDoctorHandover?.handoverStatus === 'DIRECTIVES_UPDATED' ? (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-blue-600" /> Directives Revised ({selectedPatient.latestDoctorHandover?.lastUpdatedAt})
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" /> Awaiting Incoming Doctor Review & Takeover
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold">
                        Handed over by:{' '}
                        <strong className="text-teal-800 dark:text-teal-300">
                          {selectedPatient.latestDoctorHandover?.doctorName || outgoingDoctor}
                        </strong>{' '}
                        ➔ Assigned to Incoming Doctor:{' '}
                        <strong className="text-teal-900 dark:text-teal-100">
                          {selectedPatient.latestDoctorHandover?.incomingDoctor || incomingDoctor}
                        </strong>
                      </p>
                      {selectedPatient.latestDoctorHandover?.lastUpdatedAt && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Last Directives Sync: {selectedPatient.latestDoctorHandover.lastUpdatedAt} • Authored by {selectedPatient.latestDoctorHandover.lastUpdatedBy}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleQuickTakeover}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Formally take over patient as attending doctor"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Accept & Take Over Care</span>
                      </button>
                      <a
                        href="#incoming-doctor-update-form"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-600" />
                        <span>Add New Update</span>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        Doctor Shift Handover Roster & Transition Pair
                      </label>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full font-bold">
                        Physician Transfer
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono block">Outgoing Doctor (Signing Off)</span>
                        <select
                          value={outgoingDoctor}
                          onChange={e => setOutgoingDoctor(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 text-xs"
                        >
                          {outgoingDoctorOptions.map(doc => (
                            <option key={doc} value={doc}>
                              {doc}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono block">Incoming Doctor (Taking Over)</span>
                        <select
                          value={incomingDoctor}
                          onChange={e => setIncomingDoctor(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 text-xs"
                        >
                          {DOCTOR_ROSTER.map(doc => (
                            <option key={doc} value={doc}>
                              {doc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nurse Dashboard View: Show ONLY Nurse Shift Handover Roster */}
              {isNurseDashboard && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      Nurse Shift Handover Roster
                    </label>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-bold">
                      Bedside Nursing Transfer
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono block">Outgoing Nurse (Signing Off)</span>
                      <select
                        value={outgoingNurse}
                        onChange={e => setOutgoingNurse(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 text-xs"
                      >
                        {outgoingNurseOptions.map(n => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono block">Incoming Nurse (Taking Over)</span>
                      <select
                        value={incomingNurse}
                        onChange={e => setIncomingNurse(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 text-xs"
                      >
                        {NURSE_ROSTER.map(n => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Directives & ISBAR Section */}
            {isDoctorDashboard ? (
              /* DOCTOR DASHBOARD: Editable ISBAR Workstation */
              <div className="space-y-4 text-xs font-sans">
                {saveDirectivesSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Doctor directives updated successfully! These updates are now visible to the nursing staff in real-time.</span>
                  </div>
                )}

                {/* I: Identify */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      I - IDENTIFY
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Patient & Medical Team</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-semibold">
                    Patient: {selectedPatient.name}, {selectedPatient.age}y {selectedPatient.gender}, MRN:{' '}
                    {selectedPatient.mrn}, Location: Bed {selectedPatient.bedNumber} ({selectedPatient.unitName || 'ICU Main Wing'}).
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Outgoing Doctor: <strong className="text-slate-700 dark:text-slate-300">{outgoingDoctor}</strong> | Incoming Doctor:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">{incomingDoctor}</strong>
                  </p>
                </div>

                {/* S: Situation */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      S - SITUATION
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Current Clinical Problem & Airway</span>
                  </div>
                  <textarea
                    rows={2}
                    value={situationText}
                    onChange={e => setSituationText(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* B: Background */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      B - BACKGROUND
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Admission History & Invasive Lines</span>
                  </div>
                  <textarea
                    rows={2}
                    value={backgroundText}
                    onChange={e => setBackgroundText(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* A: Assessment */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4" />
                      A - ASSESSMENT
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Telemetry, Vitals & Organ Support</span>
                  </div>
                  <textarea
                    rows={2}
                    value={assessmentText}
                    onChange={e => setAssessmentText(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* R: Recommendation */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Send className="w-4 h-4" />
                      R - RECOMMENDATION & DIRECTIVES
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Clinical Orders for Next Shift</span>
                  </div>
                  <textarea
                    rows={3}
                    value={recommendationText}
                    onChange={e => setRecommendationText(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                  {selectedPatient.latestDoctorHandover && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-mono text-[10px] text-teal-600 dark:text-teal-400">
                        <Lock className="w-3 h-3 text-amber-500" /> Active Bedside Plan Synced. Incoming doctors can append verified addendums in the Workstation below.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDoctorDirectives}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-600"
                  >
                    <Save className="w-4 h-4 text-teal-600" />
                    <span>Update & Save Directives for Nursing Staff</span>
                  </button>

                  <button
                    onClick={() => setShowSignOffModal(true)}
                    className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Verify & Sign-Off Shift Handover</span>
                  </button>
                </div>
              </div>
            ) : (
              /* NURSE DASHBOARD: Read-Only Doctor Shift Directives Display */
              <div className="space-y-4 text-xs font-sans">
                {/* Doctor Directives Banner */}
                <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-slate-800/80 border-2 border-teal-500/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
                        <Stethoscope className="w-5 h-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 dark:text-white text-sm">
                            Attending Doctor's Shift Handover Directives & Care Plan
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 font-mono text-[10px] font-bold uppercase border border-teal-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Read-Only for Nursing
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          Updated by: <strong className="text-teal-800 dark:text-teal-300">{activeDoctorName}</strong> • {activeDoctorTimestamp}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only ISBAR Grid */}
                  <div className="space-y-3">
                    {/* S: Situation */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-teal-600" />
                          S - Situation & Airway Status
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Doctor Observation</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {activeSituation}
                      </p>
                    </div>

                    {/* B: Background */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          B - Background, Medical History & Invasive Lines
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Admission Details</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {activeBackground}
                      </p>
                    </div>

                    {/* A: Assessment */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                          A - Telemetry, Vitals & Organ Support Assessment
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Clinical Evaluation</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {activeAssessment}
                      </p>
                    </div>

                    {/* R: Recommendation (Highlighted) */}
                    <div className="p-4 rounded-xl bg-teal-500/10 dark:bg-teal-950/40 border-2 border-teal-500/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-teal-800 dark:text-teal-300 font-mono text-xs uppercase flex items-center gap-1.5">
                          <Send className="w-4 h-4 text-teal-600" />
                          R - Clinical Recommendations & Orders for Nursing Staff
                        </span>
                        <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300 font-bold">
                          Attending Physician Orders
                        </span>
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                        {activeRecommendation}
                      </p>
                    </div>

                    {/* Latest Incoming Doctor Directives Revision Alert (for Nursing Staff) */}
                    {selectedPatient.doctorHandoverUpdates && selectedPatient.doctorHandoverUpdates.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/40 space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-amber-900 dark:text-amber-200 font-mono text-[11px] uppercase flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            Latest Incoming Doctor Update & Directives Revision ({selectedPatient.doctorHandoverUpdates[0].updateType.replace('_', ' ')})
                          </span>
                          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                            {selectedPatient.doctorHandoverUpdates[0].date}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 font-medium">
                          <strong>{selectedPatient.doctorHandoverUpdates[0].doctorName}:</strong> {selectedPatient.doctorHandoverUpdates[0].note}
                        </p>
                        {selectedPatient.doctorHandoverUpdates[0].revisedRecommendation && (
                          <div className="mt-1 p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 text-xs">
                            <strong className="text-amber-800 dark:text-amber-300 font-mono uppercase text-[10px] block">
                              Active Revised Orders for Nursing:
                            </strong>
                            <span className="text-slate-900 dark:text-white font-semibold">
                              {selectedPatient.doctorHandoverUpdates[0].revisedRecommendation}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Doctor directives are preserved without edit or deletion permissions for nursing. Use the update form below to record nursing shift handover notes for the incoming nurse.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DOCTOR DASHBOARD: Incoming Doctor Duty Takeover & Shift Updates Workstation */}
          {isDoctorDashboard ? (
            <div id="incoming-doctor-update-form" className="space-y-6">
              {/* Success Notification Banners */}
              {doctorUpdateSuccess && (
                <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">Incoming Doctor Clinical Update Recorded</span>
                      <p className="text-[11px] opacity-90 font-sans">
                        Patient care directives have been updated and broadcasted to ICU bedside nursing in real-time.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold">
                    SYNCHRONIZED
                  </span>
                </div>
              )}

              {doctorTakeoverSuccess && (
                <div className="p-4 bg-teal-500/10 border-2 border-teal-500/40 rounded-2xl text-teal-900 dark:text-teal-200 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">Shift Duty Successfully Taken Over</span>
                      <p className="text-[11px] opacity-90 font-sans">
                        You ({incomingDoctorReviewer}) are now verified as the Primary Attending Intensivist on duty for {selectedPatient.name}.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-3 py-1 bg-teal-700 text-white rounded-lg font-bold">
                    PRIMARY ATTENDING
                  </span>
                </div>
              )}

              {/* Incoming Doctor Review & Shift Update Form */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
                      <Stethoscope className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        Incoming Doctor Review & Directives Revision Workstation
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        For the assigned incoming intensivist to document bedside evaluation, adjust orders, and wean support protocols.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Duty Takeover Workstation
                    </span>
                  </div>
                </div>

                <form onSubmit={handleAddDoctorUpdate} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Add New Clinical Update / Shift Handover Addendum
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Target Patient: <strong>{selectedPatient.name}</strong> (Bed {selectedPatient.bedNumber})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Reviewing / Incoming Doctor *
                      </label>
                      <select
                        value={incomingDoctorReviewer}
                        onChange={e => setIncomingDoctorReviewer(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                      >
                        {DOCTOR_ROSTER.map(doc => (
                          <option key={doc} value={doc}>
                            {doc}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 block font-mono">
                        {incomingDoctorReviewer === (selectedPatient.latestDoctorHandover?.incomingDoctor || incomingDoctor)
                          ? '✓ Assigned Incoming Intensivist'
                          : 'Covering Intensivist'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Clinical Update Category *
                      </label>
                      <select
                        value={doctorUpdateType}
                        onChange={e => setDoctorUpdateType(e.target.value as any)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="TAKEOVER">🩺 Shift Takeover & Initial Bedside Evaluation</option>
                        <option value="DIRECTIVES_UPDATE">📋 Revised Directives & Treatment Plan Adjustment</option>
                        <option value="VENTILATOR_WEANING">🫁 Ventilator Settings / Weaning Protocol Revision</option>
                        <option value="MEDICATION_CHANGE">💊 Medication, Inotropes & Infusion Titration</option>
                        <option value="CLINICAL_ADDENDUM">⚡ Critical Urgent Alert / Stat Order</option>
                        <option value="ENDORSEMENT">✅ Handover Accepted & Care Plan Endorsed (No Changes)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick-Click Clinical Snippet Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block font-mono">
                      Quick Clinical Snippets (Click to insert):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Bedside exam stable on shift arrival.',
                        'ABG PaO2 improved; wean FiO2 & PEEP.',
                        'Norad tapering ongoing, maintain MAP > 65.',
                        'Sedation vacation scheduled for morning round.',
                        'Repeat ABG, serum electrolytes and lactate in 2 hrs.',
                        'Strict aseptic suctioning and oral hygiene confirmed.',
                        'Tracheostomy site clean and dressing intact.'
                      ].map((snippet, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAppendSnippet(snippet)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-slate-600 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          + {snippet.slice(0, 32)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Clinical Observations Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Incoming Doctor Observations & Bedside Progress *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={doctorUpdateNote}
                      onChange={e => setDoctorUpdateNote(e.target.value)}
                      placeholder="Document physical examination upon duty takeover, telemetry status, hemodynamic stability, airway tolerance, diagnostic lab results, and patient response..."
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 font-sans"
                    />
                  </div>

                  {/* Preserved Active Directives & Bedside Orders (LOCKED / NON-EDITABLE) */}
                  <div className="space-y-3 pt-1">
                    {/* Read-Only Locked Box for Existing Attending Plan */}
                    <div className="p-3.5 bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-sans">
                          <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Active Directives & Bedside Orders (Locked • Non-Editable)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md border border-amber-300 dark:border-amber-800 font-semibold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Non-Editable / Locked
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            Authored: {selectedPatient.latestDoctorHandover?.doctorName || outgoingDoctor}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          readOnly
                          rows={3}
                          value={selectedPatient.latestDoctorHandover?.recommendation || recommendationText}
                          className="w-full p-3 bg-slate-200/50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-sans cursor-not-allowed select-text resize-none focus:outline-none focus:ring-0 leading-relaxed"
                          title="Previous directives are locked to prevent accidental overwrite or medical error."
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-white/70 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 pointer-events-none">
                          <Lock className="w-2.5 h-2.5 text-slate-400" /> Preserved Plan
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                        <Info className="w-3 h-3 text-slate-400 shrink-0" />
                        Attending doctor's existing plan cannot be edited or erased. If you have new orders, please append them below.
                      </p>
                    </div>

                    {/* Append New Directives / Addendum (EDITABLE FOR NEW DOCTOR) */}
                    <div className="p-3.5 bg-teal-50/60 dark:bg-slate-900/50 border border-teal-200/90 dark:border-teal-900/40 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <label className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 font-sans">
                          <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Append New Directives / Plan Addendum (Append Only)</span>
                        </label>
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono">
                          Will append below active directives with your signature
                        </span>
                      </div>

                      {/* Quick shortcut chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Quick Append:</span>
                        {[
                          'Taper Norad by 0.5 ml/h if MAP > 70',
                          'Repeat ABG at 18:00',
                          'Wean FiO2 to 40% if SpO2 > 94%',
                          'Hold Sedation for Neuro Exam',
                          'Stat Serum K+ Check',
                          'Maintain MAP > 65 mmHg'
                        ].map(snippet => (
                          <button
                            key={snippet}
                            type="button"
                            onClick={() => handleAppendDirectiveSnippet(snippet)}
                            className="px-2 py-0.5 text-[10px] font-medium bg-white dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-md border border-teal-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            + {snippet}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={doctorDirectivesAddendum}
                        onChange={e => setDoctorDirectivesAddendum(e.target.value)}
                        placeholder="Type new orders, titration changes, or follow-up plans to append to this patient's treatment plan (e.g. Wean Norad by 0.5 ml/hr. Repeat ABG in 2 hours)..."
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 font-sans shadow-sm placeholder:text-slate-400"
                      />

                      {/* Real-time Combined Preview */}
                      {doctorDirectivesAddendum.trim() && (
                        <div className="mt-2 p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono border border-slate-700 space-y-1">
                          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider flex items-center justify-between">
                            <span>⚡ Live Preview: Resulting Appended Bedside Directives</span>
                            <span className="text-slate-400 font-normal">Original preserved + Addendum</span>
                          </div>
                          <div className="text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed border-t border-slate-800 pt-1 text-[10px]">
                            {selectedPatient.latestDoctorHandover?.recommendation || recommendationText}
                            {'\n\n'}
                            <span className="text-teal-300 font-semibold">
                              [ADDENDUM by {incomingDoctorReviewer} • Today]:
                            </span>
                            {'\n'}
                            <span className="text-emerald-300 font-semibold">{doctorDirectivesAddendum.trim()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options checkboxes */}
                  <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncDirectivesWithRec}
                        onChange={e => setSyncDirectivesWithRec(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Synchronize & append to active ISBAR Bedside Directives</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setAsAssigned}
                        onChange={e => setSetAsAssigned(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Formally set me as Primary Attending Clinician on Duty</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 font-mono">
                      * All updates are stamped with your electronic clinician credentials.
                    </span>
                    <button
                      type="submit"
                      disabled={!doctorUpdateNote.trim()}
                      className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>+ Post Incoming Doctor Update & Append Directives</span>
                    </button>
                  </div>
                </form>

                {/* Chronological Incoming Doctor Updates History */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                      <History className="w-4 h-4 text-teal-600" />
                      Incoming Doctor Updates & Takeover History ({selectedPatient.doctorHandoverUpdates?.length || 0})
                    </h4>
                    <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                      🔒 Clinician Audit Log • Permanent
                    </span>
                  </div>

                  {!selectedPatient.doctorHandoverUpdates || selectedPatient.doctorHandoverUpdates.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No incoming doctor updates logged yet for {selectedPatient.name}. Use the form above to record your bedside review and directives.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                      {selectedPatient.doctorHandoverUpdates.map(entry => {
                        const isTakeover = entry.updateType === 'TAKEOVER';
                        const isWean = entry.updateType === 'VENTILATOR_WEANING';
                        const isAlert = entry.updateType === 'CLINICAL_ADDENDUM';

                        return (
                          <div
                            key={entry.id}
                            className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                              isTakeover
                                ? 'bg-emerald-50/50 dark:bg-slate-800/80 border-emerald-200 dark:border-slate-700'
                                : isAlert
                                ? 'bg-rose-50/40 dark:bg-slate-800/80 border-rose-200 dark:border-slate-700'
                                : isWean
                                ? 'bg-cyan-50/40 dark:bg-slate-800/80 border-cyan-200 dark:border-slate-700'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                                  {entry.doctorName}
                                </span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                    isTakeover
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                                      : isAlert
                                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300'
                                      : isWean
                                      ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border-cyan-300'
                                      : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border-teal-300'
                                  }`}
                                >
                                  {entry.updateType.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {entry.date}
                              </span>
                            </div>

                            <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                              {entry.note}
                            </p>

                            {entry.revisedRecommendation && (
                              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-xs">
                                <strong className="text-teal-800 dark:text-teal-300 font-mono text-[11px] uppercase block mb-0.5">
                                  Revised Action Plan / Directives:
                                </strong>
                                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                  {entry.revisedRecommendation}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <ShieldCheck className="w-3.5 h-3.5" /> Directives Synchronized • Verified Signature
                              </span>
                              <span>Update ID: {entry.id}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Collapsible Bedside Nursing Log for Doctor's Reference */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNursingHistoryForDoctor(prev => !prev)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      Bedside Nursing Shift Handover Log ({selectedPatient.nursingNotesHistory?.length || 0} entries)
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-teal-600">
                      {showNursingHistoryForDoctor ? 'Hide Bedside Log' : 'View Bedside Nurse Notes'}
                      {showNursingHistoryForDoctor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {showNursingHistoryForDoctor && (
                    <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar p-2 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                      {!selectedPatient.nursingNotesHistory || selectedPatient.nursingNotesHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 font-mono text-center py-2">
                          No bedside nursing notes found for this patient.
                        </p>
                      ) : (
                        selectedPatient.nursingNotesHistory.map(n => (
                          <div key={n.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">{n.nurseName} ({n.shift})</span>
                              <span className="text-slate-400">{n.date}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{n.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* NURSE DASHBOARD: Add Update Field & Chronological History */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <HeartPulse className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Nurse Shift Handover Notes & Care Transition
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Outgoing Nurse ({outgoingNurse}) ➔ Incoming Nurse ({incomingNurse})
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                  Bedside Continuity of Care
                </span>
              </div>

              {/* Notification on note added */}
              {nurseHandoverSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Nursing shift handover note posted successfully! The incoming nurse will see this recommendation immediately.
                  </span>
                </div>
              )}

              {/* Form to add new nursing handover notes */}
              <form onSubmit={handleAddNurseHandover} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Add New Nursing Shift Handover Remark
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Recorded by: {outgoingNurse}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shift Selection *
                    </label>
                    <select
                      value={newNurseShift}
                      onChange={e => setNewNurseShift(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Morning Shift (07:00 - 15:00)">Morning Shift (07:00 - 15:00)</option>
                      <option value="Evening Shift (15:00 - 23:00)">Evening Shift (15:00 - 23:00)</option>
                      <option value="Night Shift (23:00 - 07:00)">Night Shift (23:00 - 07:00)</option>
                      <option value="Shift Change Transition">Shift Change Transition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Special Attention / Urgent Flag for Incoming Nurse (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Check ABG at 16:30; Turn lateral at 17:00; Doctor round at 18:00"
                      value={nurseSpecialAlert}
                      onChange={e => setNurseSpecialAlert(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bedside Progress & Care Instructions for Incoming Nurse *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={nurseHandoverNotes}
                    onChange={e => setNurseHandoverNotes(e.target.value)}
                    placeholder="Record patient telemetry trends, fluid balance, catheter/line care, suctioning done, medication administration, pending investigations, and handover instructions..."
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    * Records are permanent and appended to the patient care timeline without delete permissions.
                  </span>
                  <button
                    type="submit"
                    disabled={!nurseHandoverNotes.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>+ Record Nursing Handover Update</span>
                  </button>
                </div>
              </form>

              {/* Chronological Nursing Handover History */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                    <History className="w-4 h-4 text-emerald-600" />
                    Previous Nursing Shift Recommendations & Updates ({selectedPatient.nursingNotesHistory?.length || 0})
                  </h4>
                  <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                    🔒 Immutable Audit Trail • Read-Only
                  </span>
                </div>

                {!selectedPatient.nursingNotesHistory || selectedPatient.nursingNotesHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No nursing handover records logged yet for {selectedPatient.name}. Enter notes above to record shift transition.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {selectedPatient.nursingNotesHistory.map(entry => (
                      <div
                        key={entry.id}
                        className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 text-xs space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-900 dark:text-emerald-300">
                              {entry.nurseName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800">
                              {entry.shift}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {entry.date}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                          {entry.note}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Handover Verified
                          </span>
                          <span>Entry ID: {entry.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Past Signed Shift Handovers History */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              Signed Electronic Shift Handover Records for {selectedPatient.name}
            </h3>

            {pastHandovers.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4 text-center">
                No signed handover records found for this patient yet. Sign off a handover above to create an entry.
              </p>
            ) : (
              <div className="space-y-3">
                {pastHandovers.map(h => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-teal-700 dark:text-teal-400">{h.id}</span>
                      <span className="text-slate-500">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Outgoing: {h.previousDoctorName} / {h.previousNurseName} ➔ Incoming: {h.newDoctorName} / {h.newNurseName}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {h.handoverSummary}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Electronic Signature Verified • {h.recentVitalsSummary}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Shift Sign-Off Confirmation */}
      {showSignOffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 font-sans">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isNurseDashboard ? 'Nurse Handover Digital Sign-Off' : 'Doctor Shift Handover Digital Sign-Off'}
                </h3>
                <p className="text-xs text-slate-500">Authorized clinician signature verification</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p>
                <strong>Patient:</strong> {selectedPatient.name} (Bed {selectedPatient.bedNumber})
              </p>
              {isDoctorDashboard ? (
                <>
                  <p>
                    <strong>Outgoing Doctor:</strong> {outgoingDoctor}
                  </p>
                  <p>
                    <strong>Incoming Doctor:</strong> {incomingDoctor}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Outgoing Nurse:</strong> {outgoingNurse}
                  </p>
                  <p>
                    <strong>Incoming Nurse:</strong> {incomingNurse}
                  </p>
                  <p>
                    <strong>Shift:</strong> {newNurseShift}
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleConfirmSignOff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enter Clinician Verification PIN (4-Digits) *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={signOffPIN}
                  onChange={e => {
                    setSignOffPIN(e.target.value);
                    setPinError('');
                  }}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-center font-mono font-bold text-lg tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
                {pinError && <p className="text-xs text-rose-600 font-mono mt-1">{pinError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignOffModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Sign-Off</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHandoverPage;
