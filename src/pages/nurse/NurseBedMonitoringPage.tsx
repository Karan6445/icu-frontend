import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Link } from 'react-router-dom';
import {
  Bed,
  Activity,
  PlusCircle,
  CheckCircle2,
  Sliders,
  Layers,
  X,
  ShieldCheck,
  Search
} from 'lucide-react';
import { updateBedStatus, addBed, BedStatus, IcuBed } from '../../store/slices/icuBedSlice';

export const NurseBedMonitoringPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { beds, units } = useAppSelector(state => state.icuBed);
  const { currentUser } = useAppSelector(state => state.auth);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Bed status modal
  const [editingBed, setEditingBed] = useState<IcuBed | null>(null);
  const [newStatus, setNewStatus] = useState<BedStatus>('Available');

  // Add bed modal
  const [isAddBedOpen, setIsAddBedOpen] = useState(false);
  const [addBedNumber, setAddBedNumber] = useState('');
  const [addIcuId, setAddIcuId] = useState(units[0]?.id || 'MICU-01');
  const [addMonitorModel, setAddMonitorModel] = useState('Mindray BeneVision N22');

  const [notification, setNotification] = useState<string | null>(null);

  const filteredBeds = beds.filter(b => {
    const matchesSearch =
      b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.icuName.toLowerCase().includes(search.toLowerCase()) ||
      (b.assignedPatientName && b.assignedPatientName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBed) {
      dispatch(
        updateBedStatus({
          bedId: editingBed.id,
          status: newStatus,
          notes: `Updated by Charge Nurse ${currentUser.name}`
        })
      );
      setNotification(`Bed ${editingBed.bedNumber} status updated to "${newStatus}" via bed:update.`);
      setTimeout(() => setNotification(null), 3500);
      setEditingBed(null);
    }
  };

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addBedNumber) {
      const targetUnit = units.find(u => u.id === addIcuId) || units[0];
      const newBedItem: IcuBed = {
        id: `B-${Date.now().toString().slice(-4)}`,
        bedNumber: addBedNumber.toUpperCase(),
        icuId: targetUnit.id,
        icuName: targetUnit.name,
        status: 'Available',
        ventilatorAttached: true,
        infusionPumpAttached: true,
        monitorModel: addMonitorModel,
        lastSanitized: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      dispatch(addBed(newBedItem));
      setNotification(`Bed ${addBedNumber.toUpperCase()} successfully provisioned via bed:create.`);
      setTimeout(() => setNotification(null), 3500);
      setAddBedNumber('');
      setIsAddBedOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold rounded-full">
              CHARGE NURSE COCKPIT
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-bold rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>bed:create · bed:read · bed:update</span>
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            ICU Bed Allocation & Monitoring Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry, ventilator connectivity & bed status management across units.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/bed-map"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Interactive Bed Map</span>
          </Link>

          <button
            onClick={() => setIsAddBedOpen(true)}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Commission New Bed (bed:create)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bed (e.g. BED-01, patient)..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {['ALL', 'Available', 'Occupied', 'Reserved', 'Maintenance'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-bold ${
                filterStatus === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st} {st !== 'ALL' && `(${beds.filter(b => b.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map(b => (
          <div
            key={b.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-sm hover:border-teal-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {b.bedNumber}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                  b.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : b.status === 'Occupied'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : b.status === 'Maintenance'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {b.status}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div>
                <span className="text-slate-500">Unit:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{b.icuName}</span>
              </div>
              <div>
                <span className="text-slate-500">Patient:</span>{' '}
                <span className="text-teal-700 dark:text-teal-400 font-bold">
                  {b.assignedPatientName || 'None (Bed Open)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Monitor:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300">{b.monitorModel}</span>
              </div>
              <div>
                <span className="text-slate-500">Ventilator:</span>{' '}
                <span className={b.ventilatorAttached ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {b.ventilatorAttached ? 'Attached & Active' : 'Not Attached'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingBed(b);
                  setNewStatus(b.status);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Change Status (bed:update)</span>
              </button>

              {b.assignedPatientId ? (
                <Link
                  to={`/patient/${b.assignedPatientId}`}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  View Patient →
                </Link>
              ) : (
                <Link
                  to="/nurse/add-patient"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Admit Patient →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Status Update Modal */}
      {editingBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Update Status for {editingBed.bedNumber}
              </h3>
              <button
                onClick={() => setEditingBed(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-2 font-bold">
                  Select Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Available', 'Occupied', 'Reserved', 'Maintenance'] as BedStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        newStatus === st
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBed(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Confirm (bed:update)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {isAddBedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Commission New Bed (bed:create)
              </h3>
              <button
                onClick={() => setIsAddBedOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBedSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Bed Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BED-19, BED-20"
                  value={addBedNumber}
                  onChange={e => setAddBedNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Assigned ICU Unit *
                </label>
                <select
                  value={addIcuId}
                  onChange={e => setAddIcuId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Telemetry Monitor Model *
                </label>
                <input
                  type="text"
                  value={addMonitorModel}
                  onChange={e => setAddMonitorModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBedOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Provision Bed (bed:create)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
