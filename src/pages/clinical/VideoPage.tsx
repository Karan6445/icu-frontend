import React, { useState } from 'react';
import { 
  Video, 
  Camera, 
  Grid, 
  ShieldAlert, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Sliders, 
  Wifi, 
  WifiOff, 
  Search, 
  Lock,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface CameraFeed {
  id: string;
  cameraId: string;
  bedId: string;
  unitId: string;
  patientName: string;
  patientId: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  ipAddress: string;
  model: string;
  resolution: string;
  fps: number;
  latencyMs: number;
  privacyMode: boolean;
  tokenExpiresIn: string;
}

export const VideoPage: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<'2x2' | '3x3' | '1x1'>('2x2');
  const [icuFilter, setIcuFilter] = useState('ALL');
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);

  const [cameras, setCameras] = useState<CameraFeed[]>([
    {
      id: 'CAM-01',
      cameraId: 'AXIS-PTZ-MICU-04',
      bedId: 'BED-04',
      unitId: 'MICU-01',
      patientName: 'Rahul Sharma',
      patientId: 'P-1024',
      status: 'ONLINE',
      ipAddress: '10.42.1.84',
      model: 'Axis Q6135-LE 1080p PTZ',
      resolution: '1920x1080',
      fps: 30,
      latencyMs: 38,
      privacyMode: false,
      tokenExpiresIn: '14m 12s'
    },
    {
      id: 'CAM-02',
      cameraId: 'AXIS-PTZ-MICU-02',
      bedId: 'BED-02',
      unitId: 'MICU-01',
      patientName: 'Sunita Patel',
      patientId: 'P-1025',
      status: 'ONLINE',
      ipAddress: '10.42.1.82',
      model: 'Axis Q6135-LE 1080p PTZ',
      resolution: '1920x1080',
      fps: 30,
      latencyMs: 44,
      privacyMode: false,
      tokenExpiresIn: '14m 12s'
    },
    {
      id: 'CAM-03',
      cameraId: 'AXIS-PTZ-MICU-07',
      bedId: 'BED-07',
      unitId: 'MICU-01',
      patientName: 'Rajesh Sharma',
      patientId: 'P-1027',
      status: 'ONLINE',
      ipAddress: '10.42.1.87',
      model: 'Axis Q6135-LE 1080p PTZ',
      resolution: '1920x1080',
      fps: 30,
      latencyMs: 35,
      privacyMode: false,
      tokenExpiresIn: '14m 12s'
    },
    {
      id: 'CAM-04',
      cameraId: 'AXIS-PTZ-MICU-09',
      bedId: 'BED-09',
      unitId: 'MICU-01',
      patientName: 'Meena Iyer',
      patientId: 'P-1029',
      status: 'WARNING',
      ipAddress: '10.42.1.89',
      model: 'Axis Q6135-LE 1080p PTZ',
      resolution: '1280x720 (Downscaled)',
      fps: 20,
      latencyMs: 142,
      privacyMode: false,
      tokenExpiresIn: '14m 12s'
    },
    {
      id: 'CAM-05',
      cameraId: 'AXIS-PTZ-SICU-01',
      bedId: 'BED-01',
      unitId: 'SICU-01',
      patientName: 'Kavita Rao',
      patientId: 'P-1030',
      status: 'ONLINE',
      ipAddress: '10.42.2.81',
      model: 'Axis Q6135-LE 1080p PTZ',
      resolution: '1920x1080',
      fps: 30,
      latencyMs: 40,
      privacyMode: true,
      tokenExpiresIn: '14m 12s'
    },
    {
      id: 'CAM-06',
      cameraId: 'AXIS-PTZ-CICU-03',
      bedId: 'BED-03',
      unitId: 'CICU-01',
      patientName: 'Anand Kulkarni',
      patientId: 'P-1031',
      status: 'ONLINE',
      ipAddress: '10.42.3.83',
      model: 'Axis Q6135-LE 1080p PTZ',
      resolution: '1920x1080',
      fps: 30,
      latencyMs: 39,
      privacyMode: false,
      tokenExpiresIn: '14m 12s'
    }
  ]);

  const togglePrivacy = (id: string) => {
    setCameras(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.privacyMode;
        alert(`[AUDIT] Camera privacy shutter ${nextState ? 'ACTIVATED (Feed Blinded)' : 'DEACTIVATED'} for ${c.bedId}. Logged in security trail.`);
        return { ...c, privacyMode: nextState };
      }
      return c;
    }));
  };

  const filteredCameras = cameras.filter(c => {
    if (icuFilter !== 'ALL' && c.unitId !== icuFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 21: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-900 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 21
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              VMS Video Management Service · RTSP / WebRTC Secure Gateway
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Clinical Video Command Center & PTZ Surveillance</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Ultra low-latency video wall matrix, hardware pan/tilt/zoom, audit-logged privacy shutters & clinical evidence tagging.
          </p>
        </div>

        {/* Video Wall Controls */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['2x2', '3x3', '1x1'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  layoutMode === mode
                    ? 'bg-teal-700 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode} Wall
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-slate-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>WebRTC TLS 1.3 Encrypted</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs font-mono font-bold shadow-2xs">
        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] mr-1">ICU FILTER:</span>
        {['ALL', 'MICU-01', 'SICU-01', 'CICU-01'].map(unit => (
          <button
            key={unit}
            onClick={() => setIcuFilter(unit)}
            className={`px-3 py-1 rounded-lg transition-all ${
              icuFilter === unit
                ? 'bg-teal-700 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {unit}
          </button>
        ))}
      </div>

      {/* CAMERA GRID */}
      <div className={`grid gap-4 ${
        layoutMode === '1x1' ? 'grid-cols-1' : layoutMode === '2x2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {filteredCameras.map((cam) => (
          <div
            key={cam.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-teal-400 dark:hover:border-teal-500/80 transition-all duration-200"
          >
            {/* Camera Header Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {cam.bedId}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{cam.patientName}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                  cam.status === 'ONLINE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                }`}>
                  {cam.status} ({cam.latencyMs}ms)
                </span>
                <button
                  onClick={() => togglePrivacy(cam.id)}
                  className={`p-1 rounded-lg transition-colors ${
                    cam.privacyMode
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={cam.privacyMode ? 'Privacy Shutter ON (Blinded)' : 'Enable Privacy Shutter'}
                >
                  {cam.privacyMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Video Viewport / Canvas Simulation */}
            <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              {cam.privacyMode ? (
                <div className="text-center font-mono space-y-2 p-6">
                  <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-rose-300 block">PRIVACY SHUTTER ACTIVE</span>
                  <span className="text-[10px] text-slate-500 block">Clinical procedure in progress · Video stream obscured</span>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Subtle Grid / Patient silhouette */}
                  <div className="absolute inset-0 bg-radial-at-c from-slate-900/60 to-black pointer-events-none" />
                  <div className="text-center font-mono space-y-1">
                    <Camera className="w-8 h-8 text-teal-400/40 mx-auto animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-bold block">{cam.model}</span>
                    <span className="text-[9px] text-slate-600 block">{cam.ipAddress} · {cam.resolution} @ {cam.fps}fps</span>
                  </div>

                  {/* PTZ Preset Buttons Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[10px] font-mono text-slate-400">
                    <span className="text-teal-300 font-bold">PTZ PRESET: BED OVERHEAD</span>
                    <div className="flex items-center gap-1.5">
                      <button className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">Pan ◄</button>
                      <button className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">Pan ►</button>
                      <button className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">Zoom In</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Token TTL: <strong className="text-amber-600 dark:text-amber-400">{cam.tokenExpiresIn}</strong></span>
              <button
                onClick={() => alert(`Full PTZ diagnostic stream launched for ${cam.bedId}.`)}
                className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-bold flex items-center gap-1"
              >
                <span>Full Stream</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;
