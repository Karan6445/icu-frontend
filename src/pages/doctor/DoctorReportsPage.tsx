import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Activity, 
  HeartPulse, 
  Clock, 
  ShieldCheck, 
  Copy, 
  RefreshCw, 
  Calendar, 
  Filter, 
  Search, 
  Share2, 
  Bed, 
  FileSpreadsheet, 
  Sparkles,
  ChevronRight,
  Stethoscope
} from 'lucide-react';

export interface GeneratedReport {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  unitName: string;
  reportType: string;
  generatedAt: string;
  doctorName: string;
  status: 'Finalized' | 'Draft';
  fileSize: string;
}

export const DoctorReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId');

  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);

  // Filter patients assigned to this doctor ("patient jo iske under aaye")
  const doctorPatients = patients.filter(p =>
    (currentUser.name && p.assignedClinician.toLowerCase().includes(currentUser.name.toLowerCase())) ||
    p.assignedClinician.toLowerCase().includes('ananya') ||
    p.assignedClinician.toLowerCase().includes('sen') ||
    p.assignedClinician.toLowerCase().includes('dr.')
  );

  const assignedPatients = doctorPatients.length > 0 ? doctorPatients : patients.slice(0, 5);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId && assignedPatients.some(p => p.id === initialPatientId)
      ? initialPatientId
      : (assignedPatients[0]?.id || 'P-1024')
  );

  const selectedPatient = assignedPatients.find(p => p.id === selectedPatientId) || assignedPatients[0];

  const [reportType, setReportType] = useState<string>('Full ICU Clinical Summary & Daily Progress');
  const [timeframe, setTimeframe] = useState<string>('Last 24 Hours (Current Shift)');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeVentilator, setIncludeVentilator] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  
  const [doctorImpression, setDoctorImpression] = useState<string>(
    'Patient remains critically stable on low-dose inotropic support. Organ perfusion parameters maintained within target thresholds. Continue current lung-protective ventilation protocol, enteral nutrition, and strict glycemic monitoring. Plan to wean sedation for neuro assessment in next morning round.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');

  // Simulated generated reports list for this doctor's patients
  const [pastReports, setPastReports] = useState<GeneratedReport[]>([
    {
      id: 'REP-ICU-8821',
      patientId: assignedPatients[0]?.id || 'P-1024',
      patientName: assignedPatients[0]?.name || 'Rahul Sharma',
      bedNumber: assignedPatients[0]?.bedNumber || 'Bed-04',
      unitName: assignedPatients[0]?.unitName || 'MICU Tier-1',
      reportType: 'Full ICU Clinical Summary & Daily Progress',
      generatedAt: '2026-09-22 18:30',
      doctorName: currentUser.name,
      status: 'Finalized',
      fileSize: '1.4 MB'
    },
    {
      id: 'REP-ICU-8794',
      patientId: assignedPatients[1]?.id || 'P-1025',
      patientName: assignedPatients[1]?.name || 'Sunita Devi',
      bedNumber: assignedPatients[1]?.bedNumber || 'Bed-02',
      unitName: assignedPatients[1]?.unitName || 'SICU Central',
      reportType: 'SOFA Multi-Organ Dysfunction Trajectory Report',
      generatedAt: '2026-09-21 09:15',
      doctorName: currentUser.name,
      status: 'Finalized',
      fileSize: '1.8 MB'
    }
  ]);

  // If initialPatientId changes in query param
  useEffect(() => {
    if (initialPatientId && assignedPatients.some(p => p.id === initialPatientId)) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId, assignedPatients]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);

      const newRep: GeneratedReport = {
        id: `REP-ICU-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        bedNumber: selectedPatient.bedNumber,
        unitName: selectedPatient.unitName,
        reportType: reportType,
        generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        doctorName: currentUser.name,
        status: 'Finalized',
        fileSize: '1.6 MB'
      };
      setPastReports(prev => [newRep, ...prev]);

      // Scroll smoothly to report preview
      setTimeout(() => {
        document.getElementById('report-document-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (!selectedPatient) return;
    const text = `
======================================================
NAIMIFY ADVANCED ICU & CRITICAL CARE NETWORK
OFFICIAL PATIENT CLINICAL REPORT (${reportType})
======================================================
Patient: ${selectedPatient.name} (${selectedPatient.id} / ${selectedPatient.mrn})
Bed: ${selectedPatient.bedNumber} | Unit: ${selectedPatient.unitName}
Age/Gender: ${selectedPatient.age} Yrs / ${selectedPatient.gender} | Blood: ${selectedPatient.bloodGroup}
Admitting Diagnosis: ${selectedPatient.admittingDiagnosis}
Attending Intensivist: ${currentUser.name} (${currentUser.department})
Generated Date: ${new Date().toLocaleString()}

CURRENT VITALS:
- HR: ${selectedPatient.vitals.hr} bpm
- BP: ${selectedPatient.vitals.bpSystolic}/${selectedPatient.vitals.bpDiastolic} mmHg (MAP: ${selectedPatient.vitals.map})
- SpO2: ${selectedPatient.vitals.spo2}%
- RR: ${selectedPatient.vitals.rr} /min | Temp: ${selectedPatient.vitals.temp}°F

VENTILATOR MECHANICS:
- Mode: ${selectedPatient.ventilator?.mode || 'SIMV-PC'} | FiO2: ${selectedPatient.ventilator?.fio2 || 40}% | PEEP: ${selectedPatient.ventilator?.peep || 6} cmH2O

DOCTOR CLINICAL IMPRESSION:
${doctorImpression}

Electronically verified & signed by Dr. ${currentUser.name}
======================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleDownload = () => {
    if (!selectedPatient) return;
    const reportText = `
NAIMIFY ADVANCED ICU HEALTH NETWORK
FORMAL CLINICAL INTENSIVIST REPORT
------------------------------------------------------
Report Ref: REP-ICU-${selectedPatient.id}-${Date.now().toString().slice(-4)}
Patient Name: ${selectedPatient.name}
Patient ID: ${selectedPatient.id}
MRN: ${selectedPatient.mrn}
Unit / Bed: ${selectedPatient.unitName} - ${selectedPatient.bedNumber}
Admitting Diagnosis: ${selectedPatient.admittingDiagnosis}
Attending Doctor: ${currentUser.name}
Generated At: ${new Date().toLocaleString()}

Clinical Impression:
${doctorImpression}
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedPatient.id}_Clinical_Report_${selectedPatient.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pb-16 font-sans selection:bg-teal-500 selection:text-white">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
              DOCTOR CLINICAL WORKSTATION
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-bold rounded-full">
              {assignedPatients.length} Assigned Patients Under Care
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Generate Patient Clinical Report</h1>
          <p className="text-xs text-slate-500">
            Generate, compile, preview, download, and print official ICU clinical reports for patients admitted under your care.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Report Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Generated History ({pastReports.length})</span>
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Report summary copied to clipboard successfully!</span>
        </div>
      )}

      {/* GENERATOR TAB */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Patient Quick Selector Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 print:hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Patients Under Your Care ({assignedPatients.length}) - Select Patient to Generate Report</span>
              </h3>
              <Link to="/doctor/patients" className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1">
                <span>View All Assigned</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {assignedPatients.map(p => {
                const isSelected = p.id === selectedPatientId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setReportGenerated(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 truncate block">{p.name}</span>
                      <span className={`w-2 h-2 rounded-full ${p.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="text-[11px] font-mono text-[#0F766E] font-bold mt-1">
                      {p.bedNumber} · {p.id}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {p.admittingDiagnosis}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Configuration Card */}
          <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 print:hidden">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Report Parameters for {selectedPatient?.name} ({selectedPatient?.id})
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Unit: {selectedPatient?.unitName} · Bed: {selectedPatient?.bedNumber} · MRN: {selectedPatient?.mrn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                  selectedPatient?.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Acuity: {selectedPatient?.status}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  HR: {selectedPatient?.vitals.hr} bpm | SpO2: {selectedPatient?.vitals.spo2}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-medium">
              {/* Report Type */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Clinical Report Format *</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="Full ICU Clinical Summary & Daily Progress">Full ICU Clinical Summary & Daily Progress</option>
                  <option value="Critical Care Discharge / Transfer Summary">Critical Care Discharge / Transfer Summary</option>
                  <option value="SOFA Multi-Organ Dysfunction Trajectory Report">SOFA Multi-Organ Dysfunction Trajectory Report</option>
                  <option value="Hemodynamic & Ventilator Telemetry Report">Hemodynamic & Ventilator Telemetry Report</option>
                  <option value="Morning Intensivist Round Assessment">Morning Intensivist Round Assessment</option>
                </select>
              </div>

              {/* Timeframe */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Clinical Trajectory Timeframe *</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="Last 24 Hours (Current Shift)">Last 24 Hours (Current Shift)</option>
                  <option value="Last 48 Hours">Last 48 Hours</option>
                  <option value="Last 7 Days (Weekly Review)">Last 7 Days (Weekly Review)</option>
                  <option value="Entire ICU Admission Episode">Entire ICU Admission Episode</option>
                </select>
              </div>
            </div>

            {/* Checklist of sections */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold text-xs">Included Report Modules & Data Points</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={includeVitals}
                    onChange={(e) => setIncludeVitals(e.target.checked)}
                    className="accent-[#0F766E] w-4 h-4 rounded"
                  />
                  <span>Vital Signs & MAP</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={includeVentilator}
                    onChange={(e) => setIncludeVentilator(e.target.checked)}
                    className="accent-[#0F766E] w-4 h-4 rounded"
                  />
                  <span>Ventilator Mechanics</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    className="accent-[#0F766E] w-4 h-4 rounded"
                  />
                  <span>Clinical Round Notes</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={includeMeds}
                    onChange={(e) => setIncludeMeds(e.target.checked)}
                    className="accent-[#0F766E] w-4 h-4 rounded"
                  />
                  <span>Infusion & Meds</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={includeLabs}
                    onChange={(e) => setIncludeLabs(e.target.checked)}
                    className="accent-[#0F766E] w-4 h-4 rounded"
                  />
                  <span>Diagnostic / ABG Labs</span>
                </label>
              </div>
            </div>

            {/* Doctor's Custom Clinical Impression & Plan */}
            <div className="space-y-1.5 text-xs font-medium">
              <label className="block text-slate-700 font-bold">
                Attending Intensivist Clinical Impression & Care Orders (Editable for Report)
              </label>
              <textarea
                rows={3}
                value={doctorImpression}
                onChange={(e) => setDoctorImpression(e.target.value)}
                placeholder="Enter doctor's formal impression, recommendations, weaning plan, or discharge instructions..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            {/* Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by Dr. {currentUser.name} · Critical Care Reg ID: MCI-2018-99412</span>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling Patient Data & Generating...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Generate Patient Report Now</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* GENERATED REPORT DOCUMENT PREVIEW */}
          {(reportGenerated || true) && selectedPatient && (
            <div id="report-document-view" className="space-y-4">
              {/* Document Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">
                    Official Clinical Document Ready for {selectedPatient.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    (Ref: REP-ICU-{selectedPatient.id}-{new Date().getFullYear()})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT / Export</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Formal Medical Report</span>
                  </button>
                </div>
              </div>

              {/* FORMAL PRINTABLE REPORT PAPER */}
              <div className="bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-md space-y-6 text-slate-900 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
                {/* Hospital Letterhead Header */}
                <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-black text-lg">
                        +
                      </div>
                      <span className="text-xl font-black tracking-tight text-slate-900">
                        NAIMIFY HEALTH NETWORK · CRITICAL CARE
                      </span>
                    </div>
                    <p className="text-[11px] font-mono font-semibold text-slate-600">
                      State Level Tertiary Care & Tele-ICU Center of Excellence
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Patna Central Command · NABH & JCI Accredited Intensive Care Unit
                    </p>
                  </div>

                  <div className="text-right space-y-1 font-mono text-[11px]">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold rounded text-[10px] uppercase tracking-wider">
                      CONFIDENTIAL MEDICAL RECORD
                    </div>
                    <div className="text-slate-600"><span className="font-bold">Report ID:</span> REP-ICU-{selectedPatient.id}-{new Date().getFullYear()}</div>
                    <div className="text-slate-600"><span className="font-bold">Generated:</span> {new Date().toLocaleString()}</div>
                    <div className="text-slate-600"><span className="font-bold">Attending Intensivist:</span> Dr. {currentUser.name}</div>
                  </div>
                </div>

                {/* Report Title */}
                <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                    {reportType}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 font-semibold">
                    Reporting Window: {timeframe}
                  </p>
                </div>

                {/* Patient Information Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Patient Name</span>
                    <span className="font-black text-slate-900 text-sm">{selectedPatient.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Patient ID / MRN</span>
                    <span className="font-bold text-slate-800">{selectedPatient.id} · {selectedPatient.mrn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Age / Gender / Blood</span>
                    <span className="font-bold text-slate-800">{selectedPatient.age} Yrs / {selectedPatient.gender} / {selectedPatient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">ICU Bed & Unit</span>
                    <span className="font-black text-[#0F766E]">{selectedPatient.bedNumber} ({selectedPatient.unitName})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Admission Date</span>
                    <span className="font-bold text-slate-800">{selectedPatient.admissionTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Acuity Status</span>
                    <span className="font-bold text-rose-700">{selectedPatient.status}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Primary Admitting Diagnosis</span>
                    <span className="font-black text-slate-900">{selectedPatient.admittingDiagnosis}</span>
                  </div>
                </div>

                {/* Section 1: Vital Signs & Organ Telemetry */}
                {includeVitals && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#0F766E]" />
                      <span>1. Vital Signs & Organ Hemodynamics Snapshot</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left font-mono border border-slate-200 rounded-lg">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2 border-r border-slate-200">Parameter</th>
                            <th className="p-2 border-r border-slate-200">Observed Value</th>
                            <th className="p-2 border-r border-slate-200">Standard Target</th>
                            <th className="p-2">Clinical Trajectory</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          <tr>
                            <td className="p-2 font-bold border-r border-slate-200">Heart Rate (ECG)</td>
                            <td className="p-2 font-black text-[#0F766E] border-r border-slate-200">{selectedPatient.vitals.hr} bpm</td>
                            <td className="p-2 text-slate-500 border-r border-slate-200">60 - 100 bpm</td>
                            <td className="p-2 font-bold text-emerald-700">Sinus rhythm, stable</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold border-r border-slate-200">Blood Pressure / MAP</td>
                            <td className="p-2 font-black border-r border-slate-200">
                              {selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic} mmHg (MAP {selectedPatient.vitals.map})
                            </td>
                            <td className="p-2 text-slate-500 border-r border-slate-200">MAP &gt; 65 mmHg</td>
                            <td className="p-2 font-bold text-emerald-700">Adequate organ perfusion</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold border-r border-slate-200">SpO2 (Pulse Oximetry)</td>
                            <td className="p-2 font-black text-[#0F766E] border-r border-slate-200">{selectedPatient.vitals.spo2}%</td>
                            <td className="p-2 text-slate-500 border-r border-slate-200">94 - 100%</td>
                            <td className="p-2 font-bold text-emerald-700">Normoxemic on mechanical support</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold border-r border-slate-200">Respiratory Rate</td>
                            <td className="p-2 font-bold border-r border-slate-200">{selectedPatient.vitals.rr} /min</td>
                            <td className="p-2 text-slate-500 border-r border-slate-200">12 - 20 /min</td>
                            <td className="p-2 font-bold text-slate-700">Eupneic, ventilator synchronized</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold border-r border-slate-200">Core Body Temperature</td>
                            <td className="p-2 font-bold border-r border-slate-200">{selectedPatient.vitals.temp}°F</td>
                            <td className="p-2 text-slate-500 border-r border-slate-200">97.8 - 99.1°F</td>
                            <td className="p-2 font-bold text-slate-700">Normothermic</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 2: Ventilator Mechanics */}
                {includeVentilator && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-[#0F766E]" />
                      <span>2. Respiratory & Invasive Mechanical Ventilation</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Ventilator Mode</span>
                        <span className="font-bold text-slate-900">{selectedPatient.ventilator?.mode || 'SIMV-PC'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Delivered FiO2</span>
                        <span className="font-bold text-[#0F766E]">{selectedPatient.ventilator?.fio2 || 40}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">PEEP Level</span>
                        <span className="font-bold text-slate-900">{selectedPatient.ventilator?.peep || 6} cmH2O</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Tidal Volume (Vt)</span>
                        <span className="font-bold text-slate-900">{selectedPatient.ventilator?.tidalVolume || 440} mL</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Peak Insp. Pressure</span>
                        <span className="font-bold text-slate-900">{selectedPatient.ventilator?.pPeak || 22} cmH2O</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Clinical Round Observations History */}
                {includeNotes && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      <span>3. Intensivist Clinical Round Observations</span>
                    </h3>
                    {selectedPatient.clinicalNotesHistory && selectedPatient.clinicalNotesHistory.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.clinicalNotesHistory.map((note) => (
                          <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono space-y-1">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span className="font-bold text-[#0F766E]">{note.doctorName}</span>
                              <span>{note.date}</span>
                            </div>
                            <div className="text-slate-800">{note.note}</div>
                            {note.remark && (
                              <div className="text-slate-600 text-[11px] italic">
                                <span className="font-bold">Directive:</span> {note.remark}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
                        Patient evaluated during multidisciplinary morning ICU round. Airway clear, bilateral vesicular breath sounds present. Abdomen soft, non-distended. Urine output adequate (&gt; 0.7 mL/kg/h).
                      </div>
                    )}
                  </div>
                )}

                {/* Section 4: Current ICU Medication & Infusion Schedule */}
                {includeMeds && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                      <span>4. Active ICU Medications & Inotropic Support</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Continuous Infusions</span>
                        <div className="text-slate-800">1. Inj. Norepinephrine 0.06 mcg/kg/min (Titrated for MAP &gt; 65)</div>
                        <div className="text-slate-800">2. Inj. Fentanyl 50 mcg/hr IV Infusion (Sedation/Analgesia)</div>
                        <div className="text-slate-800">3. Isotonic Normal Saline (0.9%) @ 75 mL/hr</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Scheduled Medications</span>
                        <div className="text-slate-800">1. Inj. Meropenem 1g IV TID (Day 4/7)</div>
                        <div className="text-slate-800">2. Inj. Pantoprazole 40mg IV OD (Stress Ulcer Prophylaxis)</div>
                        <div className="text-slate-800">3. Inj. Enoxaparin 40mg SC OD (VTE Prophylaxis)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 5: Doctor Impression & Actionable Plan */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>5. Attending Intensivist Clinical Impression & Care Orders</span>
                  </h3>
                  <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl text-xs font-mono text-slate-900 leading-relaxed">
                    {doctorImpression}
                  </div>
                </div>

                {/* Formal Doctor Sign-off & Digital Stamp */}
                <div className="pt-6 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="font-bold text-slate-900">Hospital Medical Records Division</div>
                    <div className="text-slate-500">Form: NAIM-ICU-CR-01 · Rev: 2026.4</div>
                    <div className="text-slate-400 text-[10px]">
                      Electronic Document ID: SHA256:{Math.random().toString(36).substring(2, 12).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-4 border border-teal-600 bg-teal-50/80 rounded-xl text-center font-mono space-y-1 min-w-[260px]">
                    <div className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">
                      ★ Electronically Verified & Signed ★
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      Dr. {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-700">
                      {currentUser.specialty || 'Lead Critical Care Intensivist'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Reg No: MCI-2018-99412 · Patna Medical Council
                    </div>
                    <div className="text-[9px] text-teal-700 font-bold pt-1">
                      Certified on: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Generated Patient Reports Archive
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Log of clinical reports generated by Dr. {currentUser.name} for assigned ICU patients.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0F766E] bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              {pastReports.length} Reports
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Unit / Bed</th>
                  <th className="p-3">Report Format</th>
                  <th className="p-3">Generated Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      <span>{rep.id}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{rep.patientName} ({rep.patientId})</td>
                    <td className="p-3 text-slate-600">{rep.unitName} · {rep.bedNumber}</td>
                    <td className="p-3 text-slate-700">{rep.reportType}</td>
                    <td className="p-3 text-slate-500">{rep.generatedAt}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rep.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatientId(rep.patientId);
                            setReportType(rep.reportType);
                            setActiveTab('generator');
                            setReportGenerated(true);
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 rounded-lg text-[11px] font-bold"
                        >
                          View / Print
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
    </div>
  );
};

export default DoctorReportsPage;
