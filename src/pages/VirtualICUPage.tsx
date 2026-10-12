import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  PhoneCall, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  UserCheck, 
  Signal, 
  Building2, 
  Bed, 
  HeartPulse, 
  Mic, 
  MicOff, 
  VideoOff, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  X, 
  Sparkles, 
  Clock, 
  AlertOctagon,
  ExternalLink,
  Settings,
  ChevronUp,
  ChevronDown,
  ChevronLeft as ArrowLeft,
  Sliders
} from 'lucide-react';
import { MOCK_PATIENTS } from '../data/mockData';
import { PtzCameraConfigModal } from '../components/camera/PtzCameraConfigModal';

export interface HospitalFacility {
  id: string;
  name: string;
  location: string;
  totalBeds: number;
  occupancyPercent: number;
  ventilatedCount: number;
  highAcuityCount: number;
  criticalAlarmsCount: number;
  leadIntensivist: string;
}

export const HOSPITALS: HospitalFacility[] = [
  {
    id: 'HOSP-01',
    name: 'AIIMS Patna & Critical Care Center',
    location: 'Patna Central Unit',
    totalBeds: 15,
    occupancyPercent: 86,
    ventilatedCount: 5,
    highAcuityCount: 3,
    criticalAlarmsCount: 1,
    leadIntensivist: 'Dr. Rahul Sharma'
  },
  {
    id: 'HOSP-02',
    name: 'PMCH Patna Critical Care',
    location: 'Gaya Regional Unit',
    totalBeds: 14,
    occupancyPercent: 78,
    ventilatedCount: 4,
    highAcuityCount: 2,
    criticalAlarmsCount: 1,
    leadIntensivist: 'Dr. Amit Kumar'
  },
  {
    id: 'HOSP-03',
    name: 'IGIMS Patna Trauma Center',
    location: 'Muzaffarpur Unit',
    totalBeds: 12,
    occupancyPercent: 83,
    ventilatedCount: 4,
    highAcuityCount: 2,
    criticalAlarmsCount: 1,
    leadIntensivist: 'Dr. Ananya Roy'
  },
  {
    id: 'HOSP-04',
    name: 'Paras HMRI Critical Care',
    location: 'Patna Cardiac Hub',
    totalBeds: 10,
    occupancyPercent: 70,
    ventilatedCount: 2,
    highAcuityCount: 1,
    criticalAlarmsCount: 0,
    leadIntensivist: 'Dr. Sunita Patel'
  }
];

export interface TelePatientFeed {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  bedNumber: string;
  acuity: 'CRITICAL' | 'WARNING' | 'STABLE';
  hr: number;
  spo2: number;
  bp: string;
  map: number;
  ventMode?: string;
  fio2?: number;
  cameraStatus: 'LIVE 4K PTZ' | 'CONNECTING' | 'OFFLINE';
}

export const TELE_PATIENTS: TelePatientFeed[] = [
  {
    id: 'TELE-101',
    patientId: 'P-1024',
    patientName: 'Ramesh Gupta',
    hospitalId: 'HOSP-01',
    hospitalName: 'Central Super-Specialty Hospital',
    bedNumber: 'ICU-04',
    acuity: 'CRITICAL',
    hr: 114,
    spo2: 89,
    bp: '102/64',
    map: 76,
    ventMode: 'Servo-u (PRVC)',
    fio2: 50,
    cameraStatus: 'LIVE 4K PTZ'
  },
  {
    id: 'TELE-102',
    patientId: 'P-1025',
    patientName: 'Sunita Saxena',
    hospitalId: 'HOSP-01',
    hospitalName: 'Central Super-Specialty Hospital',
    bedNumber: 'ICU-01',
    acuity: 'WARNING',
    hr: 94,
    spo2: 95,
    bp: '142/88',
    map: 106,
    ventMode: 'Hamilton C6 (VC-AC)',
    fio2: 40,
    cameraStatus: 'LIVE 4K PTZ'
  },
  {
    id: 'TELE-103',
    patientId: 'P-1034',
    patientName: 'Balwant Reddy',
    hospitalId: 'HOSP-02',
    hospitalName: 'Metro Critical Care Hospital',
    bedNumber: 'ICU-11',
    acuity: 'CRITICAL',
    hr: 122,
    spo2: 92,
    bp: '88/54',
    map: 65,
    ventMode: 'Draeger (SIMV)',
    fio2: 60,
    cameraStatus: 'LIVE 4K PTZ'
  },
  {
    id: 'TELE-104',
    patientId: 'P-1028',
    patientName: 'Kavita Menon',
    hospitalId: 'HOSP-03',
    hospitalName: 'Regional Trauma Center',
    bedNumber: 'ICU-05',
    acuity: 'STABLE',
    hr: 76,
    spo2: 98,
    bp: '118/76',
    map: 90,
    cameraStatus: 'LIVE 4K PTZ'
  }
];

export const VirtualICUPage: React.FC = () => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('ALL');
  const [activeConsultPatient, setActiveConsultPatient] = useState<TelePatientFeed | null>(null);

  // Video Consult Control States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [consultNotes, setConsultNotes] = useState('');
  const [isPtzConfigOpen, setIsPtzConfigOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<'Airway' | 'Ventilator' | 'Infusion' | 'Overview'>('Overview');
  const [ptzPanTilt, setPtzPanTilt] = useState({ pan: 0, tilt: 0 });

  const filteredHospitals = selectedHospitalId === 'ALL'
    ? HOSPITALS
    : HOSPITALS.filter(h => h.id === selectedHospitalId);

  const filteredPatients = selectedHospitalId === 'ALL'
    ? TELE_PATIENTS
    : TELE_PATIENTS.filter(p => p.hospitalId === selectedHospitalId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Tele-ICU Command Center Header */}
      <div className="bg-gradient-to-r from-[#0F766E] via-[#0D655E] to-[#047857] text-white p-6 rounded-3xl border border-teal-700 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            TELE-ICU MULTI-SITE COMMAND CENTER • LIVE MONITORING
          </div>
          <h1 className="text-2xl font-black tracking-tight font-sans text-white">
            Virtual ICU Remote Intensivist Workstation
          </h1>
          <p className="text-teal-100 text-xs max-w-2xl leading-relaxed">
            Bi-directional remote consultation, real-time multisite patient triage, live video rounds, and audio handoff
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveConsultPatient(TELE_PATIENTS[0])}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-[#0F766E] font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Launch Tele-Consult</span>
          </button>
        </div>
      </div>

      {/* MULTI HOSPITAL VIEW TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setSelectedHospitalId('ALL')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            selectedHospitalId === 'ALL'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-400" />
          <span>All Multisite Hospitals (4)</span>
        </button>

        {HOSPITALS.map((hosp) => (
          <button
            key={hosp.id}
            onClick={() => setSelectedHospitalId(hosp.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedHospitalId === hosp.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{hosp.name}</span>
          </button>
        ))}
      </div>

      {/* ICU SUMMARY CARDS (PER HOSPITAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                  {hosp.id}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Signal className="w-3 h-3 text-emerald-500 animate-pulse" />
                  FEED LIVE
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans leading-snug">
                {hosp.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">{hosp.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">Beds / Occ:</span>
                <span className="font-bold text-slate-900 dark:text-white">{hosp.totalBeds} ({hosp.occupancyPercent}%)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">Ventilated:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{hosp.ventilatedCount} Patients</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">High Acuity:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{hosp.highAcuityCount} Patients</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">Alarms:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{hosp.criticalAlarmsCount} Active</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1">
              Lead Intensivist: <span className="font-bold text-slate-700 dark:text-slate-300">{hosp.leadIntensivist}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LIVE PATIENT FEED (GRID OF TELEMETRY MONITORS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-500 animate-pulse" />
            <span>Live Multisite Telemetry & Video Patient Feeds</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {filteredPatients.length} Active Telemetry Channels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.map((tp) => (
            <div
              key={tp.id}
              className={`p-6 rounded-3xl border shadow-sm dark:shadow-xl transition-all space-y-4 ${
                tp.acuity === 'CRITICAL'
                  ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-500/60 ring-2 ring-rose-100 dark:ring-rose-500/30'
                  : tp.acuity === 'WARNING'
                  ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-500/60 ring-2 ring-amber-100 dark:ring-amber-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
                    Bed {tp.bedNumber}
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                    tp.acuity === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' : tp.acuity === 'WARNING' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {tp.acuity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  <Signal className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-ping" />
                  <span>{tp.cameraStatus}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">{tp.patientName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{tp.hospitalName}</p>
              </div>

              {/* Animated ECG Waveform Simulation Bar */}
              <div className="h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 relative overflow-hidden flex items-center justify-between">
                <div className="absolute inset-0 flex items-center justify-center opacity-40 dark:opacity-30">
                  <svg className="w-full h-12 stroke-teal-600 dark:stroke-teal-400 fill-none" strokeWidth="2">
                    <path d="M 0 25 L 30 25 L 40 10 L 50 40 L 60 5 L 70 35 L 80 25 L 120 25 L 130 10 L 140 40 L 150 5 L 160 35 L 170 25 L 300 25" />
                  </svg>
                </div>
                <div className="relative z-10 flex justify-between items-center w-full px-2 text-xs font-mono">
                  <span className="text-teal-700 dark:text-teal-400 font-bold">ECG Lead II</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">HR: {tp.hr} bpm</span>
                </div>
              </div>

              {/* Live Vitals Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-bold">HR</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{tp.hr}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-bold">SpO2</span>
                  <span className={`text-base font-extrabold ${tp.spo2 < 92 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-cyan-700 dark:text-cyan-400'}`}>{tp.spo2}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-bold">NIBP</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">{tp.bp}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-bold">MAP</span>
                  <span className={`text-base font-extrabold ${tp.map < 65 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-600 dark:text-amber-400'}`}>{tp.map}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <Link
                  to={`/patient/${tp.patientId}`}
                  className="text-xs font-bold text-[#0F766E] dark:text-teal-400 hover:underline flex items-center gap-1 font-sans"
                >
                  <span>Open Full Patient Monitor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setActiveConsultPatient(tp)}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch Tele-Consult</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIDEO CONSULTATION HUB MODAL / PANEL */}
      {activeConsultPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans flex items-center gap-2">
                    <span>Tele-ICU Video Consultation: {activeConsultPatient.patientName}</span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-400/30 font-bold">
                      Bed {activeConsultPatient.bedNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Facility: {activeConsultPatient.hospitalName} • 4K Low-Latency Stream Active
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveConsultPatient(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Streams Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Stream: Bedside Camera */}
              <div className="md:col-span-2 h-72 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                <div className="flex justify-between items-center z-10 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-teal-400 border border-slate-800">
                    Bedside PTZ Camera (Zoom: {zoomLevel}x)
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-bold animate-pulse">
                    REC • 00:06:42
                  </span>
                </div>

                {!isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950">
                    <div className="text-center space-y-2">
                      <Video className="w-12 h-12 text-teal-500 mx-auto animate-pulse" />
                      <div className="text-xs font-mono text-slate-300">
                        [ Bedside HD Camera Stream Active — Patient: {activeConsultPatient.patientName} ]
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs">
                    [ Bedside Camera Video Muted ]
                  </div>
                )}

                {/* PTZ Zoom & Directional Controls Overlay */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 1, 5))}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
                      <span>Zoom In ({zoomLevel}x)</span>
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Zoom Out</span>
                    </button>
                  </div>

                  {/* PTZ Presets Bar */}
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <button
                      onClick={() => setActivePreset('Airway')}
                      className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        activePreset === 'Airway' ? 'bg-teal-500 text-slate-950 font-bold border-teal-400' : 'bg-slate-900/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      Preset 1: Airway
                    </button>
                    <button
                      onClick={() => setActivePreset('Ventilator')}
                      className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        activePreset === 'Ventilator' ? 'bg-teal-500 text-slate-950 font-bold border-teal-400' : 'bg-slate-900/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      Preset 2: Vent
                    </button>
                    <button
                      onClick={() => setActivePreset('Infusion')}
                      className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        activePreset === 'Infusion' ? 'bg-teal-500 text-slate-950 font-bold border-teal-400' : 'bg-slate-900/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      Preset 3: Infusion
                    </button>
                    <button
                      onClick={() => setIsPtzConfigOpen(true)}
                      className="p-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 cursor-pointer"
                      title="Configure PTZ Camera & Presets"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Stream: Intensivist Camera & Telemetry Sidebar */}
              <div className="space-y-3">
                <div className="h-32 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex items-center justify-center text-xs font-mono text-slate-600 dark:text-slate-400 p-3 text-center shadow-2xs">
                  <div>
                    <UserCheck className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
                    <span className="font-bold text-slate-900 dark:text-slate-200">Dr. Admin (Remote Intensivist)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono shadow-2xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Live Stream Telemetry:</div>
                  <div className="flex justify-between">
                    <span>HR: <strong className="text-emerald-700 dark:text-emerald-400">{activeConsultPatient.hr} bpm</strong></span>
                    <span>SpO2: <strong className="text-cyan-700 dark:text-cyan-400">{activeConsultPatient.spo2}%</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>MAP: <strong className="text-amber-700 dark:text-amber-400">{activeConsultPatient.map} mmHg</strong></span>
                    <span>BP: <strong className="text-slate-900 dark:text-white">{activeConsultPatient.bp}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Note Entry */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                Remote Intensivist Tele-Consultation Notes
              </label>
              <textarea
                rows={2}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                placeholder="Enter remote consultation recommendations, medication order updates..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 font-sans transition-colors"
              />
            </div>

            {/* Video Call Controls Toolbar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    isMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>

              <button
                onClick={() => {
                  alert(`Consultation note logged. Session closed for ${activeConsultPatient.patientName}.`);
                  setActiveConsultPatient(null);
                }}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 rotate-135" />
                <span>End Tele-Consultation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PTZ Camera Configuration Modal */}
      <PtzCameraConfigModal
        isOpen={isPtzConfigOpen}
        onClose={() => setIsPtzConfigOpen(false)}
      />
    </div>
  );
};

export default VirtualICUPage;
