import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bed as BedIcon, 
  Activity, 
  User, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Wrench, 
  Clock, 
  X, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles,
  Filter,
  Search
} from 'lucide-react';
import { MOCK_BEDS, MOCK_PATIENTS } from '../data/mockData';
import { Bed, BedStatus } from '../types/icu';

export const ICUBedsPage: React.FC = () => {
  const [bedsData, setBedsData] = useState<Bed[]>(MOCK_BEDS);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | BedStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate status counts
  const occupiedCount = bedsData.filter(b => b.status === 'OCCUPIED').length;
  const availableCount = bedsData.filter(b => b.status === 'AVAILABLE').length;
  const reservedCount = bedsData.filter(b => b.status === 'RESERVED').length;
  const maintenanceCount = bedsData.filter(b => b.status === 'MAINTENANCE').length;

  // Filter beds
  const filteredBeds = bedsData.filter(b => {
    const patient = b.patientId ? MOCK_PATIENTS.find(p => p.id === b.patientId) : undefined;
    const matchesSearch = 
      b.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient && (patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (bedId: string, newStatus: BedStatus) => {
    setBedsData(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: newStatus,
          occupied: newStatus === 'OCCUPIED'
        };
      }
      return b;
    }));

    if (selectedBed && selectedBed.id === bedId) {
      setSelectedBed(prev => prev ? { ...prev, status: newStatus, occupied: newStatus === 'OCCUPIED' } : null);
    }
  };

  const getStatusBadgeStyle = (status: BedStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'OCCUPIED':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'RESERVED':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'MAINTENANCE':
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getCardStyle = (status: BedStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500';
      case 'OCCUPIED':
        return 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/80 hover:border-rose-500';
      case 'RESERVED':
        return 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 hover:border-amber-500';
      case 'MAINTENANCE':
        return 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 hover:border-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <BedIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>ICU Bed Management & Capacity Grid</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            MICU-01 • 24 Intensive Care Beds • Interactive Real-time Status Allocation
          </p>
        </div>

        {/* Capacity Summary Stats */}
        <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30">
            {occupiedCount} Occupied
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
            {availableCount} Available
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
            {reservedCount} Reserved
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-500/15 text-slate-600 dark:text-slate-400 font-bold border border-slate-500/30">
            {maintenanceCount} Maint.
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search bed, patient name, MRN..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-slate-900 dark:text-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-medium">
          {(['ALL', 'OCCUPIED', 'AVAILABLE', 'RESERVED', 'MAINTENANCE'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st === 'OCCUPIED' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
              {st === 'AVAILABLE' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              {st === 'RESERVED' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              {st === 'MAINTENANCE' && <span className="w-2 h-2 rounded-full bg-slate-400" />}
              <span>{st}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bed Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const patient = bed.patientId ? MOCK_PATIENTS.find(p => p.id === bed.patientId) : undefined;

          return (
            <div
              key={bed.id}
              onClick={() => setSelectedBed(bed)}
              className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xs group ${getCardStyle(bed.status)}`}
            >
              <div className="space-y-3">
                {/* Bed Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BedIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                      {bed.number}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(bed.status)}`}>
                    {bed.status}
                  </span>
                </div>

                {/* Patient / Status Body */}
                {bed.status === 'OCCUPIED' && patient ? (
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {patient.age}y • {patient.gender} • MRN: {patient.mrn}
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono grid grid-cols-3 gap-1 text-center">
                      <div>
                        <span className="text-[9px] text-slate-400 block">HR</span>
                        <span className="font-bold text-slate-900 dark:text-white">{patient.vitals.hr.value}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">SpO2</span>
                        <span className="font-bold text-slate-900 dark:text-white">{patient.vitals.spo2.value}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">MAP</span>
                        <span className="font-bold text-slate-900 dark:text-white">{patient.vitals.map.value}</span>
                      </div>
                    </div>
                  </div>
                ) : bed.status === 'AVAILABLE' ? (
                  <div className="py-4 text-center space-y-1">
                    <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500" />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Ready for Admission</p>
                    <p className="text-[10px] text-slate-400 font-mono">Sanitized: {bed.lastSanitized || 'Recent'}</p>
                  </div>
                ) : bed.status === 'RESERVED' ? (
                  <div className="py-4 text-center space-y-1">
                    <Clock className="w-7 h-7 mx-auto text-amber-500" />
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Reserved for Transfer</p>
                    <p className="text-[10px] text-slate-400 font-mono">OT / Emergency Admission</p>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-1">
                    <Wrench className="w-7 h-7 mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Biomedical Maintenance</p>
                    <p className="text-[10px] text-slate-400 font-mono">Sensors Recalibrating</p>
                  </div>
                )}
              </div>

              {/* Click to inspect footer */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Click for Details</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* BED DETAILS POPUP MODAL */}
      {selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
            onClick={() => setSelectedBed(null)}
          />

          {/* Modal Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full z-50 overflow-hidden text-slate-900 dark:text-white font-sans animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-mono font-bold text-sm flex items-center justify-center">
                  <BedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono leading-tight">
                    {selectedBed.number} — {selectedBed.unitName}
                  </h3>
                  <span className="text-[10px] text-teal-300 font-mono">
                    Intensive Care Bed Allocation Modal
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBed(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Status Change Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">
                  Change Bed Status Allocation:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedBed.id, st)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold font-mono transition-all text-center border ${
                        selectedBed.status === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Info Card (If Occupied) */}
              {selectedBed.status === 'OCCUPIED' && selectedBed.patientId ? (() => {
                const patient = MOCK_PATIENTS.find(p => p.id === selectedBed.patientId);
                if (!patient) return null;
                return (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-mono">
                        Active Patient Info
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">MRN: {patient.mrn}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{patient.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {patient.age} years • {patient.gender} • <span className="font-semibold text-slate-700 dark:text-slate-300">{patient.codeStatus}</span>
                      </p>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
                        Dx: {patient.admittingDiagnosis}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block">HR</span>
                        <span className="font-bold text-rose-500">{patient.vitals.hr.value} bpm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">SpO2</span>
                        <span className="font-bold text-cyan-500">{patient.vitals.spo2.value}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">MAP</span>
                        <span className="font-bold text-emerald-500">{patient.vitals.map.value}</span>
                      </div>
                    </div>
                  </div>
                );
              })() : null}

              {/* Connected Biomedical Equipment List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">
                  Connected Bedside Devices & Telemetry:
                </span>
                <div className="space-y-1.5">
                  {(selectedBed.equipment || ['Mindray N22 Monitor', 'Telemetry Gateway']).map((eq, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Cpu className="w-4 h-4 text-teal-500 shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Sanitization Status */}
              <div className="flex items-center justify-between text-xs font-mono p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Terminal Sanitization Log
                </span>
                <span>{selectedBed.lastSanitized || '2026-09-18 10:00'}</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedBed(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 transition-colors"
              >
                Close Modal
              </button>

              {selectedBed.status === 'OCCUPIED' && selectedBed.patientId ? (
                <Link
                  to={`/patient/${selectedBed.patientId}`}
                  onClick={() => setSelectedBed(null)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span>Open Full Clinical Dashboard</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/admin/assignments"
                  onClick={() => setSelectedBed(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Patient to Bed</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
