import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Play,
  Square,
  UserPlus,
  Mic,
  Disc,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  X,
  Stethoscope,
  Activity,
  Layers,
  FileCheck,
  AlertTriangle,
  Info,
  Shield,
  Send,
  Download
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMeetingsThunk,
  fetchMeetingDetailsThunk,
  createMeetingThunk,
  startMeetingThunk,
  endMeetingThunk,
  joinMeetingThunk,
  leaveMeetingThunk,
  inviteParticipantThunk,
  saveTranscriptThunk,
  fetchTranscriptThunk,
  saveSummaryThunk,
  fetchSummaryThunk,
  verifySummaryThunk,
  attachRecordingThunk,
  setActiveMeetingId,
  setActiveMeeting,
  setFilterStatus,
  setFilterType,
  setSearchQuery,
  clearMeetingMessages
} from '../../store/slices/meetingSlice';
import {
  MeetingResponse,
  MeetingType,
  MeetingStatus,
  MeetingRole,
  MeetingCreatePayload,
  MeetingParticipantCreatePayload,
  MeetingRecordingCreatePayload,
  MeetingTranscriptCreatePayload,
  MeetingSummaryCreatePayload,
  DEFAULT_MEETING_ADMISSION_UUID,
  DEFAULT_MEETING_USER_UUID,
  DEFAULT_MEETING_CONSULTANT_UUID
} from '../../api/meetingApi';

// ==========================================
// ELAPSED TIME COMPONENT
// ==========================================
const MeetingElapsedTimer: React.FC<{ startedAt: string }> = ({ startedAt }) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const diffMs = Math.max(0, Date.now() - new Date(startedAt).getTime());
      setElapsed(Math.floor(diffMs / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  return (
    <span className="font-mono text-emerald-400 font-semibold tracking-wider">
      {hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </span>
  );
};

// ==========================================
// MAIN COMPONENT: MEETINGS HUB PAGE
// ==========================================
export const MeetingsHubPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    meetings,
    activeMeeting,
    activeMeetingId,
    transcript,
    summary,
    isLoading,
    isStarting,
    isEnding,
    isJoining,
    isLeaving,
    isSavingSummary,
    isVerifyingSummary,
    isCreating,
    error,
    successMessage,
    filterStatus,
    filterType,
    searchQuery
  } = useAppSelector((state) => state.meetings);

  const { currentUser } = useAppSelector((state) => state.auth);
  const { patients } = useAppSelector((state) => state.patient);

  // Local UI States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState<boolean>(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'summary' | 'transcript' | 'participants' | 'recordings'>('summary');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Schedule Modal Form
  const [newTitle, setNewTitle] = useState<string>('Morning Multi-Disciplinary Tele-ICU Rounds');
  const [newType, setNewType] = useState<MeetingType>('TELE_ICU_CONSULT');
  const [newScheduledStart, setNewScheduledStart] = useState<string>(
    new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [newAdmissionId, setNewAdmissionId] = useState<string>(DEFAULT_MEETING_ADMISSION_UUID);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([
    DEFAULT_MEETING_USER_UUID,
    DEFAULT_MEETING_CONSULTANT_UUID
  ]);

  // Drawer Action Forms
  const [inviteUserId, setInviteUserId] = useState<string>(DEFAULT_MEETING_CONSULTANT_UUID);
  const [inviteRole, setInviteRole] = useState<MeetingRole>('CONSULTANT');
  const [isInviteSubmitting, setIsInviteSubmitting] = useState<boolean>(false);

  // Transcript Input in Drawer
  const [newSpeaker, setNewSpeaker] = useState<string>('Dr. Anand (Intensivist)');
  const [newTranscriptLine, setNewTranscriptLine] = useState<string>('');
  const [isTranscriptSubmitting, setIsTranscriptSubmitting] = useState<boolean>(false);

  // Recording Input in Drawer
  const [recDuration, setRecDuration] = useState<number>(1820);
  const [recFilePath, setRecFilePath] = useState<string>('s3://icu-vault/teleicu-recordings/session-enc-01.mp4');
  const [recKeyId, setRecKeyId] = useState<string>('kms-key-teleicu-rsa-4096');
  const [isRecSubmitting, setIsRecSubmitting] = useState<boolean>(false);

  // Initial Fetch & Polling
  useEffect(() => {
    dispatch(fetchMeetingsThunk(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchMeetingsThunk(undefined));
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPIs
  const liveMeetings = useMemo(() => {
    return meetings.filter((m) => m.status === 'IN_PROGRESS');
  }, [meetings]);

  const scheduledMeetings = useMemo(() => {
    return meetings.filter((m) => m.status === 'SCHEDULED');
  }, [meetings]);

  const completedMeetings = useMemo(() => {
    return meetings.filter((m) => m.status === 'COMPLETED');
  }, [meetings]);

  const verifiedSummariesCount = useMemo(() => {
    return meetings.filter((m) => m.summary?.is_clinically_verified).length;
  }, [meetings]);

  const totalWithSummary = useMemo(() => {
    return meetings.filter((m) => !!m.summary).length;
  }, [meetings]);

  const verificationRate = totalWithSummary > 0
    ? Math.round((verifiedSummariesCount / totalWithSummary) * 100)
    : 100;

  // Filtered List
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
      if (filterType !== 'ALL' && m.meeting_type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesType = m.meeting_type.toLowerCase().includes(q);
        const matchesId = m.id.toLowerCase().includes(q);
        const matchesAdmission = (m.admission_id || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesType && !matchesId && !matchesAdmission) {
          return false;
        }
      }
      return true;
    });
  }, [meetings, filterStatus, filterType, searchQuery]);

  // Handle Schedule Meeting
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MeetingCreatePayload = {
      title: newTitle.trim(),
      meeting_type: newType,
      scheduled_start: new Date(newScheduledStart).toISOString(),
      admission_id: newAdmissionId.trim() || null,
      participant_user_ids: selectedParticipants.length > 0 ? selectedParticipants : null
    };

    const res = await dispatch(createMeetingThunk(payload));
    if (createMeetingThunk.fulfilled.match(res)) {
      setIsScheduleModalOpen(false);
      setNewTitle('Multi-Disciplinary Tele-ICU Rounds');
    }
  };

  // Handle Start Meeting
  const handleStartMeeting = async (meetingId: string) => {
    await dispatch(startMeetingThunk(meetingId));
    dispatch(fetchMeetingDetailsThunk(meetingId));
  };

  // Handle End Meeting
  const handleEndMeeting = async (meetingId: string) => {
    await dispatch(endMeetingThunk(meetingId));
    dispatch(fetchMeetingDetailsThunk(meetingId));
  };

  // Handle Join & Enter Meeting Room
  const handleJoinAndEnter = async (meeting: MeetingResponse) => {
    dispatch(setActiveMeeting(meeting));
    await dispatch(joinMeetingThunk(meeting.id));
    navigate(`/meet?meeting_id=${meeting.id}`);
  };

  // Handle Open Details Drawer
  const handleOpenDrawer = (meeting: MeetingResponse) => {
    dispatch(setActiveMeeting(meeting));
    dispatch(fetchMeetingDetailsThunk(meeting.id));
    dispatch(fetchTranscriptThunk(meeting.id));
    dispatch(fetchSummaryThunk(meeting.id));
    setIsDetailsDrawerOpen(true);
  };

  // Handle Invite Participant
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeetingId || !inviteUserId.trim()) return;
    setIsInviteSubmitting(true);
    await dispatch(
      inviteParticipantThunk({
        meetingId: activeMeetingId,
        payload: {
          user_id: inviteUserId.trim(),
          role_in_meeting: inviteRole
        }
      })
    );
    setIsInviteSubmitting(false);
  };

  // Handle Ingest Transcript Line
  const handleIngestTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeetingId || !newTranscriptLine.trim()) return;
    setIsTranscriptSubmitting(true);

    const currentJson = transcript?.transcript_json || activeMeeting?.transcript?.transcript_json || [];
    const newEntry = {
      speaker: newSpeaker,
      timestamp: Math.floor(Date.now() / 1000),
      text: newTranscriptLine.trim()
    };
    const updatedJson = [...currentJson, newEntry];
    const updatedFullText = updatedJson.map((t: any) => `${t.speaker}: ${t.text}`).join('\n\n');

    await dispatch(
      saveTranscriptThunk({
        meetingId: activeMeetingId,
        payload: {
          full_text: updatedFullText,
          language: 'en-US',
          transcript_json: updatedJson
        }
      })
    );
    setNewTranscriptLine('');
    setIsTranscriptSubmitting(false);
  };

  // Handle Verify Decisions
  const handleVerifyDecisions = async () => {
    if (!activeMeetingId) return;
    await dispatch(verifySummaryThunk(activeMeetingId));
  };

  // Handle Attach Recording
  const handleAttachRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeetingId) return;
    setIsRecSubmitting(true);
    await dispatch(
      attachRecordingThunk({
        meetingId: activeMeetingId,
        payload: {
          file_path: recFilePath.trim(),
          duration_seconds: Number(recDuration),
          encryption_key_id: recKeyId.trim()
        }
      })
    );
    setIsRecSubmitting(false);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            LIVE IN PROGRESS
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            SCHEDULED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            CONCLUDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  // Meeting Type Label Helper
  const formatMeetingType = (type: string) => {
    switch (type) {
      case 'MORNING_ROUNDS':
        return 'Morning MDT Rounds';
      case 'TELE_ICU_CONSULT':
        return 'Tele-ICU Critical Consult';
      case 'M_AND_M_CONFERENCE':
        return 'M&M Review Conference';
      case 'FAMILY_COUNSELING':
        return 'Family Clinical Counseling';
      case 'EMERGENCY_DEBRIEF':
        return 'Code Blue / Emergency Debrief';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const currentDrawerMeeting = activeMeeting || meetings.find((m) => m.id === activeMeetingId) || meetings[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6">
      
      {/* ==========================================
          HEADER SECTION & ACTIONS
         ========================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-sm">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                Multidisciplinary Meetings & Tele-ICU
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  OpenAPI 3.1
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Clinical conferences, remote intensivist tele-rounds, diarized speech AI transcription, and decision verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => dispatch(fetchMeetingsThunk(undefined))}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh meetings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Conference</span>
          </button>
        </div>
      </div>

      {/* Global Error & Success Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearMeetingMessages())}
            className="text-rose-400 hover:text-rose-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearMeetingMessages())}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==========================================
          LIVE SPOTLIGHT: ACTIVE IN-PROGRESS CONFERENCES
         ========================================== */}
      {liveMeetings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              Live Tele-ICU Session Spotlight ({liveMeetings.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live audio/video stream active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMeetings.map((liveM) => (
              <div
                key={liveM.id}
                className="bg-slate-800/90 border-2 border-emerald-500/40 rounded-xl p-4 md:p-5 shadow-lg relative overflow-hidden group hover:border-emerald-400/60 transition-all"
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                        {formatMeetingType(liveM.meeting_type)}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Elapsed: <MeetingElapsedTimer startedAt={liveM.actual_start || liveM.scheduled_start} />
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white tracking-tight">{liveM.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>Admission: {liveM.admission_id ? liveM.admission_id.slice(0, 13) + '...' : 'Global Rounds'}</span>
                      <span>•</span>
                      <span>{liveM.participants?.length || 0} attending clinicians</span>
                    </p>
                  </div>

                  <span className="shrink-0 p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Video className="w-5 h-5 animate-pulse" />
                  </span>
                </div>

                {/* AI & Verification Snapshot */}
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-300">
                      {liveM.summary
                        ? liveM.summary.is_clinically_verified
                          ? 'Decisions Verified by Intensivist'
                          : 'AI Synthesis Available (Pending Sign-off)'
                        : 'Speech Transcription Live'}
                    </span>
                  </div>

                  {liveM.summary?.is_clinically_verified ? (
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-400" />
                      Verified
                    </span>
                  ) : null}
                </div>

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleOpenDrawer(liveM)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span>Clinical AI Dossier</span>
                  </button>

                  <button
                    onClick={() => handleEndMeeting(liveM.id)}
                    disabled={isEnding}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Square className="w-3 h-3 text-rose-400" />
                    <span>Conclude</span>
                  </button>

                  <button
                    onClick={() => handleJoinAndEnter(liveM)}
                    disabled={isJoining}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          KPI METRICS GRID
         ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Live Sessions */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Live Tele-ICU Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
            <span>{liveMeetings.length}</span>
            {liveMeetings.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
                Active Now
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Real-time videoconference & PTZ</p>
        </div>

        {/* KPI 2: Scheduled */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Scheduled Today</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {scheduledMeetings.length}
          </div>
          <p className="text-[11px] text-slate-400">Upcoming clinical multidisciplinary</p>
        </div>

        {/* KPI 3: AI Syntheses */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Summaries Generated</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalWithSummary}
          </div>
          <p className="text-[11px] text-slate-400">Diarized NLP organ-system synthesis</p>
        </div>

        {/* KPI 4: Verification Rate */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Clinician Verification</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
            <span>{verificationRate}%</span>
            <span className="text-[11px] font-normal text-slate-400">({verifiedSummariesCount}/{totalWithSummary || 1})</span>
          </div>
          <p className="text-[11px] text-slate-400">Attending intensivist signed off</p>
        </div>
      </div>

      {/* ==========================================
          FILTER & SEARCH TOOLBAR
         ========================================== */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Conferences', count: meetings.length },
            { id: 'IN_PROGRESS', label: 'Live Active', count: liveMeetings.length },
            { id: 'SCHEDULED', label: 'Scheduled', count: scheduledMeetings.length },
            { id: 'COMPLETED', label: 'Concluded', count: completedMeetings.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setFilterStatus(tab.id))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter by Type & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => dispatch(setFilterType(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 py-1.5 pl-3 pr-7 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              <option value="ALL">All Meeting Types</option>
              <option value="MORNING_ROUNDS">Morning MDT Rounds</option>
              <option value="TELE_ICU_CONSULT">Tele-ICU Critical Consult</option>
              <option value="M_AND_M_CONFERENCE">M&M Review</option>
              <option value="FAMILY_COUNSELING">Family Counseling</option>
              <option value="EMERGENCY_DEBRIEF">Emergency Debrief</option>
            </select>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, ID, admission..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          MEETINGS DATA TABLE
         ========================================== */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Conference / Consult</th>
                <th className="py-3.5 px-4">Timing</th>
                <th className="py-3.5 px-4">Patient / Admission</th>
                <th className="py-3.5 px-4">Clinical AI Dossier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No clinical meetings found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Schedule a new multidisciplinary conference or modify filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => {
                  const hasSummary = !!m.summary;
                  const isVerified = m.summary?.is_clinically_verified === true;
                  const isLive = m.status === 'IN_PROGRESS';
                  const isSched = m.status === 'SCHEDULED';
                  const isEnded = m.status === 'COMPLETED';

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-700/30 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(m)}
                    >
                      {/* Conference Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                              {m.title}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700/50 text-slate-300 border border-slate-600/40">
                              {formatMeetingType(m.meeting_type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>ID: {m.id.slice(0, 8)}...</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(m.id);
                              }}
                              className="text-slate-500 hover:text-slate-300 cursor-pointer"
                              title="Copy Meeting UUID"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <span>•</span>
                            <span>{m.participants?.length || 0} participants</span>
                          </div>
                        </div>
                      </td>

                      {/* Timing */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-slate-300">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {new Date(m.scheduled_start).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {new Date(m.scheduled_start).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {m.actual_start && (
                              <span className="text-emerald-400 text-[10px]">
                                (Started {new Date(m.actual_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Patient / Admission */}
                      <td className="py-3.5 px-4">
                        {m.admission_id ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-200 font-mono">
                              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                              <span>{m.admission_id.slice(0, 13)}...</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-sans block">
                              Associated ICU Admission
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            Multi-patient / Departmental
                          </span>
                        )}
                      </td>

                      {/* Clinical AI Dossier */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {hasSummary ? (
                            isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                <ShieldCheck className="w-3 h-3 text-teal-400" />
                                Clinically Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                AI Summary Pending Sign-off
                              </span>
                            )
                          ) : (
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-600" />
                              Not Generated Yet
                            </span>
                          )}

                          {m.transcript && (
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Mic className="w-2.5 h-2.5 text-slate-500" />
                              Diarized Audio Ingested
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(m.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isSched && (
                            <button
                              onClick={() => handleStartMeeting(m.id)}
                              disabled={isStarting}
                              className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                              title="Start Meeting"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Start</span>
                            </button>
                          )}

                          {isLive && (
                            <>
                              <button
                                onClick={() => handleJoinAndEnter(m)}
                                disabled={isJoining}
                                className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Join Live Call"
                              >
                                <Video className="w-3 h-3" />
                                <span>Join</span>
                              </button>

                              <button
                                onClick={() => handleEndMeeting(m.id)}
                                disabled={isEnding}
                                className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                                title="Conclude Meeting"
                              >
                                <Square className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleOpenDrawer(m)}
                            className="p-1.5 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Open Dossier Drawer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          SCHEDULE CONFERENCE MODAL (POST /api/v1/meetings)
         ========================================== */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-slate-100">
            <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Schedule Clinical Conference</h3>
                  <p className="text-xs text-slate-400">Initiate Multidisciplinary Round or Tele-ICU Session</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-4 md:p-5 space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Conference Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Bed 04 ARDS Prone Positioning Review"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Meeting Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Meeting Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MeetingType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-teal-500 cursor-pointer"
                  >
                    <option value="TELE_ICU_CONSULT">Tele-ICU Critical Consult</option>
                    <option value="MORNING_ROUNDS">Morning MDT Rounds</option>
                    <option value="M_AND_M_CONFERENCE">M&M Review Conference</option>
                    <option value="FAMILY_COUNSELING">Family Clinical Counseling</option>
                    <option value="EMERGENCY_DEBRIEF">Emergency Debrief</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Scheduled Start <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newScheduledStart}
                    onChange={(e) => setNewScheduledStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Admission / Patient UUID */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Admission Stay UUID (Optional)
                </label>
                <input
                  type="text"
                  value={newAdmissionId}
                  onChange={(e) => setNewAdmissionId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full font-mono bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 text-[11px]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Leave as active stay or default for patient-specific tele-rounds
                </p>
              </div>

              {/* Participants */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Initial Participants User IDs (Comma-separated)
                </label>
                <input
                  type="text"
                  value={selectedParticipants.join(', ')}
                  onChange={(e) =>
                    setSelectedParticipants(
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="UUID-1, UUID-2"
                  className="w-full font-mono bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 text-[11px]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Pre-configured with attending intensivist & senior consultant UUIDs
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCreating ? 'Scheduling...' : 'Schedule Conference'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          CLINICAL AI DOSSIER DRAWER (Right Side Panel)
         ========================================== */}
      {isDetailsDrawerOpen && currentDrawerMeeting && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-slide-left text-slate-100">
            
            {/* Drawer Header */}
            <div className="p-4 md:p-5 border-b border-slate-800 space-y-2 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStatusBadge(currentDrawerMeeting.status)}
                    <span className="text-xs font-mono text-slate-400">
                      {formatMeetingType(currentDrawerMeeting.meeting_type)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {currentDrawerMeeting.title}
                  </h2>
                </div>
                <button
                  onClick={() => setIsDetailsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-bar with UUID & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <span>UUID: {currentDrawerMeeting.id}</span>
                  <button
                    onClick={() => handleCopy(currentDrawerMeeting.id)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {copiedId === currentDrawerMeeting.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {currentDrawerMeeting.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleStartMeeting(currentDrawerMeeting.id)}
                      disabled={isStarting}
                      className="px-3 py-1 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Meeting</span>
                    </button>
                  )}

                  {currentDrawerMeeting.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => handleJoinAndEnter(currentDrawerMeeting)}
                        disabled={isJoining}
                        className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3 h-3" />
                        <span>Enter Room</span>
                      </button>

                      <button
                        onClick={() => handleEndMeeting(currentDrawerMeeting.id)}
                        disabled={isEnding}
                        className="px-3 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium cursor-pointer"
                      >
                        <Square className="w-3 h-3" />
                        <span>Conclude</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer Tabs Navigation */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs">
                {[
                  { id: 'summary', label: 'AI Synthesis & Decisions', icon: Sparkles },
                  { id: 'transcript', label: 'Speech-to-Text Transcript', icon: Mic },
                  { id: 'participants', label: 'Participants Roster', icon: Users },
                  { id: 'recordings', label: 'Encrypted Vault', icon: Disc }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDrawerActiveTab(t.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        drawerActiveTab === t.id
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 text-xs">
              
              {/* ==========================================
                  TAB 1: AI SYNTHESIS & CLINICAL DECISIONS
                 ========================================== */}
              {drawerActiveTab === 'summary' && (
                <div className="space-y-5">
                  
                  {/* Verification Banner */}
                  {(summary || currentDrawerMeeting.summary)?.is_clinically_verified ? (
                    <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1.5 text-teal-300">
                      <div className="flex items-center gap-2 font-semibold text-sm text-teal-200">
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>Clinically Verified Decisions</span>
                      </div>
                      <p className="text-xs text-teal-300/80">
                        Verified by Attending Clinician UUID:{' '}
                        <span className="font-mono text-white">
                          {(summary || currentDrawerMeeting.summary)?.verified_by_user_id || 'Self'}
                        </span>{' '}
                        at{' '}
                        {new Date(
                          (summary || currentDrawerMeeting.summary)?.verified_at || Date.now()
                        ).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                      <div className="space-y-1 text-amber-200">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-300">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>Requires Intensivist Clinical Verification</span>
                        </div>
                        <p className="text-[11px] text-amber-300/80">
                          Verify multidisciplinary consensus & medication modifications before EHR commit.
                        </p>
                      </div>

                      <button
                        onClick={handleVerifyDecisions}
                        disabled={isVerifyingSummary}
                        className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isVerifyingSummary ? 'Verifying...' : 'Verify Decisions'}</span>
                      </button>
                    </div>
                  )}

                  {/* Executive Summary Card */}
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        Executive Synthesis
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        NLP Synthesizer v2.4
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      {(summary || currentDrawerMeeting.summary)?.executive_summary ||
                        'No executive summary saved for this session yet.'}
                    </p>
                  </div>

                  {/* Organ System Status Grid */}
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      Multisystem Organ Evaluation
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {Object.entries(
                        (summary || currentDrawerMeeting.summary)?.organ_system_status || {
                          Cardiovascular: 'Sinus rhythm, low dose Noradrenaline weaning',
                          Respiratory: 'Volume control, PaO2/FiO2 188, PEEP 12',
                          Renal: 'Urine output >0.8 mL/kg/h, Cr stable',
                          Neurological: 'RASS -1, compliant with sedation protocol'
                        }
                      ).map(([system, status]: [string, any]) => (
                        <div
                          key={system}
                          className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-lg space-y-1"
                        >
                          <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wide block">
                            {system}
                          </span>
                          <p className="text-xs text-slate-300">{String(status)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Decisions List */}
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                      Agreed Clinical Decisions
                    </h4>

                    <div className="space-y-2">
                      {((summary || currentDrawerMeeting.summary)?.clinical_decisions || [
                        'Initiate prone positioning trial (16 hours/day)',
                        'Step down Piperacillin/Tazobactam upon 48h culture clearance',
                        'Maintain fluid balance target -500mL over next 24h'
                      ]).map((dec: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{dec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items List */}
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      Action Items & Assigned Clinicians
                    </h4>

                    <div className="space-y-2">
                      {((summary || currentDrawerMeeting.summary)?.action_items || [
                        { task: 'Order repeat ABG at 16:00', assigned_to: 'Bedside Nurse', priority: 'STAT' },
                        { task: 'Chest CT Angiography consult', assigned_to: 'Pulmonology Fellow', priority: 'URGENT' },
                        { task: 'Family counseling call at 18:00', assigned_to: 'Senior Resident', priority: 'ROUTINE' }
                      ]).map((act: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="text-slate-200 font-medium">{act.task}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Assigned to: {act.assigned_to}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            act.priority === 'STAT'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : act.priority === 'URGENT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          }`}>
                            {act.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB 2: SPEECH-TO-TEXT DIARIZED TRANSCRIPT
                 ========================================== */}
              {drawerActiveTab === 'transcript' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                    <div>
                      <h4 className="font-semibold text-white text-xs">Decrypted Diarized Transcript</h4>
                      <p className="text-[11px] text-slate-400">
                        Multi-speaker diarized acoustic model (Language: {(transcript || currentDrawerMeeting.transcript)?.language || 'en-US'})
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const fullText = (transcript || currentDrawerMeeting.transcript)?.full_text;
                        if (fullText) {
                          const blob = new Blob([fullText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `meeting-transcript-${currentDrawerMeeting.id.slice(0, 8)}.txt`;
                          a.click();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>

                  {/* Diarized Speech Segments */}
                  <div className="space-y-3">
                    {((transcript || currentDrawerMeeting.transcript)?.transcript_json || []).length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800">
                        <Mic className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-300">No transcript segments ingested</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Use the speech ingestion form below to record clinician statements
                        </p>
                      </div>
                    ) : (
                      ((transcript || currentDrawerMeeting.transcript)?.transcript_json || []).map((seg: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-teal-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              {seg.speaker || 'Unknown Speaker'}
                            </span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {seg.timestamp
                                ? new Date(seg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : `Turn ${idx + 1}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{seg.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Live Speech Ingest Form (POST /api/v1/meetings/{id}/transcripts) */}
                  <form onSubmit={handleIngestTranscript} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h5 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-teal-400" />
                      Ingest Diarized Speech Segment
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-1">
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Speaker Tag</label>
                        <input
                          type="text"
                          value={newSpeaker}
                          onChange={(e) => setNewSpeaker(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Diarized Dialogue Statement</label>
                        <input
                          type="text"
                          value={newTranscriptLine}
                          onChange={(e) => setNewTranscriptLine(e.target.value)}
                          placeholder="e.g. Intensivist confirms initiation of 20ppm nitric oxide inhalation."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={!newTranscriptLine.trim() || isTranscriptSubmitting}
                        className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isTranscriptSubmitting ? 'Ingesting...' : 'Ingest Segment'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ==========================================
                  TAB 3: PARTICIPANTS ROSTER (POST /api/v1/meetings/{id}/participants)
                 ========================================== */}
              {drawerActiveTab === 'participants' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      Attending Clinical Roster ({currentDrawerMeeting.participants?.length || 0})
                    </h4>

                    <div className="space-y-2">
                      {(currentDrawerMeeting.participants || []).map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 font-mono">
                                User: {p.user_id.slice(0, 13)}...
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                {p.role_in_meeting || 'ATTENDEE'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                              <span>Joined: {p.joined_at ? new Date(p.joined_at).toLocaleTimeString() : 'Not Joined'}</span>
                              {p.left_at && <span>• Left: {new Date(p.left_at).toLocaleTimeString()}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {p.joined_at && !p.left_at ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online in meeting" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-600" title="Offline" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invite Participant Form */}
                  <form onSubmit={handleInviteSubmit} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h5 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                      Invite Specialist or Remote Intensivist
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Clinician User UUID</label>
                        <input
                          type="text"
                          required
                          value={inviteUserId}
                          onChange={(e) => setInviteUserId(e.target.value)}
                          placeholder="UUID"
                          className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Conference Role</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as MeetingRole)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 cursor-pointer"
                        >
                          <option value="LEAD_PRESENTER">Lead Presenter</option>
                          <option value="CONSULTANT">Consultant</option>
                          <option value="NOTE_TAKER">Note Taker / Scribe</option>
                          <option value="ATTENDEE">Attendee</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isInviteSubmitting}
                        className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isInviteSubmitting ? 'Inviting...' : 'Invite to Conference'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ==========================================
                  TAB 4: ENCRYPTED RECORDINGS VAULT
                 ========================================== */}
              {drawerActiveTab === 'recordings' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Disc className="w-3.5 h-3.5 text-teal-400" />
                      Encrypted Tele-ICU Media Recordings ({currentDrawerMeeting.recordings?.length || 0})
                    </h4>

                    <div className="space-y-2">
                      {(currentDrawerMeeting.recordings || []).length === 0 ? (
                        <div className="p-6 text-center text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                          <Disc className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs font-medium text-slate-300">No encrypted recording attached</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Recordings captured during the video call are automatically encrypted and registered here
                          </p>
                        </div>
                      ) : (
                        (currentDrawerMeeting.recordings || []).map((rec, idx) => (
                          <div
                            key={rec.id || idx}
                            className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200 font-mono text-[11px] truncate max-w-xs">
                                {rec.file_path}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                {Math.floor(rec.duration_seconds / 60)}m {rec.duration_seconds % 60}s
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>KMS Key: {rec.encryption_key_id}</span>
                              <span>{new Date(rec.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Attach Recording Form */}
                  <form onSubmit={handleAttachRecording} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h5 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Disc className="w-3.5 h-3.5 text-teal-400" />
                      Attach Encrypted Storage Metadata
                    </h5>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Encrypted S3 File Path</label>
                        <input
                          type="text"
                          required
                          value={recFilePath}
                          onChange={(e) => setRecFilePath(e.target.value)}
                          className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Duration (Seconds)</label>
                          <input
                            type="number"
                            required
                            value={recDuration}
                            onChange={(e) => setRecDuration(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">KMS Key ID</label>
                          <input
                            type="text"
                            required
                            value={recKeyId}
                            onChange={(e) => setRecKeyId(e.target.value)}
                            className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isRecSubmitting}
                        className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        <Disc className="w-3.5 h-3.5" />
                        <span>{isRecSubmitting ? 'Attaching...' : 'Attach Recording Metadata'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsHubPage;
