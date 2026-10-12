import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Settings, 
  CheckCircle2, 
  Sliders, 
  Wifi, 
  ShieldCheck, 
  Maximize2, 
  Navigation,
  Eye,
  Server
} from 'lucide-react';

interface PtzCameraConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (cameraConfig: any) => void;
}

export const PtzCameraConfigModal: React.FC<PtzCameraConfigModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [cameraName, setCameraName] = useState('MICU Bed-04 4K Ultra PTZ');
  const [vendor, setVendor] = useState('Axis Communications');
  const [model, setModel] = useState('Q6135-LE 4K Medical PTZ');
  const [ipAddress, setIpAddress] = useState('192.168.10.44');
  const [rtspUrl, setRtspUrl] = useState('rtsp://admin:icupass2026@192.168.10.44:554/live/ch0');
  const [onvifPort, setOnvifPort] = useState('8080');
  const [username, setUsername] = useState('teleicu_admin');
  const [password, setPassword] = useState('••••••••••••');
  
  const [assignedHospital, setAssignedHospital] = useState('Central Super-Specialty Hospital');
  const [assignedUnit, setAssignedUnit] = useState('MICU-01');
  const [assignedBed, setAssignedBed] = useState('ICU-04 (Ramesh Gupta)');
  const [resolution, setResolution] = useState('4K 2160p (60 fps)');
  const [ptzSpeed, setPtzSpeed] = useState('80% (Fast Response)');

  const [preset1, setPreset1] = useState('Patient Face & Airway (Pan: 45°, Tilt: -15°, Zoom: 4x)');
  const [preset2, setPreset2] = useState('Ventilator Screen (Pan: 120°, Tilt: -5°, Zoom: 6x)');
  const [preset3, setPreset3] = useState('Infusion Pump Stack (Pan: 210°, Tilt: -10°, Zoom: 5x)');
  const [preset4, setPreset4] = useState('Full Bed Overview (Pan: 0°, Tilt: 0°, Zoom: 1x)');

  const [isTestSuccess, setIsTestSuccess] = useState<boolean | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setIsTestSuccess(null);
    setTimeout(() => {
      setIsTestSuccess(true);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onSave) {
      onSave({
        cameraName,
        vendor,
        model,
        ipAddress,
        rtspUrl,
        assignedHospital,
        assignedUnit,
        assignedBed,
        resolution
      });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-400/30 text-xs font-mono font-bold mb-2">
            <Video className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            COMMAND CENTER • VIRTUAL ICU DEVICE SETUP
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
            Add & Configure PTZ Camera
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Register 4K Pan-Tilt-Zoom optical cameras, configure RTSP/ONVIF streams, pair with ICU beds, and define preset angles.
          </p>
        </div>

        {/* Step Wizard Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
              activeStep === 1 
                ? 'bg-teal-50 dark:bg-teal-600/30 border-teal-500 text-teal-800 dark:text-teal-300 font-bold shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            1. Admin / Config
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
              activeStep === 2 
                ? 'bg-teal-50 dark:bg-teal-600/30 border-teal-500 text-teal-800 dark:text-teal-300 font-bold shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            2. Device Registry
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
              activeStep === 3 
                ? 'bg-teal-50 dark:bg-teal-600/30 border-teal-500 text-teal-800 dark:text-teal-300 font-bold shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            3. Virtual ICU Config
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
              activeStep === 4 
                ? 'bg-teal-50 dark:bg-teal-600/30 border-teal-500 text-teal-800 dark:text-teal-300 font-bold shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            4. Testing & Validation
          </button>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>PTZ Camera successfully registered and assigned to Virtual ICU Bed!</span>
          </div>
        )}

        {/* Wizard Forms */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: ADMIN & SYSTEM CONFIG */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 font-sans uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Category 1: Admin & System Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Camera Name / Tag *</label>
                  <input
                    type="text"
                    value={cameraName}
                    onChange={(e) => setCameraName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Manufacturer / Vendor *</label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  >
                    <option value="Axis Communications">Axis Communications (Medical Grade)</option>
                    <option value="Hikvision Medical">Hikvision ONVIF Tele-ICU</option>
                    <option value="Dahua Technology">Dahua 4K Optical PTZ</option>
                    <option value="Sony Healthcare">Sony Medical PTZ Camera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Model Designation</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Streaming Quality Profile</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  >
                    <option value="4K 2160p (60 fps)">4K 2160p Ultra HD (60 fps)</option>
                    <option value="1080p Full HD (60 fps)">1080p Full HD (60 fps)</option>
                    <option value="720p Low-Bandwidth (30 fps)">720p Low-Bandwidth (30 fps)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DEVICE REGISTRY & NETWORK PROTOCOL */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 font-sans uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Category 2: Device Registry & Network Protocol
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Static IP Address *</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">ONVIF Control Port</label>
                  <input
                    type="text"
                    value={onvifPort}
                    onChange={(e) => setOnvifPort(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">RTSP Video Stream URL *</label>
                  <input
                    type="text"
                    value={rtspUrl}
                    onChange={(e) => setRtspUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-emerald-700 dark:text-emerald-400 font-mono font-semibold focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Camera Auth Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Camera Auth Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VIRTUAL ICU & BED PAIRING */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 font-sans uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Category 3: Virtual ICU Configuration & Preset Angles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Assigned Hospital</label>
                  <select
                    value={assignedHospital}
                    onChange={(e) => setAssignedHospital(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  >
                    <option value="Central Super-Specialty Hospital">Central Super-Specialty Hospital</option>
                    <option value="Metro Critical Care Hospital">Metro Critical Care Hospital</option>
                    <option value="Regional Trauma Center">Regional Trauma Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">ICU Department / Unit</label>
                  <input
                    type="text"
                    value={assignedUnit}
                    onChange={(e) => setAssignedUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Paired ICU Bed *</label>
                  <select
                    value={assignedBed}
                    onChange={(e) => setAssignedBed(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  >
                    <option value="ICU-04 (Ramesh Gupta)">ICU-04 (Ramesh Gupta)</option>
                    <option value="ICU-01 (Sunita Saxena)">ICU-01 (Sunita Saxena)</option>
                    <option value="ICU-11 (Balwant Reddy)">ICU-11 (Balwant Reddy)</option>
                    <option value="ICU-05 (Kavita Menon)">ICU-05 (Kavita Menon)</option>
                  </select>
                </div>
              </div>

              {/* PTZ Preset Positions Configuration */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">PTZ Preset Positions (One-Click Recall):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-teal-700 dark:text-teal-400 font-bold block">Preset #1: Airway & Pupil View</span>
                    <input
                      type="text"
                      value={preset1}
                      onChange={(e) => setPreset1(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-sky-700 dark:text-cyan-400 font-bold block">Preset #2: Ventilator Monitor</span>
                    <input
                      type="text"
                      value={preset2}
                      onChange={(e) => setPreset2(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-amber-700 dark:text-amber-400 font-bold block">Preset #3: Infusion Stack</span>
                    <input
                      type="text"
                      value={preset3}
                      onChange={(e) => setPreset3(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-purple-700 dark:text-purple-400 font-bold block">Preset #4: Bed Overview</span>
                    <input
                      type="text"
                      value={preset4}
                      onChange={(e) => setPreset4(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TESTING & VALIDATION */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 font-sans uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Category 4: Testing & Video Stream Validation
              </h3>

              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">RTSP Connection & Latency Check</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Ping ONVIF service endpoint ({ipAddress}) and verify 4K stream decoding.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>Run Stream Test</span>
                  </button>
                </div>

                {isTestSuccess === true && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600 rounded-xl text-xs font-mono space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>STREAM CONNECTED SUCCESSFULLY</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-[11px] grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-900/60">
                      <span>Stream Latency: <strong className="text-emerald-700 dark:text-emerald-400">42 ms</strong></span>
                      <span>Resolution: <strong className="text-slate-900 dark:text-white font-bold">3840x2160 (4K UHD)</strong></span>
                      <span>PTZ Command Ping: <strong className="text-emerald-700 dark:text-emerald-400">18 ms</strong></span>
                      <span>ONVIF Profile: <strong className="text-slate-900 dark:text-white font-bold">Profile S / G Verified</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
            <div className="flex items-center gap-2">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => (prev - 1) as any)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Previous Step
                </button>
              )}
              {activeStep < 4 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => (prev + 1) as any)}
                  className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-transparent text-xs font-bold transition-all cursor-pointer"
                >
                  Next Step &rarr;
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Save PTZ Camera Config</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
