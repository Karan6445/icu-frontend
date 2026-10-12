import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe2,
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
  Download,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchStatesThunk,
  fetchStateDistrictsThunk,
  fetchStateHierarchyThunk,
  createStateThunk,
  updateStateThunk,
  deleteStateThunk,
  setSelectedStateId,
  clearStateError,
  clearStateSuccessMessage,
} from '../../store/slices/stateSlice';
import {
  StateResponse,
  StateCreatePayload,
  StateUpdatePayload,
  DistrictWithHospitalsHierarchy,
  HospitalWithUsersHierarchy,
} from '../../types/stateHierarchy';
import { useNavigate } from 'react-router-dom';

export const StateManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    states,
    selectedStateId,
    selectedState,
    selectedStateDistricts,
    selectedStateHierarchy,
    isLoading,
    isHierarchyLoading,
    isDistrictsLoading,
    isActionLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.state);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'states' | 'hierarchy' | 'districts'>('states');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);

  // Targeted state for actions
  const [targetState, setTargetState] = useState<StateResponse | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<StateCreatePayload>({
    code: '',
    name: '',
    status: 'ACTIVE',
  });
  const [editForm, setEditForm] = useState<StateUpdatePayload>({
    code: '',
    name: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState<{ code?: string; name?: string }>({});

  // Hierarchy Tree Expanded Nodes State
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});
  const [showRawJson, setShowRawJson] = useState(false);
  const [hierarchyFilter, setHierarchyFilter] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchStatesThunk());
  }, [dispatch]);

  // Set default selected state if none selected
  useEffect(() => {
    if (states.length > 0 && !selectedStateId) {
      const defaultState = states.find((s) => s.code === 'IN-TN') || states[0];
      dispatch(setSelectedStateId(defaultState.id));
    }
  }, [states, selectedStateId, dispatch]);

  // When selected state changes in hierarchy tab, fetch hierarchy & districts
  useEffect(() => {
    if (selectedStateId) {
      dispatch(fetchStateHierarchyThunk(selectedStateId));
      dispatch(fetchStateDistrictsThunk(selectedStateId));
    }
  }, [selectedStateId, dispatch]);

  // Auto-dismiss banners after 5s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearStateSuccessMessage()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearStateError()), 6000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Filtered States
  const filteredStates = useMemo(() => {
    return states.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ? true : s.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [states, searchQuery, statusFilter]);

  // Executive Stats
  const totalStatesCount = states.length;
  const activeStatesCount = states.filter((s) => s.status.toUpperCase() === 'ACTIVE').length;
  const currentHierarchyDistrictCount = selectedStateHierarchy?.districts?.length || selectedStateDistricts.length || 0;
  const currentHierarchyHospitalCount = useMemo(() => {
    if (!selectedStateHierarchy?.districts) return 0;
    return selectedStateHierarchy.districts.reduce(
      (acc, d) => acc + (d.hospitals?.length || 0),
      0
    );
  }, [selectedStateHierarchy]);

  // Form Validation
  const validateCreateForm = () => {
    const errors: { code?: string; name?: string } = {};
    if (!createForm.code.trim()) {
      errors.code = 'State code is required (e.g. IN-MH, IN-TN)';
    } else if (createForm.code.trim().length < 2) {
      errors.code = 'Code must be at least 2 characters';
    }

    if (!createForm.name.trim()) {
      errors.name = 'State name is required (e.g. Maharashtra)';
    } else if (createForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setCreateForm({ code: '', name: '', status: 'ACTIVE' });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    await dispatch(createStateThunk(createForm));
    setIsCreateModalOpen(false);
    dispatch(fetchStatesThunk());
  };

  const handleOpenEditModal = (stateItem: StateResponse) => {
    setTargetState(stateItem);
    setEditForm({
      code: stateItem.code,
      name: stateItem.name,
      status: stateItem.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetState) return;

    await dispatch(
      updateStateThunk({
        id: targetState.id,
        payload: editForm,
      })
    );
    setIsEditModalOpen(false);
    dispatch(fetchStatesThunk());
  };

  const handleOpenDeleteModal = (stateItem: StateResponse) => {
    setTargetState(stateItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetState) return;
    await dispatch(deleteStateThunk(targetState.id));
    setIsDeleteModalOpen(false);
    dispatch(fetchStatesThunk());
  };

  const handleInspectHierarchy = (stateItem: StateResponse) => {
    dispatch(setSelectedStateId(stateItem.id));
    dispatch(fetchStateHierarchyThunk(stateItem.id));
    dispatch(fetchStateDistrictsThunk(stateItem.id));
    setIsHierarchyModalOpen(true);
  };

  const handleSwitchTabToHierarchy = (stateId: string) => {
    dispatch(setSelectedStateId(stateId));
    setActiveTab('hierarchy');
  };

  const toggleDistrictExpand = (distId: string) => {
    setExpandedDistricts((prev) => ({ ...prev, [distId]: !prev[distId] }));
  };

  const toggleHospitalExpand = (hospId: string) => {
    setExpandedHospitals((prev) => ({ ...prev, [hospId]: !prev[hospId] }));
  };

  const toggleAllDistricts = () => {
    if (!selectedStateHierarchy?.districts) return;
    const allExpanded = selectedStateHierarchy.districts.every((d) => expandedDistricts[d.id]);
    const newState: Record<string, boolean> = {};
    selectedStateHierarchy.districts.forEach((d) => {
      newState[d.id] = !allExpanded;
    });
    setExpandedDistricts(newState);
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Toast / Notification Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button
            onClick={() => dispatch(clearStateSuccessMessage())}
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
            onClick={() => dispatch(clearStateError())}
            className="text-rose-600 hover:text-rose-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#0F766E]">
                  State Hierarchy & Regional Governance
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-100 text-[#0F766E] rounded-full border border-teal-200">
                  Command Center
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                National Multi-Tenant Regional Architecture • State → District → Facility → Staff
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* API Live Status Pill */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-medium text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-500">API: /api/v1/states</span>
          </div>

          <button
            onClick={() => {
              dispatch(fetchStatesThunk());
              if (selectedStateId) {
                dispatch(fetchStateHierarchyThunk(selectedStateId));
                dispatch(fetchStateDistrictsThunk(selectedStateId));
              }
            }}
            disabled={isLoading || isHierarchyLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Refresh from Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New State</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total States / UTs
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStatesCount}</h3>
            <span className="text-[11px] text-teal-600 font-medium">National Jurisdictions</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-[#0F766E]">
            <Globe2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Regional Nodes
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeStatesCount}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Operational Status</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Districts in Focus
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {currentHierarchyDistrictCount}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Mapped in {selectedState?.name || 'Selected State'}
            </span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hierarchy Depth
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">4 Tiers</h3>
            <span className="text-[11px] text-indigo-600 font-medium">State → Dist → Hosp → Staff</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <GitFork className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 bg-white px-4 pt-2 rounded-t-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('states')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'states'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>States Directory ({states.length})</span>
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
          <span>Full Hierarchy Explorer</span>
          {selectedState && (
            <span className="ml-1 px-2 py-0.5 bg-teal-50 border border-teal-200 text-[#0F766E] rounded-md text-[10px]">
              {selectedState.code}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('districts')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'districts'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>State Districts ({selectedStateDistricts.length})</span>
        </button>
      </div>

      {/* TAB 1: STATES DIRECTORY */}
      {activeTab === 'states' && (
        <div className="space-y-4">
          {/* Controls / Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search state by name or code (e.g. IN-TN)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
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
                Loading State Hierarchy from backend API...
              </p>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStates.map((stateItem) => {
                const isActive = stateItem.status.toUpperCase() === 'ACTIVE';
                const isCurrentSelected = selectedStateId === stateItem.id;

                return (
                  <div
                    key={stateItem.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-5 space-y-4 hover:shadow-md ${
                      isCurrentSelected
                        ? 'border-[#0F766E] ring-2 ring-teal-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                          {stateItem.code.replace('IN-', '') || stateItem.code}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {stateItem.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-500 font-semibold">
                              {stateItem.code}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {stateItem.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>ID: {stateItem.id.slice(0, 13)}...</span>
                      <span>
                        Created:{' '}
                        {stateItem.created_at
                          ? new Date(stateItem.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleSwitchTabToHierarchy(stateItem.id)}
                        className="flex-1 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-teal-200"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Hierarchy</span>
                      </button>

                      <button
                        onClick={() => handleInspectHierarchy(stateItem)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        title="Quick Inspect"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(stateItem)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        title="Edit State"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenDeleteModal(stateItem)}
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
                      <th className="py-3 px-4">State Code</th>
                      <th className="py-3 px-4">State Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Identifier UUID</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStates.map((stateItem) => {
                      const isActive = stateItem.status.toUpperCase() === 'ACTIVE';
                      return (
                        <tr key={stateItem.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                            {stateItem.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {stateItem.name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {stateItem.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {stateItem.id}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {stateItem.created_at
                              ? new Date(stateItem.created_at).toLocaleString()
                              : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSwitchTabToHierarchy(stateItem.id)}
                                className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                              >
                                Hierarchy
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(stateItem)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(stateItem)}
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

          {!isLoading && filteredStates.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No states found matching filter</p>
              <p className="text-xs text-slate-400">
                Try refining your search keyword or clear active filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FULL HIERARCHY TREE EXPLORER */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          {/* Top Bar for Hierarchy Selection & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-600 shrink-0">Select State Node:</label>
              <select
                value={selectedStateId || ''}
                onChange={(e) => dispatch(setSelectedStateId(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#0F766E] w-full sm:w-72"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
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
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <button
                onClick={toggleAllDistricts}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Toggle Expand
              </button>

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

          {/* Raw JSON Debug View */}
          {showRawJson && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 shadow-inner">
              <pre>{JSON.stringify(selectedStateHierarchy, null, 2)}</pre>
            </div>
          )}

          {/* Interactive Hierarchy Tree Component */}
          {isHierarchyLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Resolving full hierarchical branch for {selectedState?.name}...
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Root State Node */}
              <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {selectedStateHierarchy?.code?.replace('IN-', '') || selectedState?.code || 'ST'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-200 text-teal-800">
                        Tier 1: State Authority
                      </span>
                      <span className="font-mono text-xs font-semibold text-teal-700">
                        {selectedStateHierarchy?.code || selectedState?.code}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                      {selectedStateHierarchy?.name || selectedState?.name}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Status: {selectedStateHierarchy?.status || 'ACTIVE'} • ID: {selectedStateId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white px-4 py-2 rounded-xl border border-teal-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Districts
                    </span>
                    <span className="text-lg font-bold text-[#0F766E]">
                      {selectedStateHierarchy?.districts?.length || 0}
                    </span>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-teal-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Hospitals
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {currentHierarchyHospitalCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* District Branches */}
              <div className="space-y-4 pl-4 border-l-2 border-teal-200 ml-6">
                {selectedStateHierarchy?.districts && selectedStateHierarchy.districts.length > 0 ? (
                  selectedStateHierarchy.districts
                    .filter((d) => {
                      if (!hierarchyFilter) return true;
                      const term = hierarchyFilter.toLowerCase();
                      return (
                        d.name.toLowerCase().includes(term) ||
                        d.code.toLowerCase().includes(term) ||
                        d.hospitals?.some((h) => h.name.toLowerCase().includes(term))
                      );
                    })
                    .map((district) => {
                      const isExpanded = expandedDistricts[district.id] ?? true;
                      const hospitalsCount = district.hospitals?.length || 0;

                      return (
                        <div
                          key={district.id}
                          className="bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                        >
                          {/* District Node Header */}
                          <div
                            onClick={() => toggleDistrictExpand(district.id)}
                            className="p-4 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <button className="text-slate-400 hover:text-slate-700">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#0F766E]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                    Tier 2: District
                                  </span>
                                  <span className="font-mono text-xs font-bold text-slate-600">
                                    {district.code}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">{district.name}</h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-semibold">
                                {hospitalsCount} {hospitalsCount === 1 ? 'Hospital' : 'Hospitals'}
                              </span>
                            </div>
                          </div>

                          {/* Hospital Children */}
                          {isExpanded && (
                            <div className="p-4 space-y-3 pl-8 border-l-2 border-blue-200 ml-6 my-2">
                              {district.hospitals && district.hospitals.length > 0 ? (
                                district.hospitals.map((hospital) => {
                                  const isHospExpanded = expandedHospitals[hospital.id] ?? true;
                                  const usersCount = hospital.users?.length || 0;

                                  return (
                                    <div
                                      key={hospital.id}
                                      className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 shadow-2xs"
                                    >
                                      <div
                                        onClick={() => toggleHospitalExpand(hospital.id)}
                                        className="flex items-center justify-between cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <button className="text-slate-400">
                                            {isHospExpanded ? (
                                              <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                                            ) : (
                                              <ChevronRight className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                                            <Building2 className="w-3.5 h-3.5" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded">
                                                Tier 3: Facility
                                              </span>
                                              <span className="font-mono text-[11px] font-semibold text-slate-500">
                                                {hospital.code}
                                              </span>
                                            </div>
                                            <h5 className="font-bold text-slate-900 text-xs">
                                              {hospital.name}
                                            </h5>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] text-slate-500 font-medium">
                                            {usersCount} Staff Active
                                          </span>
                                        </div>
                                      </div>

                                      {/* Users / Staff Level */}
                                      {isHospExpanded && hospital.users && hospital.users.length > 0 && (
                                        <div className="pl-6 border-l-2 border-emerald-200 ml-4 pt-1 space-y-1.5">
                                          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                            Tier 4: Clinical Staff & Administrators
                                          </span>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {hospital.users.map((u) => (
                                              <div
                                                key={u.id}
                                                className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center font-bold text-[10px]">
                                                    {u.first_name[0]}
                                                    {u.last_name[0]}
                                                  </div>
                                                  <div>
                                                    <p className="font-semibold text-slate-900 leading-tight">
                                                      {u.first_name} {u.last_name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">{u.email}</p>
                                                  </div>
                                                </div>
                                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">
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
                                <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                                  <p className="text-xs text-slate-500 font-medium">
                                    No healthcare facilities mapped directly under this district yet.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <MapPin className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      No district hierarchy records returned for this state
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Districts can be created under this state using the District Management module.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISTRICTS DRILLDOWN */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600 shrink-0">State Scope:</label>
              <select
                value={selectedStateId || ''}
                onChange={(e) => dispatch(setSelectedStateId(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-[#0F766E]"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/districts')}
                className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#0d645e] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Open District Network Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isDistrictsLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Fetching districts for {selectedState?.name}...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedStateDistricts.map((dist) => (
                <div
                  key={dist.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-200">
                        {dist.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{dist.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {dist.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {dist.id.slice(0, 15)}...
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      State: {selectedState?.name}
                    </span>
                    <button
                      onClick={() => navigate('/admin/districts')}
                      className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {selectedStateDistricts.length === 0 && (
                <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    No district entities mapped under {selectedState?.name} yet
                  </p>
                  <p className="text-xs text-slate-400">
                    Register a new district or select another state jurisdiction above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: REGISTER NEW STATE (POST /api/v1/states)     */}
      {/* ---------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0F766E] text-white rounded-xl shadow-xs">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Register New State</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    POST /api/v1/states • Multi-Tenant Healthcare Jurisdiction
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
                  State Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Tamil Nadu, Karnataka"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white ${
                    formErrors.name ? 'border-rose-300' : 'border-slate-300 focus:border-[#0F766E]'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  State Code / Regional Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. IN-MH, IN-TN, IN-KA"
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })
                  }
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:bg-white ${
                    formErrors.code ? 'border-rose-300' : 'border-slate-300 focus:border-[#0F766E]'
                  }`}
                />
                <p className="text-[10px] text-slate-400 font-mono">
                  ISO-3166-2 standard convention recommended (e.g. IN-TN).
                </p>
                {formErrors.code && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.code}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Initial Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="ACTIVE">ACTIVE (Fully Operational)</option>
                  <option value="INACTIVE">INACTIVE (Staging / Provisioning)</option>
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
                  className="px-5 py-2.5 text-xs font-bold bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Register State</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: EDIT STATE (PATCH /api/v1/states/{id})       */}
      {/* ---------------------------------------------------- */}
      {isEditModalOpen && targetState && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0F766E] text-white rounded-xl shadow-xs">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Update State Entity</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    PATCH /api/v1/states/{targetState.id.slice(0, 8)}...
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
                <label className="text-xs font-bold text-slate-700">State Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State Code</label>
                <input
                  type="text"
                  value={editForm.code || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Operational Status</label>
                <select
                  value={editForm.status || 'ACTIVE'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F766E]"
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
                  className="px-5 py-2.5 text-xs font-bold bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
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
      {/* MODAL 3: DELETE / DEACTIVATE CONFIRMATION            */}
      {/* ---------------------------------------------------- */}
      {isDeleteModalOpen && targetState && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Deactivate State Authority</h3>
                <p className="text-xs text-rose-700 font-medium">Command Center Action Only</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to deactivate or remove{' '}
                <strong className="text-slate-900">
                  {targetState.name} ({targetState.code})
                </strong>
                ?
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cascade Caution</span>
                </p>
                <p>
                  Deactivating this state will impact dependent districts and healthcare facility routing in this region.
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
      {isHierarchyModalOpen && selectedState && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0F766E] text-white rounded-xl shadow-xs">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedState.name} ({selectedState.code}) Hierarchy
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    State ID: {selectedState.id}
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
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800">
                    Direct Districts
                  </span>
                  <p className="text-lg font-bold text-[#0F766E]">
                    {selectedStateDistricts.length} Active Districts
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsHierarchyModalOpen(false);
                    setActiveTab('hierarchy');
                  }}
                  className="px-3 py-1.5 bg-[#0F766E] text-white text-xs font-semibold rounded-lg shadow-2xs hover:bg-[#0d645e] transition-colors"
                >
                  Open Full Explorer
                </button>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Districts in this State
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedStateDistricts.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-600 mr-2">{d.code}</span>
                        <span className="font-semibold text-slate-900">{d.name}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                        {d.status}
                      </span>
                    </div>
                  ))}
                  {selectedStateDistricts.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No districts mapped yet.</p>
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

export default StateManagementPage;
