import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Building2,
  Users,
  Search,
  Plus,
  RefreshCw,
  GitFork,
  Layers,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Server,
  ArrowRight,
  Shield,
  Filter,
  Activity,
  FileCode,
  Globe2,
  Bed,
  Phone,
  Mail,
  Hospital,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDistrictsThunk,
  fetchDistrictByIdThunk,
  createDistrictThunk,
  updateDistrictThunk,
  deleteDistrictThunk,
  fetchDistrictHospitalsThunk,
  fetchDistrictHierarchyThunk,
  setSelectedDistrictId,
  setSelectedStateFilter,
  clearDistrictError,
  clearDistrictSuccessMessage,
} from '../../store/slices/districtSlice';
import { fetchStatesThunk } from '../../store/slices/stateSlice';
import { setSelectedHospitalId } from '../../store/slices/superAdminSlice';
import {
  DistrictResponse,
  DistrictCreatePayload,
  DistrictUpdatePayload,
  DistrictHospitalItem,
} from '../../types/districtHierarchy';
import { useNavigate } from 'react-router-dom';

export const DistrictManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    districts,
    selectedDistrictId,
    selectedDistrict,
    selectedDistrictHospitals,
    selectedDistrictHierarchy,
    selectedStateFilter,
    isLoading,
    isHospitalsLoading,
    isHierarchyLoading,
    isActionLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.district);

  const { states } = useAppSelector((state) => state.state);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'districts' | 'hierarchy' | 'hospitals'>('districts');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'recent'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);

  // Target district for edit/delete
  const [targetDistrict, setTargetDistrict] = useState<DistrictResponse | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<DistrictCreatePayload>({
    state_id: '',
    code: '',
    name: '',
    status: 'ACTIVE',
  });
  const [editForm, setEditForm] = useState<DistrictUpdatePayload>({
    state_id: '',
    code: '',
    name: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState<{ state_id?: string; code?: string; name?: string }>({});

  // Tree View State
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});
  const [showRawJson, setShowRawJson] = useState(false);
  const [hierarchyFilter, setHierarchyFilter] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchStatesThunk());
    dispatch(fetchDistrictsThunk(selectedStateFilter ? { state_id: selectedStateFilter } : undefined));
  }, [dispatch, selectedStateFilter]);

  // Set default state filter if states available and none set
  useEffect(() => {
    if (states.length > 0 && !createForm.state_id) {
      setCreateForm((prev) => ({ ...prev, state_id: states[0].id }));
    }
  }, [states, createForm.state_id]);

  // If a district is selected, load its hospitals and hierarchy
  useEffect(() => {
    if (selectedDistrictId) {
      dispatch(fetchDistrictHierarchyThunk(selectedDistrictId));
      dispatch(fetchDistrictHospitalsThunk(selectedDistrictId));
    }
  }, [selectedDistrictId, dispatch]);

  // Set default selected district if none selected
  useEffect(() => {
    if (districts.length > 0 && !selectedDistrictId) {
      dispatch(setSelectedDistrictId(districts[0].id));
    }
  }, [districts, selectedDistrictId, dispatch]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearDistrictSuccessMessage()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearDistrictError()), 6000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Map state ID to name helper
  const getStateName = (stateId: string) => {
    const s = states.find((item) => item.id === stateId);
    return s ? `${s.name} (${s.code})` : 'State Jurisdiction';
  };

  // Filtered & Sorted Districts
  const filteredDistricts = useMemo(() => {
    return districts
      .filter((d) => {
        const matchesSearch =
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'ALL' ? true : d.status.toUpperCase() === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'code') return a.code.localeCompare(b.code);
        if (sortBy === 'recent') {
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        }
        return 0;
      });
  }, [districts, searchTerm, statusFilter, sortBy]);

  // Stats
  const totalCount = districts.length;
  const activeCount = districts.filter((d) => d.status.toUpperCase() === 'ACTIVE').length;
  const currentHospitalCount = selectedDistrictHierarchy?.hospitals?.length || selectedDistrictHospitals.length || 0;

  // Validation
  const validateCreateForm = () => {
    const errors: { state_id?: string; code?: string; name?: string } = {};
    if (!createForm.state_id) {
      errors.state_id = 'Parent State is required';
    }
    if (!createForm.code.trim()) {
      errors.code = 'District Code is required (e.g. IN-TN-CHN)';
    } else if (createForm.code.trim().length < 2) {
      errors.code = 'Code must be at least 2 characters';
    }
    if (!createForm.name.trim()) {
      errors.name = 'District Name is required (e.g. Chennai)';
    } else if (createForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    const defaultStateId = selectedStateFilter || (states[0] ? states[0].id : '');
    setCreateForm({
      state_id: defaultStateId,
      code: '',
      name: '',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    await dispatch(createDistrictThunk(createForm));
    setIsCreateModalOpen(false);
    dispatch(fetchDistrictsThunk(selectedStateFilter ? { state_id: selectedStateFilter } : undefined));
  };

  const handleOpenEditModal = (d: DistrictResponse) => {
    setTargetDistrict(d);
    setEditForm({
      state_id: d.state_id,
      code: d.code,
      name: d.name,
      status: d.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDistrict) return;

    await dispatch(
      updateDistrictThunk({
        id: targetDistrict.id,
        payload: editForm,
      })
    );
    setIsEditModalOpen(false);
    dispatch(fetchDistrictsThunk(selectedStateFilter ? { state_id: selectedStateFilter } : undefined));
  };

  const handleOpenDeleteModal = (d: DistrictResponse) => {
    setTargetDistrict(d);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetDistrict) return;
    await dispatch(deleteDistrictThunk(targetDistrict.id));
    setIsDeleteModalOpen(false);
    dispatch(fetchDistrictsThunk(selectedStateFilter ? { state_id: selectedStateFilter } : undefined));
  };

  const handleInspectHierarchy = (d: DistrictResponse) => {
    dispatch(setSelectedDistrictId(d.id));
    dispatch(fetchDistrictHierarchyThunk(d.id));
    dispatch(fetchDistrictHospitalsThunk(d.id));
    setIsHierarchyModalOpen(true);
  };

  const handleSwitchTabToHierarchy = (districtId: string) => {
    dispatch(setSelectedDistrictId(districtId));
    setActiveTab('hierarchy');
  };

  const handleSwitchTabToHospitals = (districtId: string) => {
    dispatch(setSelectedDistrictId(districtId));
    setActiveTab('hospitals');
  };

  const toggleHospitalExpand = (hospId: string) => {
    setExpandedHospitals((prev) => ({ ...prev, [hospId]: !prev[hospId] }));
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Toast Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button
            onClick={() => dispatch(clearDistrictSuccessMessage())}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
          <button
            onClick={() => dispatch(clearDistrictError())}
            className="text-rose-600 hover:text-rose-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#0F766E]">
                  District Hierarchy & Healthcare Networks
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  Tier 2 Regional
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Decentralized District Governance • State → District Hub → Facilities → ICU Personnel
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* API Status Pill */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-medium text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-500">API: /api/v1/districts</span>
          </div>

          <button
            onClick={() => navigate('/admin/states')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Globe2 className="w-4 h-4 text-teal-600" />
            <span>State Directory</span>
          </button>

          <button
            onClick={() => {
              dispatch(fetchDistrictsThunk(selectedStateFilter ? { state_id: selectedStateFilter } : undefined));
              if (selectedDistrictId) {
                dispatch(fetchDistrictHierarchyThunk(selectedDistrictId));
                dispatch(fetchDistrictHospitalsThunk(selectedDistrictId));
              }
            }}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Refresh Data from Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New District</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedStateFilter ? 'Districts in State' : 'Total Districts'}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
            <span className="text-[11px] text-teal-600 font-medium">Regional Health Nodes</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-[#0F766E]">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Districts
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Operational Status</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selected District Focus
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[160px]">
              {selectedDistrict?.name || 'All Selected'}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Code: {selectedDistrict?.code || 'N/A'}
            </span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hospitals in District
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{currentHospitalCount}</h3>
            <span className="text-[11px] text-indigo-600 font-medium">Under {selectedDistrict?.name || 'Scope'}</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 bg-white px-4 pt-2 rounded-t-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('districts')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'districts'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Districts Directory ({filteredDistricts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'hierarchy'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>District Hierarchy Tree</span>
          {selectedDistrict && (
            <span className="ml-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-[10px]">
              {selectedDistrict.code}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'hospitals'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>District Hospitals ({selectedDistrictHospitals.length})</span>
        </button>
      </div>

      {/* TAB 1: DISTRICTS DIRECTORY */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* State Filter Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Globe2 className="w-4 h-4 text-teal-600 shrink-0" />
                <select
                  value={selectedStateFilter || ''}
                  onChange={(e) => dispatch(setSelectedStateFilter(e.target.value ? e.target.value : null))}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E] w-full sm:w-60"
                >
                  <option value="">All States / UTs ({states.length} Regions)</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search district name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="ALL">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="name">Name</option>
                  <option value="code">Code</option>
                  <option value="recent">Recent</option>
                </select>
              </div>

              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-2xs text-[#0F766E]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white shadow-2xs text-[#0F766E]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Loading Districts from backend API...
              </p>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDistricts.map((d) => {
                const isActive = d.status.toUpperCase() === 'ACTIVE';
                const isSelected = selectedDistrictId === d.id;

                return (
                  <div
                    key={d.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-5 space-y-4 hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {d.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-blue-700 font-bold">
                              {d.code}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {d.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">State:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                          {getStateName(d.state_id)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span>ID: {d.id.slice(0, 14)}...</span>
                        <span>
                          {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSwitchTabToHierarchy(d.id)}
                        className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Hierarchy</span>
                      </button>

                      <button
                        onClick={() => handleSwitchTabToHospitals(d.id)}
                        className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors border border-teal-200"
                        title="View Hospitals"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Hospitals</span>
                      </button>

                      <button
                        onClick={() => handleInspectHierarchy(d)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        title="Quick Inspect"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(d)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        title="Edit District"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenDeleteModal(d)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors"
                        title="Delete / Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {!isLoading && viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">District Code</th>
                      <th className="py-3 px-4">District Name</th>
                      <th className="py-3 px-4">State Jurisdiction</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">District UUID</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDistricts.map((d) => {
                      const isActive = d.status.toUpperCase() === 'ACTIVE';
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            {d.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {d.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {getStateName(d.state_id)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {d.id}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSwitchTabToHierarchy(d.id)}
                                className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Hierarchy
                              </button>
                              <button
                                onClick={() => handleSwitchTabToHospitals(d.id)}
                                className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                              >
                                Hospitals
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(d)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(d)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && filteredDistricts.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No districts found matching filter</p>
              <p className="text-xs text-slate-400">
                Try selecting "All States" or clearing your search keywords.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISTRICT HIERARCHY TREE EXPLORER */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-600 shrink-0">District Target:</label>
              <select
                value={selectedDistrictId || ''}
                onChange={(e) => dispatch(setSelectedDistrictId(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-blue-600 w-full sm:w-80"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter tree..."
                  value={hierarchyFilter}
                  onChange={(e) => setHierarchyFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  showRawJson
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Hide JSON' : 'Raw JSON'}</span>
              </button>
            </div>
          </div>

          {showRawJson && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 shadow-inner">
              <pre>{JSON.stringify(selectedDistrictHierarchy, null, 2)}</pre>
            </div>
          )}

          {isHierarchyLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Fetching hierarchy for district {selectedDistrict?.name}...
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Parent State Authority */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0F766E] text-white rounded-xl">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-800">
                      Tier 1: Parent State Authority
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      {selectedDistrictHierarchy?.state?.name || getStateName(selectedDistrict?.state_id || '')}
                    </h3>
                    <p className="text-[11px] text-teal-700 font-mono">
                      Code: {selectedDistrictHierarchy?.state?.code || 'IN-ST'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/states')}
                  className="px-3 py-1.5 bg-white border border-teal-200 text-[#0F766E] text-xs font-semibold rounded-lg hover:bg-teal-50 transition-colors"
                >
                  View State Details
                </button>
              </div>

              {/* District Node */}
              <div className="ml-6 pl-6 border-l-2 border-blue-300 space-y-4">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                          Tier 2: District Hub
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {selectedDistrictHierarchy?.code || selectedDistrict?.code}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        {selectedDistrictHierarchy?.name || selectedDistrict?.name}
                      </h2>
                      <p className="text-xs text-slate-600 font-medium">
                        Status: {selectedDistrictHierarchy?.status || selectedDistrict?.status} • ID: {selectedDistrictId}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white px-4 py-2 rounded-xl border border-blue-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Facilities
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {selectedDistrictHierarchy?.hospitals?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Hospital Facilities Tier */}
                <div className="space-y-3 pl-4 border-l-2 border-indigo-200 ml-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tier 3: Healthcare Facilities & Hospital Infrastructure
                  </span>

                  {selectedDistrictHierarchy?.hospitals && selectedDistrictHierarchy.hospitals.length > 0 ? (
                    selectedDistrictHierarchy.hospitals
                      .filter((h) => {
                        if (!hierarchyFilter) return true;
                        const term = hierarchyFilter.toLowerCase();
                        return (
                          h.name.toLowerCase().includes(term) ||
                          h.code.toLowerCase().includes(term) ||
                          h.users?.some((u) => u.first_name.toLowerCase().includes(term))
                        );
                      })
                      .map((hospital) => {
                        const isExpanded = expandedHospitals[hospital.id] ?? true;
                        const usersCount = hospital.users?.length || 0;

                        return (
                          <div
                            key={hospital.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs"
                          >
                            <div
                              onClick={() => toggleHospitalExpand(hospital.id)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <button className="text-slate-400">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-indigo-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-indigo-50 text-indigo-800 rounded">
                                      Facility
                                    </span>
                                    <span className="font-mono text-xs font-semibold text-slate-600">
                                      {hospital.code}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {hospital.name}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200">
                                  {usersCount} Authorized Personnel
                                </span>
                              </div>
                            </div>

                            {/* Personnel Tier */}
                            {isExpanded && hospital.users && hospital.users.length > 0 && (
                              <div className="pl-8 border-l-2 border-indigo-100 ml-4 pt-1 space-y-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                  Tier 4: Clinical Staff & Administrators
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {hospital.users.map((u) => (
                                    <div
                                      key={u.id}
                                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                          {u.first_name[0]}
                                          {u.last_name[0]}
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-900">
                                            {u.first_name} {u.last_name}
                                          </p>
                                          <p className="text-[10px] text-slate-500">{u.email}</p>
                                        </div>
                                      </div>
                                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                                        {u.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                      <Building2 className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">
                        No healthcare facilities mapped directly under this district yet
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Hospitals can be assigned via the Hospital Registration module.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISTRICT HOSPITALS */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600 shrink-0">District Scope:</label>
              <select
                value={selectedDistrictId || ''}
                onChange={(e) => dispatch(setSelectedDistrictId(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/hospitals')}
                className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0d645e] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>All Facilities Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isHospitalsLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Fetching hospitals under {selectedDistrict?.name}...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDistrictHospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-200">
                        {hosp.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{hosp.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {hosp.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p className="font-mono text-[10px] text-slate-400">ID: {hosp.id}</p>
                    {hosp.contact_phone && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{hosp.contact_phone}</span>
                      </p>
                    )}
                    {hosp.contact_email && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{hosp.contact_email}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      District: {selectedDistrict?.name}
                    </span>
                    <button
                      onClick={() => {
                        dispatch(setSelectedHospitalId(hosp.id));
                        navigate('/admin/hospital-details');
                      }}
                      className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {selectedDistrictHospitals.length === 0 && (
                <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    No hospital facilities found in {selectedDistrict?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Register a new facility or select another district above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: REGISTER DISTRICT (POST /api/v1/districts)   */}
      {/* ---------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Register New District</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    POST /api/v1/districts • Regional Healthcare Sub-Division
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Parent State Authority <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createForm.state_id}
                  onChange={(e) => setCreateForm({ ...createForm, state_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                {formErrors.state_id && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.state_id}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  District Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore, Madurai, Mumbai Suburban"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white ${
                    formErrors.name ? 'border-rose-300' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  District Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. IN-TN-CBE, IN-MH-MUM"
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })
                  }
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:bg-white ${
                    formErrors.code ? 'border-rose-300' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.code}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="ACTIVE">ACTIVE (Operational)</option>
                  <option value="INACTIVE">INACTIVE (Planning / Staging)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Register District</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: EDIT DISTRICT (PATCH /api/v1/districts/{id})  */}
      {/* ---------------------------------------------------- */}
      {isEditModalOpen && targetDistrict && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Update District</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    PATCH /api/v1/districts/{targetDistrict.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">District Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">District Code</label>
                <input
                  type="text"
                  value={editForm.code || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Parent State</label>
                <select
                  value={editForm.state_id || ''}
                  onChange={(e) => setEditForm({ ...editForm, state_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={editForm.status || 'ACTIVE'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DECOMMISSIONED">DECOMMISSIONED</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: DELETE DISTRICT (DELETE /api/v1/districts)   */}
      {/* ---------------------------------------------------- */}
      {isDeleteModalOpen && targetDistrict && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Deactivate District</h3>
                <p className="text-xs text-rose-700 font-medium">Command Center Action Only</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete or deactivate{' '}
                <strong className="text-slate-900">
                  {targetDistrict.name} ({targetDistrict.code})
                </strong>
                ?
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hierarchy Cascade Warning</span>
                </p>
                <p>
                  Any healthcare units assigned to this district will lose their district routing link.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isActionLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Deactivate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: QUICK HIERARCHY INSPECTOR DRAWER            */}
      {/* ---------------------------------------------------- */}
      {isHierarchyModalOpen && selectedDistrict && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedDistrict.name} ({selectedDistrict.code})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    District Hierarchy Quick Inspector
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHierarchyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-800">
                    District Hospitals
                  </span>
                  <p className="text-lg font-bold text-blue-700">
                    {selectedDistrictHospitals.length} Mapped Facilities
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsHierarchyModalOpen(false);
                    setActiveTab('hierarchy');
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-2xs hover:bg-blue-700 transition-colors"
                >
                  Full Explorer
                </button>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hospitals in this District
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedDistrictHospitals.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-700 mr-2">{h.code}</span>
                        <span className="font-semibold text-slate-900">{h.name}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                        {h.status}
                      </span>
                    </div>
                  ))}
                  {selectedDistrictHospitals.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No hospitals assigned to this district yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setIsHierarchyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictManagementPage;
