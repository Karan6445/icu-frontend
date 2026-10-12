import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Video, 
  Mic, 
  ShieldCheck, 
  Bed, 
  Users, 
  Sparkles, 
  Share2,
  PhoneCall,
  Clock,
  Radio
} from 'lucide-react';
import { MOCK_PATIENTS } from '../../data/mockData';

export const GoogleMeetIcon: React.FC<{ className?: string; variant?: 'theme' | 'original' }> = ({ 
  className = "w-6 h-4.5",
  variant = 'theme'
}) => {
  const rawId = React.useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  if (variant === 'original') {
    return (
      <svg viewBox="11 16 32 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path fill="#00832d" d="M27 18h-9a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h9a6 6 0 0 0 6-6v-8a6 6 0 0 0-6-6z"/>
        <path fill="#0066da" d="M39 18.5 33 23v10l6 4.5a2 2 0 0 0 3-1.6v-15.8a2 2 0 0 0-3-1.6z"/>
        <path fill="#e53935" d="M27 18v18h-9A6 6 0 0 1 12 30V24a6 6 0 0 1 6-6h9z"/>
        <path fill="#ffb300" d="M33 23 27 18h-9a6 6 0 0 1-6 6v2l21-3z"/>
        <path fill="#00ac47" d="M33 33v-10l-6-5v14h6z"/>
      </svg>
    );
  }

  return (
    <svg viewBox="11 16 32 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradient for Camera Lens (Smart Clinical Sky / Cyan) */}
        <linearGradient id={`gmeet-lens-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Gradient for Left Main Body (Deep Medical Teal) */}
        <linearGradient id={`gmeet-left-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>

        {/* Gradient for Top Fold / Highlight (Vibrant Aqua Mint) */}
        <linearGradient id={`gmeet-top-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>

        {/* Gradient for Right Fold Connector (Active Emerald) */}
        <linearGradient id={`gmeet-connector-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Gradient for Base / Bottom (Rich Dark Teal) */}
        <linearGradient id={`gmeet-base-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#115E59" />
        </linearGradient>
      </defs>

      {/* Main Base */}
      <path fill={`url(#gmeet-base-${id})`} d="M27 18h-9a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h9a6 6 0 0 0 6-6v-8a6 6 0 0 0-6-6z" />
      {/* Camera Lens */}
      <path fill={`url(#gmeet-lens-${id})`} d="M39 18.5 33 23v10l6 4.5a2 2 0 0 0 3-1.6v-15.8a2 2 0 0 0-3-1.6z" />
      {/* Left Body Fold */}
      <path fill={`url(#gmeet-left-${id})`} d="M27 18v18h-9A6 6 0 0 1 12 30V24a6 6 0 0 1 6-6h9z" />
      {/* Top Highlight Fold */}
      <path fill={`url(#gmeet-top-${id})`} d="M33 23 27 18h-9a6 6 0 0 1-6 6v2l21-3z" />
      {/* Right Connector Fold */}
      <path fill={`url(#gmeet-connector-${id})`} d="M33 33v-10l-6-5v14h6z" />
    </svg>
  );
};

interface NaimifyMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  doctorRole?: string;
}

export const NaimifyMeetModal: React.FC<NaimifyMeetModalProps> = ({
  isOpen,
  onClose,
  doctorName = 'Dr. Vikram Anand',
  doctorRole = 'DOCTOR'
}) => {
  const [meetingCode, setMeetingCode] = useState<string>('nmf-icu-consult');
  const [selectedBedId, setSelectedBedId] = useState<string>('ALL');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [camActive, setCamActive] = useState<boolean>(true);

  if (!isOpen) return null;

  const meetUrl = `https://meet.google.com/${meetingCode}`;
  const selectedPatient = selectedBedId !== 'ALL' 
    ? MOCK_PATIENTS.find(p => p.id === selectedBedId || p.bedNumber === selectedBedId) 
    : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyInvitation = () => {
    const inviteText = `🏥 NAIMIFY SMART ICU — Doctor Tele-Consultation\n` +
      `👨‍⚕️ Attending Doctor: ${doctorName} (${doctorRole})\n` +
      `🛏️ Bed/Patient: ${selectedPatient ? `Bed ${selectedPatient.bedNumber} - ${selectedPatient.name} (${selectedPatient.mrn})` : 'Multi-Disciplinary ICU Rounds'}\n` +
      `🔗 Google Meet Link: ${meetUrl}\n` +
      `🔒 Security: HIPAA Compliant End-to-End Encrypted Tele-ICU Session`;

    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleJoinMeet = () => {
    window.open(meetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="naimify-meet-title"
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 relative text-slate-900 dark:text-white font-sans max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
        id="naimify-meet-show"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close Naimify Meet"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 p-2">
            <GoogleMeetIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="naimify-meet-title" className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Naimify Meet
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 uppercase font-bold tracking-wider">
                meet_show
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                <Radio className="w-3 h-3 animate-pulse" />
                TELE-CONSULT LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Instant Google Meet video session for doctor clinical consults, nursing handovers, and ICU bedside reviews.
            </p>
          </div>
        </div>

        {/* Host Doctor Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                {doctorName}
              </span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                {doctorRole === 'SUPER_ADMIN' ? 'Command Center Director' : doctorRole === 'ADMIN' ? 'Hospital Administrator' : doctorRole === 'NURSE' ? 'Nurse Lead / Practitioner' : 'Attending Intensivist'} • Critical Care Command Center
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            HOST
          </span>
        </div>

        {/* Google Meet Link Display Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Google Meet Tele-Consult Link
          </label>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl p-2.5 transition-all focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <GoogleMeetIcon className="w-5 h-5" />
            </div>
            <a 
              href={meetUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline truncate"
              title="Click to open Google Meet in new tab"
            >
              {meetUrl}
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meeting Configuration & Patient Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Bed / Patient Association */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              <span>Link ICU Bed / Patient</span>
            </label>
            <select
              value={selectedBedId}
              onChange={(e) => setSelectedBedId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
            >
              <option value="ALL">General ICU Rounds (All Beds)</option>
              {MOCK_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>
                  Bed {p.bedNumber} — {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Code Customizer */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              <span>Meeting Room Code</span>
            </label>
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. nmf-icu-consult"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>

        {/* Selected Patient Mini Preview Card if selected */}
        {selectedPatient && (
          <div className="bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/70 rounded-2xl p-3 text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div>
              <span className="font-extrabold text-teal-900 dark:text-teal-200 block text-xs">
                Bed {selectedPatient.bedNumber} • {selectedPatient.name} ({selectedPatient.age}y/{selectedPatient.gender})
              </span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                MRN: {selectedPatient.mrn} • Diagnosis: {selectedPatient.admittingDiagnosis}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
              selectedPatient.status === 'CRITICAL' 
                ? 'bg-rose-500 text-white' 
                : 'bg-emerald-600 text-white'
            }`}>
              {selectedPatient.status}
            </span>
          </div>
        )}

        {/* Pre-Call Hardware Checks & Security Status */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
            Tele-Consult Readiness Check
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setCamActive(!camActive)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                camActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span className="font-bold text-[11px]">{camActive ? 'HD Cam ON' : 'Cam OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                micActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="font-bold text-[11px]">{micActive ? 'Mic Active' : 'Mic Muted'}</span>
            </button>

            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 flex items-center justify-center gap-1 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>48ms Ping</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 text-[11px] font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>HIPAA TLS</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopyInvitation}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copiedInvite ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Invitation Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                <span>Copy Full Invitation</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleJoinMeet}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <GoogleMeetIcon className="w-4 h-4" />
              <span>Launch Google Meet</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaimifyMeetModal;
