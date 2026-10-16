import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Hand, 
  MonitorUp, 
  MoreVertical, 
  Info, 
  Users, 
  MessageSquare, 
  Shapes, 
  Shield, 
  Smile, 
  Pin, 
  PinOff, 
  Maximize, 
  Minimize, 
  Copy, 
  Check, 
  Send, 
  Search, 
  X, 
  UserPlus, 
  Mail, 
  Lock, 
  Circle,
  HelpCircle,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  AlertCircle,
  ShieldCheck,
  Disc,
  FileText,
  Play,
  Square,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { GoogleMeetIcon } from '../../components/layout/NaimifyMeetModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { validateEmail } from '../../utils/validation';
import {
  fetchMeetingDetailsThunk,
  joinMeetingThunk,
  leaveMeetingThunk,
  endMeetingThunk,
  fetchTranscriptThunk,
  saveTranscriptThunk,
  fetchSummaryThunk,
  saveSummaryThunk,
  verifySummaryThunk,
  attachRecordingThunk,
  inviteParticipantThunk
} from '../../store/slices/meetingSlice';
import { DEFAULT_MEETING_HOST_UUID, DEFAULT_MEETING_CONSULTANT_UUID } from '../../api/meetingApi';

interface ChatMessage {
  id: string;
  sender: string;
  time: string;
  text: string;
  isSelf: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHost: boolean;
  avatarColor: string;
  initials: string;
}

export const DoctorMeetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const { activeMeeting, transcript, summary, isVerifyingSummary } = useAppSelector(state => state.meetings);

  // Read meeting_id query parameter or active meeting from Redux
  const meetingIdParam = searchParams.get('meeting_id');
  const activeMeetingId = meetingIdParam || activeMeeting?.id || '9e3b00d5-a914-453f-ac33-0e5f87590d6a';

  // Meeting Room State
  const [meetingCode, setMeetingCode] = useState<string>(
    meetingIdParam ? meetingIdParam.slice(0, 10) : 'nmf-meet-icu'
  );
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Audio / Video Controls
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState<boolean>(false);
  
  // Real Camera Feed
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasRealStream, setHasRealStream] = useState<boolean>(false);

  // Popups & Drawers
  const [showReadyModal, setShowReadyModal] = useState<boolean>(true);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null); // 'info' | 'people' | 'chat' | 'activities' | 'host'
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Tele-ICU Activities Sub-tab: 'summary' | 'transcript' | 'recording' | 'whiteboard'
  const [activityTab, setActivityTab] = useState<'summary' | 'transcript' | 'recording' | 'whiteboard'>('summary');

  // Real-time Ingestion State
  const [speechSpeaker, setSpeechSpeaker] = useState<string>(currentUser.name || 'Attending Intensivist');
  const [speechText, setSpeechText] = useState<string>('');
  const [isSubmittingSpeech, setIsSubmittingSpeech] = useState<boolean>(false);

  // Recording State
  const [isRecordingOn, setIsRecordingOn] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Add People Form
  const [inviteInput, setInviteInput] = useState<string>('');
  const [inviteEmailError, setInviteEmailError] = useState<string | null>(null);
  const [invitedList, setInvitedList] = useState<string[]>([]);
  const [inviteSent, setInviteSent] = useState<boolean>(false);

  // In-Call Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'p-self',
      name: currentUser.name || 'Dr. Vikram Anand',
      email: currentUser.email || 'doctor.anand@hospital.org',
      isMuted: !isMicOn,
      isVideoOn: isCamOn,
      isHost: true,
      avatarColor: 'bg-[#00796b]',
      initials: currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'VA'
    }
  ]);

  // Initial sync with backend Tele-ICU session
  useEffect(() => {
    if (activeMeetingId) {
      dispatch(fetchMeetingDetailsThunk(activeMeetingId));
      dispatch(fetchTranscriptThunk(activeMeetingId));
      dispatch(fetchSummaryThunk(activeMeetingId));
      dispatch(joinMeetingThunk(activeMeetingId));
    }
  }, [activeMeetingId, dispatch]);

  // Recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecordingOn) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingOn]);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync self participant with local mic/cam
  useEffect(() => {
    setParticipants(prev => prev.map(p => {
      if (p.isHost) {
        return { ...p, isMuted: !isMicOn, isVideoOn: isCamOn };
      }
      return p;
    }));
  }, [isMicOn, isCamOn]);

  // Attempt real webcam access (WebRTC ready)
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCamOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setHasRealStream(true);
          }
        })
        .catch(() => {
          setHasRealStream(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setHasRealStream(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamOn]);

  // Auto scroll chat
  useEffect(() => {
    if (activeSidebar === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSidebar]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://meet.google.com/${meetingCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser.name || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      text: inputMessage.trim(),
      isSelf: true
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validateEmail(inviteInput, 'Invite email', true);
    if (emailValidation !== true) {
      setInviteEmailError(emailValidation);
      return;
    }
    setInviteEmailError(null);

    const email = inviteInput.trim();
    setInvitedList(prev => [...prev, email]);
    
    // Also simulate adding as a participant for demo
    const namePart = email.split('@')[0];
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      email: email,
      isMuted: true,
      isVideoOn: false,
      isHost: false,
      avatarColor: 'bg-[#1a73e8]',
      initials: namePart.slice(0, 2).toUpperCase()
    };
    setParticipants(prev => [...prev, newParticipant]);

    setInviteInput('');
    setInviteSent(true);

    // Also dispatch to backend participant invite API
    if (activeMeetingId) {
      dispatch(
        inviteParticipantThunk({
          meetingId: activeMeetingId,
          payload: {
            user_id: DEFAULT_MEETING_CONSULTANT_UUID,
            role_in_meeting: 'CONSULTANT'
          }
        })
      );
    }

    setTimeout(() => {
      setInviteSent(false);
      setShowAddPeopleModal(false);
    }, 1500);
  };

  // Tele-ICU In-Call Handlers
  const handleVerifyDecisionsInCall = async () => {
    if (!activeMeetingId) return;
    await dispatch(verifySummaryThunk(activeMeetingId));
  };

  const handleIngestSpeechInCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeetingId || !speechText.trim()) return;
    setIsSubmittingSpeech(true);

    const currentSegments = transcript?.transcript_json || activeMeeting?.transcript?.transcript_json || [];
    const newEntry = {
      speaker: speechSpeaker,
      timestamp: Math.floor(Date.now() / 1000),
      text: speechText.trim()
    };
    const updated = [...currentSegments, newEntry];
    const fullText = updated.map((t: any) => `${t.speaker}: ${t.text}`).join('\n\n');

    await dispatch(
      saveTranscriptThunk({
        meetingId: activeMeetingId,
        payload: {
          full_text: fullText,
          language: 'en-US',
          transcript_json: updated
        }
      })
    );
    setSpeechText('');
    setIsSubmittingSpeech(false);
  };

  const handleToggleRecordingInCall = async () => {
    if (!isRecordingOn) {
      setIsRecordingOn(true);
    } else {
      setIsRecordingOn(false);
      if (activeMeetingId && recordingSeconds > 0) {
        await dispatch(
          attachRecordingThunk({
            meetingId: activeMeetingId,
            payload: {
              file_path: `s3://icu-teleconferencing/${activeMeetingId}/rec-${Date.now()}.mp4`,
              duration_seconds: recordingSeconds,
              encryption_key_id: 'kms-rsa-teleicu-v3'
            }
          })
        );
      }
    }
  };

  const handleLeaveOrConcludeCall = async () => {
    if (activeMeetingId) {
      await dispatch(leaveMeetingThunk(activeMeetingId));
    }
    setIsCallActive(false);
  };

  const toggleSidebar = (name: string) => {
    setActiveSidebar(activeSidebar === name ? null : name);
    setShowMoreMenu(false);
  };

  // Google Meet "You left the meeting" screen
  if (!isCallActive) {
    return (
      <div className="fixed inset-0 bg-[#202124] text-white flex flex-col items-center justify-center p-6 font-sans select-none z-50">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#303134] flex items-center justify-center mx-auto shadow-2xl p-3 border border-white/5">
            <GoogleMeetIcon className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-normal text-white">
              You left the meeting
            </h1>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCallActive(true)}
              className="px-6 py-2.5 rounded-full bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Rejoin
            </button>
            <Link
              to="/doctor"
              className="px-6 py-2.5 rounded-full bg-transparent hover:bg-white/10 text-[#8ab4f8] font-medium text-sm transition-all border border-transparent hover:border-white/15"
            >
              Return to home screen
            </Link>
          </div>

          <div className="pt-8 text-xs text-slate-500 space-y-3">
            <div className="flex items-center justify-center gap-4 text-slate-400">
              <span className="hover:underline cursor-pointer">Submit feedback</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#202124] text-white flex flex-col overflow-hidden font-sans select-none z-50">
      
      {/* Top Header Watermark (Minimalist Google Meet Style) */}
      <header className="h-12 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <GoogleMeetIcon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-300 font-mono">
            {meetingCode}
          </span>
        </div>

        {/* Top Right: Clock & User Avatar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400">{currentTime}</span>
          <div className="w-8 h-8 rounded-full bg-[#00796b] text-white flex items-center justify-center text-xs font-medium shadow-xs">
            {participants[0].initials}
          </div>
        </div>
      </header>

      {/* Main Video Stage & Side Panels */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 relative">
        
        {/* Main Video Stage Area */}
        <main className="flex-1 flex flex-col relative rounded-2xl overflow-hidden bg-[#18191b] border border-white/5 shadow-inner">
          
          {/* Captions Overlay */}
          {isCaptionsOn && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-full px-4 text-center pointer-events-none">
              <div className="bg-[#202124]/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-normal text-white inline-block">
                <span className="text-[#8ab4f8] font-medium mr-1.5">{currentUser.name || 'You'}:</span>
                <span>Microphone audio is active. Waiting for others to join...</span>
              </div>
            </div>
          )}

          {/* Screen Sharing Banner */}
          {isScreenSharing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#8ab4f8] text-[#202124] px-4 py-1.5 rounded-full font-medium text-xs shadow-xl flex items-center gap-2">
              <MonitorUp className="w-4 h-4" />
              <span>You are presenting to everyone</span>
              <button
                onClick={() => setIsScreenSharing(false)}
                className="underline hover:text-black font-bold text-xs ml-2 cursor-pointer"
              >
                Stop presenting
              </button>
            </div>
          )}

          {/* Video Grid Tiles */}
          <div className={`w-full h-full p-2 grid gap-3 ${
            participants.length <= 1 
              ? 'grid-cols-1' 
              : participants.length === 2 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            {participants.map((p) => {
              const isSelf = p.id === 'p-self';

              return (
                <div
                  key={p.id}
                  className="relative rounded-2xl overflow-hidden bg-[#3c4043] border border-white/5 flex flex-col justify-between p-3.5 group shadow-lg"
                >
                  {/* Real WebRTC Video or Fallback Canvas */}
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
                    {isSelf && isCamOn ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover transform -scale-x-100 ${hasRealStream ? 'block' : 'hidden'}`}
                        />
                        {!hasRealStream && (
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-24 h-24 rounded-full bg-[#00796b] flex items-center justify-center text-3xl font-medium text-white shadow-2xl">
                              {p.initials}
                            </div>
                          </div>
                        )}
                      </>
                    ) : p.isVideoOn ? (
                      <div className="w-full h-full bg-[#2d2f31] flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-full ${p.avatarColor} flex items-center justify-center text-3xl font-medium text-white shadow-2xl`}>
                          {p.initials}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className={`w-24 h-24 rounded-full ${p.avatarColor} flex items-center justify-center text-3xl font-medium text-white shadow-2xl`}>
                          {p.initials}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tile Top Controls (Shown on hover) */}
                  <div className="flex items-center justify-end z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                      title="Pin to screen"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tile Bottom Name Pill (Google Meet Iconic Pill) */}
                  <div className="flex items-center justify-between z-10 mt-auto">
                    <div className="bg-[#202124]/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-2 border border-white/10 shadow-md">
                      {p.isMuted ? (
                        <div className="w-4 h-4 rounded-full bg-[#ea4335] flex items-center justify-center">
                          <MicOff className="w-2.5 h-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center">
                          <Mic className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <span>{isSelf ? 'You' : p.name}</span>
                    </div>

                    {/* Raised hand indicator if self */}
                    {isSelf && isHandRaised && (
                      <div className="p-1.5 rounded-full bg-[#8ab4f8] text-[#202124] shadow-md animate-bounce">
                        <Hand className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Iconic Google Meet "Your meeting's ready" Card (Bottom-Left Floating) */}
          {showReadyModal && (
            <div className="absolute bottom-4 left-4 z-40 w-80 sm:w-96 bg-[#202124] border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4 animate-slide-up text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-white tracking-tight">Your meeting's ready</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Share this joining info with others that you want in the meeting
                  </p>
                </div>
                <button
                  onClick={() => setShowReadyModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Others Button */}
              <button
                type="button"
                onClick={() => {
                  setShowAddPeopleModal(true);
                  setShowReadyModal(false);
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add others</span>
              </button>

              <div className="text-xs text-slate-400 text-center font-normal">Or share this meeting link with others</div>

              {/* Meeting Link Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#282a2d] border border-white/10 text-xs font-mono">
                <span className="text-slate-300 truncate mr-2">meet.google.com/{meetingCode}</span>
                <button
                  onClick={handleCopyLink}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-white/10 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined as {currentUser.email || 'doctor.anand@hospital.org'}</span>
              </div>
            </div>
          )}

          {/* Google Meet "Add people" Modal */}
          {showAddPeopleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-md bg-[#202124] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up text-white">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-lg font-normal text-white">Add people</h3>
                  <button
                    onClick={() => setShowAddPeopleModal(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddPerson} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">
                      Enter email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        autoFocus
                        value={inviteInput}
                        onChange={(e) => {
                          setInviteInput(e.target.value);
                          if (inviteEmailError) setInviteEmailError(null);
                        }}
                        placeholder="e.g. specialist@hospital.org"
                        className={`w-full pl-3 pr-10 py-2.5 bg-[#282a2d] border ${
                          inviteEmailError ? 'border-rose-500 focus:border-rose-500' : 'border-white/15 focus:ring-1 focus:ring-[#8ab4f8]'
                        } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden transition-colors`}
                      />
                      <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                    {inviteEmailError && (
                      <span className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                        {inviteEmailError}
                      </span>
                    )}
                  </div>

                  {inviteSent && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Invitation sent successfully!</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPeopleModal(false)}
                      className="px-4 py-2 rounded-full text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!inviteInput.trim()}
                      className="px-5 py-2 rounded-full bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] font-medium text-xs transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                      Send email
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        {/* Slide-In Side Drawer (Google Meet Right Panel) */}
        {activeSidebar && (
          <aside className="w-80 md:w-96 rounded-2xl bg-[#282a2d] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-left z-30 shrink-0">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-base font-normal text-white">
                {activeSidebar === 'info' && 'Meeting details'}
                {activeSidebar === 'people' && `People (${participants.length})`}
                {activeSidebar === 'chat' && 'In-call messages'}
                {activeSidebar === 'activities' && 'Activities'}
                {activeSidebar === 'host' && 'Host controls'}
              </h2>
              <button
                onClick={() => setActiveSidebar(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Meeting Details Panel */}
              {activeSidebar === 'info' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="font-medium text-white text-sm mb-1">Joining info</h3>
                    <p className="text-slate-400 select-all font-mono break-all bg-[#202124] p-2.5 rounded-xl border border-white/10">
                      https://meet.google.com/{meetingCode}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2.5 px-3 bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] font-medium rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Joining info copied' : 'Copy joining info'}</span>
                  </button>

                  <div className="pt-3 border-t border-white/10 space-y-2 text-slate-400">
                    <div>
                      <span className="font-medium text-white block">Dial-in numbers:</span>
                      <span className="font-mono text-slate-300">(US) +1 415-555-0199</span>
                    </div>
                    <div>
                      <span className="font-medium text-white block">PIN:</span>
                      <span className="font-mono text-slate-300">884 910 24#</span>
                    </div>
                  </div>
                </div>
              )}

              {/* People / Participants Panel */}
              {activeSidebar === 'people' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowAddPeopleModal(true)}
                    className="w-full py-2.5 px-4 rounded-full border border-white/20 text-[#8ab4f8] hover:bg-white/5 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add people</span>
                  </button>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for people"
                      className="w-full pl-9 pr-3 py-2 bg-[#202124] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-[#8ab4f8]"
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    IN MEETING
                  </div>

                  <div className="space-y-2">
                    {participants.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-[#202124] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${p.avatarColor} flex items-center justify-center font-medium text-white text-xs`}>
                            {p.initials}
                          </div>
                          <div>
                            <div className="font-medium text-white truncate max-w-[150px]">{p.name} {p.id === 'p-self' && '(You)'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.isHost ? 'Meeting host' : p.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          {p.isMuted ? (
                            <MicOff className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Call Messages / Chat Panel */}
              {activeSidebar === 'chat' && (
                <div className="flex flex-col h-full space-y-3">
                  <div className="text-[11px] text-slate-400 bg-[#202124] p-3 rounded-xl text-center border border-white/5 leading-relaxed">
                    Messages can only be seen by people in the call and are deleted when the call ends.
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-xs text-slate-500 py-8">
                        No messages yet
                      </div>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-[#8ab4f8]">{msg.sender}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{msg.time}</span>
                          </div>
                          <div className="p-2.5 bg-[#202124] rounded-xl text-slate-200 border border-white/5 leading-relaxed">
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Send Input */}
                  <form onSubmit={handleSendMessage} className="pt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Send a message"
                        className="w-full pl-3 pr-10 py-2.5 bg-[#202124] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-[#8ab4f8]"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Activities Panel with Live Clinical AI Integration */}
              {activeSidebar === 'activities' && (
                <div className="space-y-4 text-xs">
                  {/* Activities Navigation Pills */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#202124] rounded-xl border border-white/10 text-[10px] font-medium">
                    <button
                      onClick={() => setActivityTab('summary')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activityTab === 'summary' ? 'bg-[#8ab4f8] text-[#202124] font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Decisions
                    </button>
                    <button
                      onClick={() => setActivityTab('transcript')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activityTab === 'transcript' ? 'bg-[#8ab4f8] text-[#202124] font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Transcript
                    </button>
                    <button
                      onClick={() => setActivityTab('recording')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activityTab === 'recording' ? 'bg-[#8ab4f8] text-[#202124] font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Record
                    </button>
                    <button
                      onClick={() => setActivityTab('whiteboard')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activityTab === 'whiteboard' ? 'bg-[#8ab4f8] text-[#202124] font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tools
                    </button>
                  </div>

                  {/* SUB-PANEL 1: AI DECISIONS & VERIFICATION */}
                  {activityTab === 'summary' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#202124] border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#8ab4f8]" />
                            Clinical Decisions Synthesis
                          </span>
                          {summary?.is_clinically_verified ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                              Pending Sign-off
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed bg-[#282a2d] p-2.5 rounded-lg border border-white/5">
                          {summary?.executive_summary || activeMeeting?.summary?.executive_summary || 'Multi-disciplinary tele-ICU conference in progress. Continuous NLP diarization and decision extraction enabled.'}
                        </p>

                        {/* Decisions checklist */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consensus Decisions</span>
                          {(summary?.clinical_decisions || [
                            'Maintain prone positioning protocol for next 16 hours',
                            'Target MAP >65 mmHg with Noradrenaline weaning',
                            'Repeat arterial blood gas and electrolyte panel at 16:00'
                          ]).map((dec, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span>{dec}</span>
                            </div>
                          ))}
                        </div>

                        {/* Verification Button (POST /api/v1/meetings/{id}/summaries/verify) */}
                        {!summary?.is_clinically_verified ? (
                          <button
                            onClick={handleVerifyDecisionsInCall}
                            disabled={isVerifyingSummary}
                            className="w-full mt-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isVerifyingSummary ? 'Verifying...' : 'Verify Clinical Decisions'}</span>
                          </button>
                        ) : (
                          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                            <span>Signed off by attending intensivist at {new Date(summary.verified_at || Date.now()).toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/meetings"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors block text-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Open Tele-ICU Meetings Hub</span>
                      </Link>
                    </div>
                  )}

                  {/* SUB-PANEL 2: SPEECH TRANSCRIPT */}
                  {activityTab === 'transcript' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#202124] border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-[#8ab4f8]" />
                            Live Diarized Speech
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(transcript?.transcript_json?.length || 0)} utterances
                          </span>
                        </div>

                        {/* Transcript turns */}
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-slate-200">
                          {((transcript?.transcript_json || activeMeeting?.transcript?.transcript_json || []).length === 0) ? (
                            <div className="p-4 text-center text-slate-500 text-[11px]">
                              Waiting for acoustic speech input...
                            </div>
                          ) : (
                            (transcript?.transcript_json || activeMeeting?.transcript?.transcript_json || []).map((seg: any, idx: number) => (
                              <div key={idx} className="bg-[#282a2d] p-2 rounded-lg border border-white/5 space-y-0.5">
                                <span className="text-[10px] text-teal-300 font-semibold block">{seg.speaker}:</span>
                                <p className="text-[11px] text-slate-300">{seg.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Speech Ingest form */}
                        <form onSubmit={handleIngestSpeechInCall} className="pt-2 border-t border-white/10 space-y-2">
                          <input
                            type="text"
                            value={speechText}
                            onChange={(e) => setSpeechText(e.target.value)}
                            placeholder="Ingest speech statement..."
                            className="w-full px-2.5 py-1.5 bg-[#282a2d] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#8ab4f8]"
                          />
                          <button
                            type="submit"
                            disabled={!speechText.trim() || isSubmittingSpeech}
                            className="w-full py-1.5 rounded-lg bg-[#8ab4f8] text-[#202124] font-semibold text-xs flex items-center justify-center gap-1 disabled:opacity-40 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isSubmittingSpeech ? 'Ingesting...' : 'Ingest Speech Statement'}</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* SUB-PANEL 3: ENCRYPTED RECORDING */}
                  {activityTab === 'recording' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#202124] border border-white/10 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Circle className="w-3.5 h-3.5 text-[#8ab4f8]" />
                            Encrypted Call Recording
                          </span>
                          {isRecordingOn && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              REC {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400">
                          {isRecordingOn
                            ? 'Call audio/video stream is currently being captured and encrypted with hospital KMS key.'
                            : 'Start session recording to generate HIPAA-compliant encrypted conference archive.'}
                        </p>

                        <button
                          onClick={handleToggleRecordingInCall}
                          className={`w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                            isRecordingOn
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124]'
                          }`}
                        >
                          <Circle className={`w-3.5 h-3.5 ${isRecordingOn ? 'fill-current' : ''}`} />
                          <span>{isRecordingOn ? 'Stop & Save Recording' : 'Start Recording'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-PANEL 4: TOOLS / JAM */}
                  {activityTab === 'whiteboard' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-[#202124] border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-2.5 mb-1 font-medium text-white">
                          <Shapes className="w-4 h-4 text-[#8ab4f8]" />
                          <span>Whiteboarding (Clinical Jam)</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Open a collaborative whiteboard to diagram surgical interventions</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Host Controls Panel */}
              {activeSidebar === 'host' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#202124] border border-white/10 rounded-xl space-y-2">
                    <h3 className="font-medium text-white text-sm">Host management</h3>
                    <p className="text-[11px] text-slate-400">
                      Use these host settings to keep control of your meeting.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>Share their screen</span>
                      <input type="checkbox" defaultChecked className="accent-[#8ab4f8] cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Send chat messages</span>
                      <input type="checkbox" defaultChecked className="accent-[#8ab4f8] cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Turn on their microphone</span>
                      <input type="checkbox" defaultChecked className="accent-[#8ab4f8] cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Turn on their video</span>
                      <input type="checkbox" defaultChecked className="accent-[#8ab4f8] cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Iconic Google Meet Bottom Control Bar (Dock) */}
      <footer className="h-20 px-6 flex items-center justify-between bg-[#202124] z-40 shrink-0">
        
        {/* Left: Meeting Time & Meeting Code */}
        <div className="flex items-center gap-3 w-1/4">
          <span className="text-sm font-medium text-white">{currentTime || '12:12 PM'}</span>
          <span className="text-slate-600">|</span>
          <button
            onClick={handleCopyLink}
            className="text-sm font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Click to copy meeting code"
          >
            <span>{meetingCode}</span>
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

        {/* Center: Google Meet Circular Controls */}
        <div className="flex items-center justify-center gap-3">
          
          {/* Microphone Toggle */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isMicOn
                ? 'bg-[#3c4043] hover:bg-[#434649] text-white'
                : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
            }`}
            title={isMicOn ? 'Turn off microphone (ctrl + d)' : 'Turn on microphone (ctrl + d)'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setIsCamOn(!isCamOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isCamOn
                ? 'bg-[#3c4043] hover:bg-[#434649] text-white'
                : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
            }`}
            title={isCamOn ? 'Turn off camera (ctrl + e)' : 'Turn on camera (ctrl + e)'}
          >
            {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Closed Captions (CC) */}
          <button
            onClick={() => setIsCaptionsOn(!isCaptionsOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isCaptionsOn
                ? 'bg-[#8ab4f8] text-[#202124]'
                : 'bg-[#3c4043] hover:bg-[#434649] text-white'
            }`}
            title={isCaptionsOn ? 'Turn off captions (c)' : 'Turn on captions (c)'}
          >
            <span className="text-xs font-bold">CC</span>
          </button>

          {/* Raise Hand */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isHandRaised
                ? 'bg-[#8ab4f8] text-[#202124]'
                : 'bg-[#3c4043] hover:bg-[#434649] text-white'
            }`}
            title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Present Now / Share Screen */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isScreenSharing
                ? 'bg-[#8ab4f8] text-[#202124]'
                : 'bg-[#3c4043] hover:bg-[#434649] text-white'
            }`}
            title={isScreenSharing ? 'Stop presenting' : 'Present now'}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-11 h-11 rounded-full bg-[#3c4043] hover:bg-[#434649] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Google Meet More Options Popover */}
            {showMoreMenu && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-60 bg-[#282a2d] border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1 text-xs z-50">
                <button
                  onClick={() => {
                    toggleSidebar('activities');
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white flex items-center gap-2 cursor-pointer"
                >
                  <Shapes className="w-4 h-4 text-slate-400" />
                  <span>Whiteboard</span>
                </button>
                <button
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen();
                    } else {
                      document.exitFullscreen();
                    }
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Full screen</span>
                  <Maximize className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    setIsCaptionsOn(!isCaptionsOn);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{isCaptionsOn ? 'Turn off captions' : 'Turn on captions'}</span>
                  <span className="text-[10px] text-slate-400">CC</span>
                </button>
              </div>
            )}
          </div>

          {/* End Call (Red Pill Button) */}
          <button
            onClick={handleLeaveOrConcludeCall}
            className="px-6 py-2.5 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ml-1"
            title="Leave call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Side Drawer Triggers (Info, People, Chat, Activities, Host) */}
        <div className="flex items-center justify-end gap-1.5 w-1/4">
          
          {/* Info Button */}
          <button
            onClick={() => toggleSidebar('info')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeSidebar === 'info' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Meeting details"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* People Button */}
          <button
            onClick={() => toggleSidebar('people')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
              activeSidebar === 'people' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="People"
          >
            <Users className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 text-[9px] font-medium px-1 rounded-full bg-slate-700 text-white">
              {participants.length}
            </span>
          </button>

          {/* Chat Button */}
          <button
            onClick={() => toggleSidebar('chat')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
              activeSidebar === 'chat' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Chat with everyone"
          >
            <MessageSquare className="w-5 h-5" />
            {chatMessages.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8ab4f8]" />
            )}
          </button>

          {/* Activities Button */}
          <button
            onClick={() => toggleSidebar('activities')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeSidebar === 'activities' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Activities"
          >
            <Shapes className="w-5 h-5" />
          </button>

          {/* Host Controls */}
          <button
            onClick={() => toggleSidebar('host')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeSidebar === 'host' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Host controls"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DoctorMeetPage;
