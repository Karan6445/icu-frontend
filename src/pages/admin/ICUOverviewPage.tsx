import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addICUBed, updateICUBed } from '../../store/slices/superAdminSlice';
import { SuperAdminICUBedRecord, ICUBedStatus } from '../../types/superAdmin';
import {
  Bed,
  Filter,
  Search,
  Plus,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  User,
  Activity
} from 'lucide-react';

export const ICUOverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const { icuBeds, districts, hospitals } = useSelector((state: RootState) => state.superAdmin);

  // Filters
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitTypeFilter, setUnitTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit / Add Modal States
  const [editingBed, setEditingBed] = useState<SuperAdminICUBedRecord | null>(null);
  const [showAddBedModal, setShowAddBedModal] = useState(false);

  const [newBedForm, setNewBedForm] = useState({
    bedNumber: '',
    hospitalId: hospitals[0]?.id || '',
    icuType: 'Medical ICU' as const,
    status: 'Available' as const
  });

  const filteredBeds = icuBeds.filter(bed => {
    if (districtFilter !== 'ALL' && bed.district !== districtFilter) return false;
    if (hospitalFilter !== 'ALL' && bed.hospitalId !== hospitalFilter) return false;
    if (statusFilter !== 'ALL' && bed.status !== statusFilter) return false;
    if (unitTypeFilter !== 'ALL' && bed.icuType !== unitTypeFilter) return false;
    if (searchTerm) {
      const match =
        bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bed.patientName && bed.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  const totalCount = filteredBeds.length;
  const availableCount = filteredBeds.filter(b => b.status === 'Available').length;
  const occupiedCount = filteredBeds.filter(b => b.status === 'Occupied').length;
  const reservedCount = filteredBeds.filter(b => b.status === 'Reserved').length;
  const maintenanceCount = filteredBeds.filter(b => b.status === 'Maintenance').length;

  const handleUpdateBedStatus = (newStatus: ICUBedStatus) => {
    if (!editingBed) return;
    dispatch(
      updateICUBed({
        ...editingBed,
        status: newStatus,
        patientName: newStatus === 'Available' ? undefined : editingBed.patientName
      })
    );
    setEditingBed(null);
  };

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetHosp = hospitals.find(h => h.id === newBedForm.hospitalId) || hospitals[0];
    dispatch(
      addICUBed({
        bedNumber: newBedForm.bedNumber || `ICU-B${Math.floor(100 + Math.random() * 900)}`,
        hospitalId: targetHosp.id,
        hospitalName: targetHosp.name,
        district: targetHosp.district,
        icuType: newBedForm.icuType,
        status: newBedForm.status
      })
    );
    setShowAddBedModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F766E]">
              ICU Bed Management Console
            </h1>
            <p className="text-xs text-slate-500 font-medium">Real-time status, bed allocations and capacity tracking</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddBedModal(true)}
          className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New ICU Bed</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-semibold">Total Monitored Beds</span>
          <span className="text-2xl font-black text-slate-900 mt-1">{totalCount}</span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-700 block font-bold">Available</span>
          <span className="text-2xl font-black text-emerald-700 mt-1">{availableCount}</span>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-xs text-rose-700 block font-bold">Occupied</span>
          <span className="text-2xl font-black text-rose-700 mt-1">{occupiedCount}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-700 block font-bold">Reserved</span>
          <span className="text-2xl font-black text-amber-700 mt-1">{reservedCount}</span>
        </div>
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 shadow-xs">
          <span className="text-xs text-slate-600 block font-bold">Under Maintenance</span>
          <span className="text-2xl font-black text-slate-700 mt-1">{maintenanceCount}</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search bed, hospital, patient..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div>
          <select
            value={districtFilter}
            onChange={e => {
              setDistrictFilter(e.target.value);
              setHospitalFilter('ALL');
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Districts (38)</option>
            {districts.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={hospitalFilter}
            onChange={e => setHospitalFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Hospitals</option>
            {hospitals
              .filter(h => districtFilter === 'ALL' || h.district === districtFilter)
              .map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={unitTypeFilter}
            onChange={e => setUnitTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All ICU Types</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Surgical ICU">Surgical ICU</option>
            <option value="Cardiac ICU">Cardiac ICU</option>
            <option value="Neuro ICU">Neuro ICU</option>
            <option value="Pediatric ICU">Pediatric ICU</option>
            <option value="Neonatal ICU">Neonatal ICU</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Bed Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Bed Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredBeds.map(bed => {
          const statusStyles = {
            Available: 'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:border-emerald-500',
            Occupied: 'bg-rose-50/70 border-rose-300 text-rose-900 hover:border-rose-500',
            Reserved: 'bg-amber-50/70 border-amber-300 text-amber-900 hover:border-amber-500',
            Maintenance: 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400'
          };

          return (
            <div
              key={bed.id}
              onClick={() => setEditingBed(bed)}
              className={`p-4 rounded-2xl border ${statusStyles[bed.status]} cursor-pointer transition-all duration-200 shadow-2xs flex flex-col justify-between space-y-3 group hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-white border border-slate-300">
                  {bed.bedNumber}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{bed.status}</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 truncate">{bed.hospitalName}</p>
                <span className="text-[10px] text-slate-600 block">{bed.district} • {bed.icuType}</span>
                {bed.patientName && (
                  <div className="pt-2 flex items-center gap-1.5 text-xs text-rose-800 font-bold">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{bed.patientName}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                <span>Dr: {bed.doctorName || 'Unassigned'}</span>
                <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT BED STATUS MODAL */}
      {editingBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0F766E] px-2 py-0.5 bg-teal-50 rounded">
                  {editingBed.bedNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{editingBed.hospitalName}</h3>
              </div>
              <button
                onClick={() => setEditingBed(null)}
                className="px-3 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Update Bed Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Available', 'Occupied', 'Reserved', 'Maintenance'] as ICUBedStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateBedStatus(st)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      editingBed.status === st
                        ? 'bg-[#0F766E] text-white border-teal-700 shadow-md'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW BED MODAL */}
      {showAddBedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddBedSubmit}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Provision New ICU Bed</h3>

            <div>
              <label className="text-xs text-slate-600 font-bold block mb-1">Target Hospital</label>
              <select
                value={newBedForm.hospitalId}
                onChange={e => setNewBedForm({ ...newBedForm, hospitalId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold block mb-1">Bed Identifier Code</label>
              <input
                type="text"
                placeholder="e.g. ICU-B204"
                required
                value={newBedForm.bedNumber}
                onChange={e => setNewBedForm({ ...newBedForm, bedNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold block mb-1">ICU Unit Specialty</label>
              <select
                value={newBedForm.icuType}
                onChange={e => setNewBedForm({ ...newBedForm, icuType: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
              >
                <option value="Medical ICU">Medical ICU</option>
                <option value="Surgical ICU">Surgical ICU</option>
                <option value="Cardiac ICU">Cardiac ICU</option>
                <option value="Neuro ICU">Neuro ICU</option>
                <option value="Pediatric ICU">Pediatric ICU</option>
                <option value="Neonatal ICU">Neonatal ICU</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBedModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save & Provision
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ICUOverviewPage;
