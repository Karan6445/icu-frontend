import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedDistrict, setSelectedHospitalId } from '../../store/slices/superAdminSlice';
import {
  Building2,
  Activity,
  UserCheck,
  Users,
  Search,
  MapPin,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DistrictManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { districts, hospitals } = useSelector((state: RootState) => state.superAdmin);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrictModal, setSelectedDistrictModal] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hospitals' | 'icuBeds' | 'name'>('hospitals');

  // Add District State
  const [isAddDistrictOpen, setIsAddDistrictOpen] = useState(false);
  const [newDistName, setNewDistName] = useState('');
  const [newDistCode, setNewDistCode] = useState('');
  const [newDistState, setNewDistState] = useState('Bihar');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Filter & Search Districts
  const filteredDistricts = districts
    .filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'hospitals') return b.totalHospitals - a.totalHospitals;
      if (sortBy === 'icuBeds') return b.totalICUBeds - a.totalICUBeds;
      return a.name.localeCompare(b.name);
    });

  const activeDistrictData = selectedDistrictModal
    ? districts.find(d => d.name === selectedDistrictModal)
    : null;

  const districtHospitals = selectedDistrictModal
    ? hospitals.filter(h => h.district === selectedDistrictModal)
    : [];

  const handleSelectDistrict = (distName: string) => {
    dispatch(setSelectedDistrict(distName));
    setSelectedDistrictModal(distName);
  };

  const handleViewHospitalDetails = (hospId: string) => {
    dispatch(setSelectedHospitalId(hospId));
    navigate('/admin/hospital-details');
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F766E]">
                District Network Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Centralized monitoring across all 38 Districts of Tamil Nadu
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl text-[#0F766E] font-semibold text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>38 State Districts Active</span>
          </div>
          <button
            onClick={() => setIsAddDistrictOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Create District Territory (district:create)"
          >
            <Plus className="w-4 h-4" />
            <span>Add District</span>
          </button>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search district by name or code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="hospitals">Most Hospitals</option>
            <option value="icuBeds">Most ICU Beds</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDistricts.map(district => {
          const availPct = Math.round((district.availableICUBeds / (district.totalICUBeds || 1)) * 100);

          return (
            <div
              key={district.id}
              className="group bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-500 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* District Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200 tracking-wider">
                      {district.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5 group-hover:text-[#0F766E] transition-colors">
                      {district.name}
                    </h3>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:text-[#0F766E] group-hover:bg-teal-50 transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block">Hospitals</span>
                    <span className="text-base font-bold text-slate-900">{district.totalHospitals}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block">ICU Capacity</span>
                    <span className="text-base font-bold text-[#0F766E]">{district.totalICUBeds} Beds</span>
                  </div>
                </div>

                {/* ICU Availability Progress Bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">Available ICU Beds:</span>
                    <span className="font-bold text-emerald-700">
                      {district.availableICUBeds} ({availPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        availPct < 15
                          ? 'bg-rose-500'
                          : availPct < 30
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(5, availPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectDistrict(district.name)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-[#0F766E] hover:text-white text-[#0F766E] font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 hover:border-[#0F766E] transition-all duration-200 cursor-pointer"
              >
                <span>View District Hospitals</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* District Hospital Drilldown Modal */}
      {selectedDistrictModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 rounded-xl text-[#0F766E] border border-teal-200">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedDistrictModal} District</h2>
                  <p className="text-xs text-slate-500">
                    {activeDistrictData?.totalHospitals || 0} Hospitals registered under this district
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDistrictModal(null)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {districtHospitals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p>No primary ICU hospitals specifically configured for this district in demo view.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {districtHospitals.map(h => (
                    <div
                      key={h.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-[#0F766E] transition-colors shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E]">
                              {h.code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">{h.name}</h4>
                            <p className="text-xs text-slate-500">{h.type}</p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              h.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {h.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 my-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-slate-500 block text-[10px]">ICU Beds</span>
                            <span className="font-bold text-slate-900">{h.totalICUBeds}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Avail ICU</span>
                            <span className="font-bold text-emerald-700">{h.availableICUBeds}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Doctors</span>
                            <span className="font-bold text-slate-900">{h.doctorsCount}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewHospitalDetails(h.id)}
                        className="w-full mt-2 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Hospital 7-Tab Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD DISTRICT MODAL (district:create) */}
      {isAddDistrictOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0F766E]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Provision Health District</h3>
                  <span className="text-[10px] font-mono text-teal-600">Action: district:create</span>
                </div>
              </div>
              <button onClick={() => setIsAddDistrictOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDistName.trim()) return;
                setIsAddDistrictOpen(false);
                setBannerMsg(`District "${newDistName}" provisioned successfully.`);
                setNewDistName('');
                setNewDistCode('');
                setTimeout(() => setBannerMsg(null), 4000);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  District Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madurai Central"
                  value={newDistName}
                  onChange={e => setNewDistName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    District Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MDU"
                    value={newDistCode}
                    onChange={e => setNewDistCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    State Jurisdiction
                  </label>
                  <input
                    type="text"
                    required
                    value={newDistState}
                    onChange={e => setNewDistState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDistrictOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictManagementPage;
