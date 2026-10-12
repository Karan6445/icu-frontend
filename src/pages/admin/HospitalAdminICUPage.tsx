import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addICU } from '../../store/slices/hospitalAdminSlice';
import {
  Building2,
  Bed,
  Users,
  Stethoscope,
  HeartPulse,
  Activity,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Layers,
  MapPin,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HospitalAdminICUPageProps {
  openAddModal?: boolean;
}

export const HospitalAdminICUPage: React.FC<HospitalAdminICUPageProps> = ({ openAddModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { icus, beds, doctors, nurses, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);
  const [expandedIcuId, setExpandedIcuId] = useState<string>('ICU-MICU');
  const [activeHighlightedIcu, setActiveHighlightedIcu] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(openAddModal || location.pathname === '/admin/add-icu' || location.search.includes('add-icu'));

  // Form inputs for Add ICU
  const [newIcuName, setNewIcuName] = useState('');
  const [newIcuCode, setNewIcuCode] = useState('');
  const [newIcuType, setNewIcuType] = useState('Medical Intensive Care');
  const [newFloorLocation, setNewFloorLocation] = useState('3rd Floor - East Wing');
  const [newTotalBeds, setNewTotalBeds] = useState(12);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Sync focused ICU from URL query parameter or icuChanged event
  useEffect(() => {
    const syncIcuFocus = () => {
      const params = new URLSearchParams(location.search);
      const target = params.get('icu') || localStorage.getItem('selected_icu_id');
      if (target) {
        const matched = icus.find(
          i => i.id === target ||
               i.code === target ||
               i.code.toUpperCase() === target.toUpperCase() ||
               i.name.toLowerCase().includes(target.toLowerCase())
        );
        if (matched) {
          setExpandedIcuId(matched.id);
          setActiveHighlightedIcu(matched.id);
          setTimeout(() => {
            const el = document.getElementById(`icu-card-${matched.id}`) || document.getElementById(`icu-card-${matched.code}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }
      }
    };

    syncIcuFocus();
    window.addEventListener('icuChanged', syncIcuFocus);
    window.addEventListener('storage', syncIcuFocus);
    return () => {
      window.removeEventListener('icuChanged', syncIcuFocus);
      window.removeEventListener('storage', syncIcuFocus);
    };
  }, [location.search, icus]);

  useEffect(() => {
    if (openAddModal || location.pathname === '/admin/add-icu' || location.search.includes('add-icu')) {
      setIsAddModalOpen(true);
    }
  }, [openAddModal, location]);

  const handleCreateICU = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIcuName.trim() || !newIcuCode.trim()) return;

    const docObj = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
    const nurseObj = nurses.find(n => n.id === selectedNurseId) || nurses[0];

    dispatch(addICU({
      name: newIcuName.trim(),
      code: newIcuCode.trim().toUpperCase(),
      type: newIcuType,
      floorLocation: newFloorLocation,
      totalBeds: Number(newTotalBeds) || 10,
      doctorLeadId: docObj?.id || 'DOC-101',
      doctorLeadName: docObj?.name || 'Dr. Vikram Sethi',
      nurseLeadId: nurseObj?.id || 'NLEAD-5001',
      nurseLeadName: nurseObj?.name || 'Sunita Rao'
    }));

    setSuccessToast(`ICU Unit "${newIcuCode.trim().toUpperCase()}" created successfully!`);
    setIsAddModalOpen(false);
    setNewIcuName('');
    setNewIcuCode('');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-300 dark:border-teal-500/30">
              ICU Operations Hierarchy ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-500/30">
              {icus.length} Active Intensive Care Units
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Operational ICU Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured hierarchy: {hospitalName} → ICU Unit → Beds → Patient Roster & Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold font-mono px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer border border-teal-500/40 active:scale-95"
            id="add-icu-btn"
          >
            <PlusCircle className="w-4 h-4 text-teal-200" /> + Add ICU
          </button>
          <button
            onClick={() => navigate('/admin/bed-map')}
            className="flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold font-mono px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
          >
            <Bed className="w-4 h-4" /> Open Interactive Bed Map Grid
          </button>
        </div>
      </div>

      {/* Hospital Level Top Node */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white border border-teal-700 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/30 border border-teal-300 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            <Building2 className="w-8 h-8 text-teal-200" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block">
              ROOT HOSPITAL NODE
            </span>
            <h2 className="text-xl font-black text-white">{hospitalName} ({hospitalCode})</h2>
            <p className="text-xs text-teal-100 font-mono flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal-300" /> Patna District ICU Command Hub
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
          <div className="bg-white/10 p-3 rounded-xl border border-teal-400/30">
            <span className="text-teal-200 text-[10px] uppercase font-bold block">Total ICUs</span>
            <span className="text-lg font-black text-white">{icus.length} Units</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-teal-400/30">
            <span className="text-teal-200 text-[10px] uppercase font-bold block">Total Beds</span>
            <span className="text-lg font-black text-teal-200">{beds.length} Beds</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-teal-400/30">
            <span className="text-teal-200 text-[10px] uppercase font-bold block">Occupied</span>
            <span className="text-lg font-black text-rose-300">{beds.filter(b => b.status === 'OCCUPIED').length} Beds</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-teal-400/30">
            <span className="text-teal-200 text-[10px] uppercase font-bold block">Available</span>
            <span className="text-lg font-black text-emerald-300">{beds.filter(b => b.status === 'AVAILABLE').length} Beds</span>
          </div>
        </div>
      </div>

      {/* Active Selected Unit Focus Banner */}
      {activeHighlightedIcu && (
        <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 border border-emerald-500/50 p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg font-sans animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  FOCUSED UNIT
                </span>
                <span className="text-xs text-teal-200 font-mono">
                  Navbar Selected
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate">
                {icus.find(i => i.id === activeHighlightedIcu || i.code === activeHighlightedIcu)?.name || activeHighlightedIcu}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const el = document.getElementById(`icu-card-${activeHighlightedIcu}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-mono font-bold text-xs transition-colors cursor-pointer"
            >
              Jump to Card ↓
            </button>
            <button
              onClick={() => navigate('/command-center?icu=' + activeHighlightedIcu)}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Telemetry Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* ICU Units Hierarchy Accordion / Cards List */}
      <div className="space-y-4">
        {icus.map(icu => {
          const isExpanded = expandedIcuId === icu.id || expandedIcuId === icu.code;
          const isHighlighted = activeHighlightedIcu === icu.id || activeHighlightedIcu === icu.code;
          const icuBeds = beds.filter(b => b.icuId === icu.id);
          const activePatients = icuBeds.filter(b => b.status === 'OCCUPIED');
          const icuDoctors = doctors.filter(d => d.assignedICUId === icu.id);
          const icuNurses = nurses.filter(n => n.assignedICUId === icu.id);

          return (
            <div
              key={icu.id}
              id={`icu-card-${icu.id}`}
              className={`bg-white dark:bg-slate-800/90 border rounded-2xl shadow-sm transition-all overflow-hidden scroll-mt-24 ${
                isHighlighted
                  ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl'
                  : isExpanded
                  ? 'border-teal-500 ring-1 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
              }`}
            >
              {/* Unit Header Bar */}
              <div
                onClick={() => setExpandedIcuId(isExpanded ? '' : icu.id)}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 border rounded-xl shrink-0 ${
                    isHighlighted
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                      : 'bg-teal-50 dark:bg-slate-900 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300'
                  }`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded border border-teal-300 dark:border-teal-500/30">
                        {icu.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {icu.floorLocation}
                      </span>
                      {isHighlighted && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/40 animate-pulse">
                          ● ACTIVE SELECTED IN NAVBAR
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{icu.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">{icu.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Occupied</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{icu.occupiedBeds}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Available</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{icu.availableBeds}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Reserved</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{icu.reservedBeds}</span>
                    </div>
                  </div>

                  <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-teal-600 dark:text-teal-400" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Hierarchy Detail Panel */}
              {isExpanded && (
                <div className="p-6 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700/80 space-y-6">
                  {/* Leadership Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                      <div className="p-2.5 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 rounded-lg shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-bold uppercase block">
                          Doctor Lead Specialist
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{icu.doctorLeadName}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Assigned Doctors in Unit: {icuDoctors.length}</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg shrink-0">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase block">
                          Nurse Lead Supervisor
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{icu.nurseLeadName}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Assigned Nurses in Unit: {icuNurses.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Patient Roster in this ICU */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Active Patient Admissions in {icu.name} ({activePatients.length} Active)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activePatients.map(bed => (
                        <div key={bed.id} className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl space-y-2 font-mono text-xs shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {bed.bedNumber}
                            </span>
                            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/40 font-bold">
                              {bed.telemetryStatus} TELEMETRY
                            </span>
                          </div>

                          <div>
                            <span className="text-sm font-bold text-teal-800 dark:text-teal-300 font-sans block">{bed.patientName}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">ID: {bed.patientId} • {bed.patientAge}y / {bed.patientGender}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Doctor:</span>
                              <span className="text-slate-900 dark:text-white font-sans font-semibold">{bed.assignedDoctor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Nurse:</span>
                              <span className="text-emerald-700 dark:text-emerald-300 font-sans font-semibold">{bed.assignedNurse}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= ADD NEW ICU MODAL DIALOG ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between border-b border-teal-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/30 border border-teal-300 text-white flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Intensive Care Unit</h3>
                  <p className="text-xs text-teal-200 font-mono">Provision ward under {hospitalName} ({hospitalCode})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (location.pathname === '/admin/add-icu') navigate('/admin/hospital-icus');
                }}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateICU} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    ICU Unit Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medical ICU 03"
                    value={newIcuName}
                    onChange={(e) => setNewIcuName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    ICU Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MICU-03"
                    value={newIcuCode}
                    onChange={(e) => setNewIcuCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    ICU Specialty / Type
                  </label>
                  <select
                    value={newIcuType}
                    onChange={(e) => setNewIcuType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Medical Intensive Care">Medical Intensive Care</option>
                    <option value="Surgical & Trauma Care">Surgical & Trauma Care</option>
                    <option value="Cardiothoracic Intensive Care">Cardiothoracic Intensive Care</option>
                    <option value="Neuro-Critical Care">Neuro-Critical Care</option>
                    <option value="Pediatric Critical Care">Pediatric Critical Care</option>
                    <option value="Neonatal Critical Care">Neonatal Critical Care</option>
                    <option value="Emergency Trauma Care">Emergency Trauma Care</option>
                    <option value="Respiratory & Pulmonology">Respiratory & Pulmonology</option>
                    <option value="Coronary Intensive Care">Coronary Intensive Care</option>
                    <option value="Burns & Reconstruction">Burns & Reconstruction</option>
                    <option value="Transplant Medicine">Transplant Medicine</option>
                    <option value="Onco-Hematology Care">Onco-Hematology Care</option>
                    <option value="Extracorporeal Life Support">Extracorporeal Life Support (ECMO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Bed Capacity (Beds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newTotalBeds}
                    onChange={(e) => setNewTotalBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Floor & Wing Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4th Floor - East Wing"
                  value={newFloorLocation}
                  onChange={(e) => setNewFloorLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Assigned Lead Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Default Doctor Lead</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialization.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Assigned Nurse Lead
                  </label>
                  <select
                    value={selectedNurseId}
                    onChange={(e) => setSelectedNurseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Default Nurse Lead</option>
                    {nurses.map(nurse => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} ({nurse.rank})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    if (location.pathname === '/admin/add-icu') navigate('/admin/hospital-icus');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" /> Provision ICU Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
