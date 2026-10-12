import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setViewMode, setSelectedIcuFilter, setSelectedStatusFilter, updateBedStatus, BedStatus } from '../../store/slices/icuBedSlice';
import { Bed, Grid, List, Search, SlidersHorizontal, CheckCircle2, AlertTriangle, ShieldCheck, Wrench, Plus, X } from 'lucide-react';

export const AdminIcuBedsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { units, beds, viewMode, selectedIcuFilter, selectedStatusFilter, searchQuery } = useAppSelector(state => state.icuBed);

  const [selectedBedForEdit, setSelectedBedForEdit] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<BedStatus>('Available');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  const filteredBeds = beds.filter(b => {
    const matchesIcu = selectedIcuFilter === 'ALL' || b.icuId === selectedIcuFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || b.status === selectedStatusFilter;
    const matchesQuery = b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.icuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (b.assignedPatientName && b.assignedPatientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesIcu && matchesStatus && matchesQuery;
  });

  const handleSaveBedStatus = () => {
    if (selectedBedForEdit) {
      dispatch(updateBedStatus({ bedId: selectedBedForEdit, status: newStatus, notes: maintenanceNotes }));
      setSelectedBedForEdit(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-300 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            ICU & BED MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">ICU Units & Bed Roster</h1>
          <p className="text-xs text-slate-500">Monitor bed occupancy, maintenance alerts, ventilator attachments, and bed availability.</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-300">
          <button
            onClick={() => dispatch(setViewMode('table'))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-[#10B981] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => dispatch(setViewMode('grid'))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-[#10B981] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* ICU Units Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map(u => (
          <div
            key={u.id}
            onClick={() => dispatch(setSelectedIcuFilter(selectedIcuFilter === u.id ? 'ALL' : u.id))}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedIcuFilter === u.id
                ? 'bg-teal-50/60 border-[#0F766E] shadow-md ring-2 ring-teal-500/20'
                : 'bg-white border-gray-300 hover:border-gray-400 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
              <span className="text-[10px] font-mono text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">{u.code}</span>
            </div>
            <p className="text-[11px] text-slate-500">{u.floor}</p>
            <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">AVAILABLE</span>
                <span className="font-bold text-[#10B981]">{u.availableBeds} Beds</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">OCCUPIED</span>
                <span className="font-bold text-[#F59E0B]">{u.occupiedBeds} / {u.totalBeds}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-300 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] font-mono">Status Filter:</span>
          {(['ALL', 'Available', 'Occupied', 'Reserved', 'Maintenance'] as const).map(st => (
            <button
              key={st}
              onClick={() => dispatch(setSelectedStatusFilter(st))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                selectedStatusFilter === st
                  ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                  : 'bg-slate-100 border-gray-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-slate-500 font-mono text-xs">
          Showing <span className="text-slate-900 font-bold">{filteredBeds.length}</span> of {beds.length} Beds
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBeds.map(b => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 relative overflow-hidden hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-teal-600" />
                  <span className="font-black text-slate-900 text-base">{b.bedNumber}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                  b.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : b.status === 'Occupied'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : b.status === 'Reserved'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {b.status}
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="text-slate-500">{b.icuName}</div>
                {b.assignedPatientName ? (
                  <div className="text-teal-700 font-bold text-xs truncate">Patient: {b.assignedPatientName}</div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">Unassigned</div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Ventilator:</span>
                  <span className={b.ventilatorAttached ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {b.ventilatorAttached ? 'ATTACHED' : 'NONE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monitor:</span>
                  <span className="text-slate-700 truncate max-w-[120px]">{b.monitorModel}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBedForEdit(b.id);
                  setNewStatus(b.status);
                  setMaintenanceNotes(b.maintenanceNotes || '');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Update Bed Status
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW (NO CHARTS) */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Bed Number</th>
                <th className="p-3">ICU Unit</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Patient</th>
                <th className="p-3">Devices Attached</th>
                <th className="p-3">Monitor Model</th>
                <th className="p-3">Last Sanitized</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBeds.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">{b.bedNumber}</td>
                  <td className="p-3 font-semibold text-teal-700 dark:text-teal-400">{b.icuName}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      b.status === 'Available'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : b.status === 'Occupied'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                        : b.status === 'Reserved'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {b.assignedPatientName || <span className="text-slate-400 font-normal italic">None</span>}
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    {b.ventilatorAttached && <span className="text-teal-700 dark:text-teal-400 block">• Ventilator</span>}
                    {b.infusionPumpAttached && <span className="text-purple-700 dark:text-purple-400 block">• Infusion Pump</span>}
                  </td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{b.monitorModel}</td>
                  <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{b.lastSanitized}</td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelectedBedForEdit(b.id);
                        setNewStatus(b.status);
                        setMaintenanceNotes(b.maintenanceNotes || '');
                      }}
                      className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Edit Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bed Status Update Modal */}
      {selectedBedForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Update Bed Status</h3>
              <button onClick={() => setSelectedBedForEdit(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BedStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {newStatus === 'Maintenance' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Maintenance Notes / Calibration Details</label>
                  <textarea
                    rows={3}
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    placeholder="Enter reason for maintenance..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedBedForEdit(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBedStatus}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
