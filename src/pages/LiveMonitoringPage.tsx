import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, CartesianGrid } from 'recharts';
import {
  Activity,
  Play,
  Pause,
  Heart,
  Zap,
  Radio,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Plus,
  RefreshCw,
  X,
  Check,
  Copy,
  Settings,
  Waves,
  Bell,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMonitoringRulesThunk,
  createMonitoringRuleThunk,
  updateMonitoringRuleThunk,
  ingestTelemetryThunk,
  fetchLatestTelemetryThunk,
  setSelectedBedId,
  clearMonitoringAlerts,
} from '../store/slices/monitoringSlice';
import {
  MonitoringRuleResponse,
  MonitoringParameterName,
  MonitoringSeverity,
  TelemetryMetricType,
  DEFAULT_MONITORING_BED_UUID,
  DEFAULT_MONITORING_ICU_UUID,
} from '../api/monitoringApi';
import { MOCK_PATIENTS } from '../data/mockData';
import { bedApi } from '../api/bedApi';

export const LiveMonitoringPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    rules,
    isLoadingRules,
    isUpdatingRule,
    isCreatingRule,
    isIngestingTelemetry,
    isLoadingTelemetry,
    latestTelemetryByMetric,
    selectedBedId,
    selectedIcuId,
    error,
    successMessage,
    lastTelemetryTimestamp,
  } = useAppSelector((state) => state.monitoring);

  // Local Monitor Controls
  const [selectedBed, setSelectedBed] = useState('ICU-04');
  const [isLive, setIsLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [sweepSpeed, setSweepSpeed] = useState<'25mm/s' | '50mm/s'>('25mm/s');
  const [activeTab, setActiveTab] = useState<'WAVEFORMS' | 'RULES'>('WAVEFORMS');

  // Backend Beds list
  const [availableBeds, setAvailableBeds] = useState<Array<{ id: string; bedNumber: string }>>([
    { id: DEFAULT_MONITORING_BED_UUID, bedNumber: 'BED-01' },
    { id: '4d97e6e2-e4a4-41f0-95b2-428f7e80de88', bedNumber: 'BED-02' },
  ]);

  // Modals
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<MonitoringRuleResponse | null>(null);

  // Edit Rule Form State
  const [editLowerLimit, setEditLowerLimit] = useState<string>('');
  const [editUpperLimit, setEditUpperLimit] = useState<string>('');
  const [editSeverity, setEditSeverity] = useState<MonitoringSeverity>('WARNING');
  const [editSustained, setEditSustained] = useState<string>('10');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Create Rule Form State
  const [newParamName, setNewParamName] = useState<MonitoringParameterName>('HEART_RATE');
  const [newLowerLimit, setNewLowerLimit] = useState<string>('50');
  const [newUpperLimit, setNewUpperLimit] = useState<string>('120');
  const [newSeverity, setNewSeverity] = useState<MonitoringSeverity>('WARNING');
  const [newSustained, setNewSustained] = useState<string>('10');

  // Telemetry Simulator Form State
  const [simMetricType, setSimMetricType] = useState<TelemetryMetricType>('ECG_LEAD_II');
  const [simSampleRate, setSimSampleRate] = useState<number>(100);
  const [simQuality, setSimQuality] = useState<number>(98);
  const [simPreset, setSimPreset] = useState<'NORMAL' | 'TACHYCARDIA' | 'BRADYCARDIA' | 'PVC'>('NORMAL');

  // Load backend beds & initial rules
  useEffect(() => {
    bedApi
      .list(selectedIcuId)
      .then((res: any) => {
        if (res.data && res.data.length > 0) {
          setAvailableBeds(
            res.data.map((b: any) => ({
              id: b.id,
              bedNumber: b.bed_number || b.bedNumber || 'BED',
            }))
          );
        }
      })
      .catch(() => {});

    dispatch(fetchMonitoringRulesThunk({ icu_id: selectedIcuId }));
  }, [dispatch, selectedIcuId]);

  // Poll latest telemetry from backend every 4 seconds for active bed
  useEffect(() => {
    if (!isLive) return;

    const fetchTelemetrySnapshots = () => {
      dispatch(fetchLatestTelemetryThunk({ bed_id: selectedBedId, metric_type: 'ECG_LEAD_II' }));
      dispatch(fetchLatestTelemetryThunk({ bed_id: selectedBedId, metric_type: 'PLETH' }));
      dispatch(fetchLatestTelemetryThunk({ bed_id: selectedBedId, metric_type: 'RESP_WAVE' }));
    };

    fetchTelemetrySnapshots();
    const interval = setInterval(fetchTelemetrySnapshots, 4000);
    return () => clearInterval(interval);
  }, [dispatch, selectedBedId, isLive]);

  // Live waveform continuous sweeping timer (high-resolution CRT scan)
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, sweepSpeed === '50mm/s' ? 60 : 120);
    return () => clearInterval(interval);
  }, [isLive, sweepSpeed]);

  // Generate 60 high-fidelity telemetry points combining backend values with continuous live sweeping
  const waveformData = useMemo(() => {
    const ecgTelemetry = latestTelemetryByMetric['ECG_LEAD_II']?.values_array || [];
    const plethTelemetry = latestTelemetryByMetric['PLETH']?.values_array || [];
    const respTelemetry = latestTelemetryByMetric['RESP_WAVE']?.values_array || [];

    return Array.from({ length: 60 }, (_, i) => {
      const step = (i + tick * 0.8) % 20;

      // 1. Realistic ECG Lead II Waveform (P-Q-R-S-T) with backend calibration
      let ecg = 50;
      if (ecgTelemetry.length > 0) {
        const val = ecgTelemetry[i % ecgTelemetry.length];
        ecg = val ? Number(val) : 50;
      } else {
        if (step > 2 && step <= 4) ecg = 62;
        else if (step > 4 && step <= 5) ecg = 35;
        else if (step > 5 && step <= 7) ecg = 160;
        else if (step > 7 && step <= 8) ecg = 20;
        else if (step > 11 && step <= 14) ecg = 78;
        else ecg = 50 + (Math.random() * 2 - 1);
      }

      // 2. Realistic SpO2 Plethysmography Pulse (Systolic Peak, Dicrotic Notch)
      let spo2 = 20;
      if (plethTelemetry.length > 0) {
        const val = plethTelemetry[i % plethTelemetry.length];
        spo2 = val ? Number(val) : 20;
      } else {
        if (step > 6 && step <= 9) spo2 = 20 + (step - 6) * 25;
        else if (step > 9 && step <= 11) spo2 = 95 - (step - 9) * 15;
        else if (step > 11 && step <= 13) spo2 = 65 + Math.sin(step) * 6;
        else if (step > 13 && step <= 18) spo2 = 65 - (step - 13) * 9;
        else spo2 = 20 + (Math.random() * 1.5 - 0.75);
      }

      // 3. Smooth Respiratory Wave (Sinusoidal Transthoracic Impedance)
      let resp = 50;
      if (respTelemetry.length > 0) {
        const val = respTelemetry[i % respTelemetry.length];
        resp = val ? Number(val) : 50;
      } else {
        const respPhase = (((i + tick * 0.4) % 40) / 40) * Math.PI * 2;
        resp = 50 + Math.sin(respPhase) * 35;
      }

      return {
        time: `${i}`,
        ecg,
        spo2,
        resp,
      };
    });
  }, [tick, latestTelemetryByMetric]);

  const currentPatient =
    MOCK_PATIENTS.find((p) => p.bedNumber === selectedBed) || MOCK_PATIENTS[0];
  const vitals = currentPatient.vitals;

  // Handle Edit Rule Modal Open
  const handleOpenEditRule = (rule: MonitoringRuleResponse) => {
    setSelectedRule(rule);
    setEditLowerLimit(rule.lower_limit !== null && rule.lower_limit !== undefined ? String(rule.lower_limit) : '');
    setEditUpperLimit(rule.upper_limit !== null && rule.upper_limit !== undefined ? String(rule.upper_limit) : '');
    setEditSeverity(rule.severity || 'WARNING');
    setEditSustained(String(rule.sustained_seconds || 10));
    setEditIsActive(rule.is_active);
    setIsEditRuleModalOpen(true);
  };

  // Submit Rule Update (PUT /api/v1/monitoring/rules/{rule_id})
  const handleSaveRuleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;

    await dispatch(
      updateMonitoringRuleThunk({
        ruleId: selectedRule.id,
        payload: {
          lower_limit: editLowerLimit.trim() ? Number(editLowerLimit) : null,
          upper_limit: editUpperLimit.trim() ? Number(editUpperLimit) : null,
          severity: editSeverity,
          sustained_seconds: Number(editSustained) || 10,
          is_active: editIsActive,
        },
      })
    );
    setIsEditRuleModalOpen(false);
  };

  // Submit New Rule (POST /api/v1/monitoring/rules)
  const handleSaveNewRule = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      createMonitoringRuleThunk({
        icu_id: selectedIcuId,
        parameter_name: newParamName,
        lower_limit: newLowerLimit.trim() ? Number(newLowerLimit) : null,
        upper_limit: newUpperLimit.trim() ? Number(newUpperLimit) : null,
        severity: newSeverity,
        sustained_seconds: Number(newSustained) || 10,
        is_active: true,
      })
    );
    setIsCreateRuleModalOpen(false);
  };

  // Ingest Telemetry Packet (POST /api/v1/monitoring/telemetry)
  const handleSimulateTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();

    let values: number[] = [];
    if (simMetricType === 'ECG_LEAD_II') {
      if (simPreset === 'TACHYCARDIA') {
        values = [40, 60, 30, 180, 15, 60, 90, 45, 175, 20, 55, 85];
      } else if (simPreset === 'BRADYCARDIA') {
        values = [50, 50, 50, 60, 35, 150, 20, 75, 50, 50, 50, 50, 50, 50, 50];
      } else {
        values = [50, 52, 60, 40, 160, 20, 50, 75, 50, 50, 51, 50];
      }
    } else if (simMetricType === 'PLETH') {
      values = [20, 25, 60, 95, 80, 68, 72, 60, 35, 22, 20, 20];
    } else if (simMetricType === 'RESP_WAVE') {
      values = [30, 42, 58, 72, 80, 75, 55, 38, 25, 20, 24, 30];
    } else {
      values = [80, 85, 110, 125, 105, 95, 88, 82, 80, 79];
    }

    await dispatch(
      ingestTelemetryThunk({
        bed_id: selectedBedId,
        patient_id: currentPatient.id,
        metric_type: simMetricType,
        sample_rate_hz: simSampleRate,
        values_array: values,
        quality_indicator: simQuality,
        recorded_at: new Date().toISOString(),
      })
    );
    setIsSimulatorModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans pb-12 selection:bg-teal-500 selection:text-white">
      {/* Top Header Controls Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight font-sans">
              Real-Time High-Fidelity Waveform Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE TELEMETRY STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Continuous EKG Lead II, SpO2 Plethysmography (PPG), and Transthoracic Impedance Respiratory Waveforms.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Telemetry Simulator Button */}
          <button
            type="button"
            onClick={() => setIsSimulatorModalOpen(true)}
            className="px-3.5 py-2 rounded-xl font-mono text-xs font-bold bg-teal-600/30 hover:bg-teal-600/40 text-teal-300 border border-teal-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Ingest Bedside Device Waveform Telemetry"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Ingest Telemetry (POST)</span>
          </button>

          {/* Manage Rules Button */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'RULES' ? 'WAVEFORMS' : 'RULES')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'RULES'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Alarm Rules ({rules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
              showGrid
                ? 'bg-slate-800 text-teal-400 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            GRID: {showGrid ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setSweepSpeed((prev) => (prev === '25mm/s' ? '50mm/s' : '25mm/s'))}
            className="px-3 py-2 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
          >
            SWEEP: {sweepSpeed}
          </button>

          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              isLive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
                : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/40'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isLive ? 'PAUSE TELEMETRY' : 'RESUME STREAM'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearMonitoringAlerts())}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearMonitoringAlerts())}
            className="text-rose-600 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bed Selection Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
        {MOCK_PATIENTS.slice(0, 6).map((p, idx) => {
          const isSelected = selectedBed === p.bedNumber;
          const assignedBed = availableBeds[idx % availableBeds.length];

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedBed(p.bedNumber);
                if (assignedBed?.id) {
                  dispatch(setSelectedBedId(assignedBed.id));
                }
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all min-w-[160px] cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-500 shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="font-mono">{p.bedNumber}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    p.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="font-bold text-sm truncate mt-1">{p.name}</div>
              <div className="text-[10px] opacity-80 font-mono mt-0.5 flex items-center justify-between">
                <span>SpO2: {String(p.vitals.spo2.value)}%</span>
                <span>HR: {String(p.vitals.hr.value)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= VIEW 1: REAL-TIME WAVEFORM MONITOR ================= */}
      {activeTab === 'WAVEFORMS' && (
        <div className="bg-[#050811] p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden font-sans">
          {/* CRT Scanline Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent pointer-events-none opacity-30 animate-pulse" />

          {/* Selected Patient Telemetry Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-800 text-teal-400 font-mono font-bold text-xs rounded-xl border border-slate-700 shadow-xs">
                {currentPatient.bedNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white font-sans">{currentPatient.name}</h2>
                  <span className="text-[10px] font-mono text-slate-400">
                    MRN: {currentPatient.mrn} • {currentPatient.admittingDiagnosis}
                  </span>
                </div>
              </div>
            </div>

            {/* Signal Quality & Telemetry Sync Status */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold text-[11px] tracking-wide">
                  SIGNAL QUALITY: 99.4% (GOOD)
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Latest Telemetry: {lastTelemetryTimestamp}
              </div>
            </div>
          </div>

          {/* WAVEFORM CHANNEL 1: ECG LEAD II (mV) */}
          <div className="space-y-2 relative z-10 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-extrabold tracking-wider">
                  ECG LEAD II (mV)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  GAIN: 10mm/mV • FILTER: 0.5-40Hz • SAMPLE: 100Hz
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-emerald-400 font-black font-mono text-3xl tracking-tight">
                  {String(vitals.hr.value)}
                </span>
                <span className="text-emerald-500 text-xs font-bold">BPM</span>
              </div>
            </div>

            <div className="h-[140px] min-h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waveformData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />}
                  <YAxis hide domain={[0, 180]} />
                  <Line
                    type="monotone"
                    dataKey="ecg"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WAVEFORM CHANNEL 2: SpO2 PLETHYSMOGRAPHY (%) */}
          <div className="space-y-2 relative z-10 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-extrabold tracking-wider">
                  SpO2 PLETHYSMOGRAPHY (%)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  PERFUSION INDEX: 4.8% • PPG SENSOR ONLINE
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-cyan-400 font-black font-mono text-3xl tracking-tight">
                  {String(vitals.spo2.value)}%
                </span>
                <span className="text-cyan-500 text-xs font-bold">SpO2</span>
              </div>
            </div>

            <div className="h-[140px] min-h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waveformData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />}
                  <YAxis hide domain={[0, 110]} />
                  <Line
                    type="monotone"
                    dataKey="spo2"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WAVEFORM CHANNEL 3: RESPIRATORY WAVE (RESP / min) */}
          <div className="space-y-2 relative z-10 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-extrabold tracking-wider">
                  RESPIRATORY WAVE (RESP / min)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  IMPEDANCE PNEUMOGRAPHY
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-amber-400 font-black font-mono text-3xl tracking-tight">
                  {String(vitals.rr.value)}
                </span>
                <span className="text-amber-500 text-xs font-bold">RPM</span>
              </div>
            </div>

            <div className="h-[120px] min-h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waveformData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />}
                  <YAxis hide domain={[0, 100]} />
                  <Line
                    type="monotone"
                    dataKey="resp"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: MONITORING ALARM RULES PANEL ================= */}
      {activeTab === 'RULES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Physiological Monitoring Alarm Rules
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Active clinical thresholds, sustained duration debounce, and alert severity matrices configured in ICU.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => dispatch(fetchMonitoringRulesThunk({ icu_id: selectedIcuId }))}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Refresh Rules"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingRules ? 'animate-spin text-teal-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsCreateRuleModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Alarm Rule</span>
              </button>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => {
              const severityColor =
                rule.severity === 'LIFE_THREATENING'
                  ? 'bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-800'
                  : rule.severity === 'CRITICAL'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-200 dark:border-rose-900'
                  : rule.severity === 'WARNING'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800'
                  : 'bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800';

              return (
                <div
                  key={rule.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:border-teal-500/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                      {rule.parameter_name.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border uppercase ${severityColor}`}
                    >
                      {rule.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">LOWER LIMIT</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {rule.lower_limit !== null && rule.lower_limit !== undefined
                          ? rule.lower_limit
                          : 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">UPPER LIMIT</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {rule.upper_limit !== null && rule.upper_limit !== undefined
                          ? rule.upper_limit
                          : 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-mono">
                      Debounce: <strong>{rule.sustained_seconds}s</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        rule.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {rule.is_active ? '● Active' : '○ Disabled'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditRule(rule)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Edit Alarm Rule</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: EDIT MONITORING ALARM RULE (PUT) ================= */}
      {isEditRuleModalOpen && selectedRule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold uppercase">
                  PUT /api/v1/monitoring/rules/{selectedRule.id.slice(0, 8)}...
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Update Monitoring Alarm Rule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditRuleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRuleUpdate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Parameter Name
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedRule.parameter_name}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Lower Limit
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editLowerLimit}
                    onChange={(e) => setEditLowerLimit(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Upper Limit
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editUpperLimit}
                    onChange={(e) => setEditUpperLimit(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Alert Severity
                </label>
                <select
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(e.target.value as MonitoringSeverity)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="LIFE_THREATENING">LIFE_THREATENING</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Sustained Duration (Seconds)
                </label>
                <input
                  type="number"
                  value={editSustained}
                  onChange={(e) => setEditSustained(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enable Active Alarm Monitoring
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRule}
                  className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold transition shadow-md flex items-center gap-2"
                >
                  {isUpdatingRule && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CREATE MONITORING ALARM RULE (POST) ================= */}
      {isCreateRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold uppercase">
                  POST /api/v1/monitoring/rules
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Add Monitoring Alarm Rule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRuleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRule} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Parameter Name
                </label>
                <select
                  value={newParamName}
                  onChange={(e) => setNewParamName(e.target.value as MonitoringParameterName)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="HEART_RATE">HEART_RATE (BPM)</option>
                  <option value="SPO2">SPO2 (%)</option>
                  <option value="SYSTOLIC_BP">SYSTOLIC_BP (mmHg)</option>
                  <option value="DIASTOLIC_BP">DIASTOLIC_BP (mmHg)</option>
                  <option value="MAP">MAP (Mean Arterial Pressure)</option>
                  <option value="RESPIRATORY_RATE">RESPIRATORY_RATE (RPM)</option>
                  <option value="TEMPERATURE_CELSIUS">TEMPERATURE_CELSIUS (°C)</option>
                  <option value="ETCO2">ETCO2 (mmHg)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Lower Limit
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newLowerLimit}
                    onChange={(e) => setNewLowerLimit(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Upper Limit
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newUpperLimit}
                    onChange={(e) => setNewUpperLimit(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Alert Severity
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as MonitoringSeverity)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="LIFE_THREATENING">LIFE_THREATENING</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Sustained Duration (Seconds)
                </label>
                <input
                  type="number"
                  value={newSustained}
                  onChange={(e) => setNewSustained(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRule}
                  className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold transition shadow-md flex items-center gap-2"
                >
                  {isCreatingRule && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Create Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: INGEST TELEMETRY SIMULATOR (POST) ================= */}
      {isSimulatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold uppercase">
                  POST /api/v1/monitoring/telemetry
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Ingest Bedside Waveform Telemetry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatorModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateTelemetry} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Metric Waveform Channel
                </label>
                <select
                  value={simMetricType}
                  onChange={(e) => setSimMetricType(e.target.value as TelemetryMetricType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="ECG_LEAD_II">ECG_LEAD_II (Cardiac Electrocardiogram)</option>
                  <option value="PLETH">PLETH (SpO2 Plethysmography)</option>
                  <option value="RESP_WAVE">RESP_WAVE (Transthoracic Impedance)</option>
                  <option value="ABP_WAVE">ABP_WAVE (Arterial Blood Pressure Wave)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Waveform Rhythm Pattern Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['NORMAL', 'TACHYCARDIA', 'BRADYCARDIA', 'PVC'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSimPreset(preset)}
                      className={`p-2 rounded-xl text-center font-bold text-xs border cursor-pointer transition ${
                        simPreset === preset
                          ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Sampling Rate (Hz)
                  </label>
                  <input
                    type="number"
                    value={simSampleRate}
                    onChange={(e) => setSimSampleRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Quality Indicator (%)
                  </label>
                  <input
                    type="number"
                    max={100}
                    min={0}
                    value={simQuality}
                    onChange={(e) => setSimQuality(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Target Bed: <strong>{currentPatient.bedNumber}</strong> (UUID: {selectedBedId.slice(0, 8)}...)
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSimulatorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIngestingTelemetry}
                  className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold transition shadow-md flex items-center gap-2"
                >
                  {isIngestingTelemetry && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Transmit Telemetry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitoringPage;
