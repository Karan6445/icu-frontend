import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateBedStatus, addBed } from '../../store/slices/hospitalAdminSlice';
import { BedStatus } from '../../types/hospitalAdmin';
import {
  Bed,
  Filter,
  Search,
  Building2,
  Stethoscope,
  HeartPulse,
  Activity,
  AlertTriangle,
  X,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

export const HospitalAdminBedMapPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useRBAC();
  const { beds, icus, doctors, nurses, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [selectedIcu, setSelectedIcu] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [selectedNurse, setSelectedNurse] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Bed Modal State
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedIcuId, setNewBedIcuId] = useState(icus[0]?.id || 'ICU-MICU');
  const [bedToastMessage, setBedToastMessage] = useState<string | null>(null);

  // Sync selected ICU from URL query or global icuChanged event
  useEffect(() => {
    const syncIcu = () => {
      const params = new URLSearchParams(window.location.search);
      const queryIcu = params.get('icu') || localStorage.getItem('selected_icu_id');
      if (queryIcu && queryIcu !== 'ALL') {
        const match = icus.find(
          i => i.id === queryIcu || 
               i.code === queryIcu || 
               i.code.toUpperCase() === queryIcu.toUpperCase()
        );
        if (match) setSelectedIcu(match.id);
      }
    };
    syncIcu();
    window.addEventListener('icuChanged', syncIcu);
    window.addEventListener('storage', syncIcu);
    return () => {
      window.removeEventListener('icuChanged', syncIcu);
      window.removeEventListener('storage', syncIcu);
    };
  }, [icus]);

  // Bed Status Edit Modal
  const [selectedBedForEdit, setSelectedBedForEdit] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<BedStatus>('AVAILABLE');
  const [statusReason, setStatusReason] = useState('');

  const filteredBeds = beds.filter(bed => {
    const matchesIcu = selectedIcu === 'ALL' || bed.icuId === selectedIcu;
    const matchesStatus = selectedStatus === 'ALL' || bed.status === selectedStatus;
    const matchesDoctor = selectedDoctor === 'ALL' || bed.assignedDoctor === selectedDoctor;
    const matchesNurse = selectedNurse === 'ALL' || bed.assignedNurse === selectedNurse;
    const matchesSearch =
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bed.patientName && bed.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bed.patientId && bed.patientId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesIcu && matchesStatus && matchesDoctor && matchesNurse && matchesSearch;
  });

  const handleUpdateBedStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForEdit) return;

    dispatch(
      updateBedStatus({
        bedId: selectedBedForEdit.id,
        status: newStatus,
        reason: statusReason
      })
    );

    setSelectedBedForEdit(null);
    setStatusReason('');
  };

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedNumber) return;

    dispatch(
      addBed({
        bedNumber: newBedNumber,
        icuId: newBedIcuId
      })
    );

    setBedToastMessage(`Bed ${newBedNumber} successfully commissioned into service!`);
    setIsAddBedModalOpen(false);
    setNewBedNumber('');
    setTimeout(() => setBedToastMessage(null), 4000);
  };

  const getStatusColorClass = (status: BedStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 hover:border-emerald-600';
      case 'OCCUPIED':
        return 'bg-rose-50 dark:bg-rose-950/80 border-rose-400 dark:border-rose-500/50 text-rose-900 dark:text-rose-300 hover:border-rose-600';
      case 'RESERVED':
        return 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 dark:border-amber-500/50 text-amber-900 dark:text-amber-300 hover:border-amber-600';
      case 'MAINTENANCE':
        return 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 dark:border-blue-500/50 text-blue-900 dark:text-blue-300 hover:border-blue-600';
      case 'OFFLINE':
        return 'bg-slate-100 dark:bg-slate-950/90 border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 hover:border-slate-500';
      default:
        return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-300 dark:border-teal-500/30">
              Hospital Bed Grid ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-500/30">
              {beds.length} Total ICU Beds
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Bed className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Interactive ICU Bed Map
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual occupancy grid supporting status filters (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, OFFLINE) and operational bed status management.
          </p>
        </div>

        {/* Actions & Summary */}
        <div className="flex items-center gap-3 flex-wrap">
          {hasPermission('bed:create') && (
            <button
              onClick={() => setIsAddBedModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Commission Bed</span>
            </button>
          )}

          {/* Quick Summary Badges */}
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 rounded-lg font-bold">
              AVAILABLE: {beds.filter(b => b.status === 'AVAILABLE').length}
            </span>
            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 rounded-lg font-bold">
              OCCUPIED: {beds.filter(b => b.status === 'OCCUPIED').length}
            </span>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 rounded-lg font-bold">
              RESERVED: {beds.filter(b => b.status === 'RESERVED').length}
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 rounded-lg font-bold">
              MAINTENANCE: {beds.filter(b => b.status === 'MAINTENANCE').length}
            </span>
          </div>
        </div>
      </div>

      {bedToastMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{bedToastMessage}</span>
          </div>
          <button onClick={() => setBedToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-sans">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bed / Patient..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* ICU Filter */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">ICU:</span>
            <select
              value={selectedIcu}
              onChange={e => setSelectedIcu(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All ICUs</option>
              {icus.map(i => (
                <option key={i.id} value={i.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{i.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
              <option value="AVAILABLE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">AVAILABLE</option>
              <option value="OCCUPIED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OCCUPIED</option>
              <option value="RESERVED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">RESERVED</option>
              <option value="MAINTENANCE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">MAINTENANCE</option>
              <option value="OFFLINE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OFFLINE</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">Doctor:</span>
            <select
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d.name}</option>
              ))}
            </select>
          </div>

          {/* Nurse Filter */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <HeartPulse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">Nurse:</span>
            <select
              value={selectedNurse}
              onChange={e => setSelectedNurse(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Nurses</option>
              {nurses.map(n => (
                <option key={n.id} value={n.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
          <span>Showing <strong className="text-teal-700 dark:text-teal-300">{filteredBeds.length}</strong> of 48 Beds</span>
          <span>Click any bed card to update operational status</span>
        </div>
      </div>

      {/* Bed Map Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredBeds.map(bed => (
          <div
            key={bed.id}
            onClick={() => {
              setSelectedBedForEdit(bed);
              setNewStatus(bed.status);
            }}
            className={`border-2 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:translate-y-[-2px] space-y-3 relative overflow-hidden ${getStatusColorClass(
              bed.status
            )}`}
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
              <span className="font-mono font-black text-xs tracking-wider">{bed.bedNumber}</span>
              <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/20">
                {bed.status}
              </span>
            </div>

            {bed.status === 'OCCUPIED' ? (
              <div className="space-y-1.5 font-sans">
                <span className="text-xs font-black block truncate">{bed.patientName}</span>
                <span className="text-[10px] font-mono block text-slate-700 dark:text-slate-300">
                  ID: {bed.patientId} • {bed.patientAge}y / {bed.patientGender}
                </span>

                <div className="pt-1 text-[10px] font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                  <div className="truncate">Doc: {bed.assignedDoctor}</div>
                  <div className="truncate">Nur: {bed.assignedNurse}</div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center space-y-1">
                <Bed className="w-8 h-8 mx-auto opacity-70" />
                <span className="text-xs font-mono font-bold block">{bed.icuName}</span>
                <span className="text-[10px] font-mono opacity-80 block">{bed.equipmentConnected[0]}</span>
              </div>
            )}

            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
              <span className="opacity-80">{bed.telemetryStatus}</span>
              <Settings className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Bed Status Modal */}
      {selectedBedForEdit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 rounded-lg">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Update Bed Operational Status</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedBedForEdit.bedNumber} ({selectedBedForEdit.icuName})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBedForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBedStatusSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1.5">Select Bed Status *</label>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  {(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OFFLINE'] as BedStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
                        newStatus === st
                          ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      ● {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Status Update Note / Reason</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bed sanitized after discharge, reserved for ER incoming patient..."
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBedForEdit(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold font-mono text-xs rounded-xl shadow-lg"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: COMMISSION NEW BED ================= */}
      {isAddBedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Commission New Telemetry Bed
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Authorized under bed:create
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBedSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bed Identifier / Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MICU-13 or SICU-09"
                  value={newBedNumber}
                  onChange={e => setNewBedNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target ICU Unit *
                </label>
                <select
                  value={newBedIcuId}
                  onChange={e => setNewBedIcuId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  {icus.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBedModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Commission Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

