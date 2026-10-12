import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Network,
  Search,
  Plus,
  RefreshCw,
  Layers,
  ChevronRight,
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
  Cpu,
  Settings,
  Eye,
  Hospital,
  Sliders,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchOrganizationsThunk,
  createOrganizationThunk,
  setSelectedOrganizationId,
  clearOrganizationError,
  clearOrganizationSuccessMessage,
} from '../../store/slices/organizationSlice';
import { fetchHospitalsThunk } from '../../store/slices/hospitalSlice';
import {
  OrganizationResponse,
  OrganizationCreatePayload,
} from '../../types/organization';
import { useNavigate } from 'react-router-dom';

export const OrganizationManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    organizations,
    selectedOrganizationId,
    selectedOrganization,
    isLoading,
    isActionLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.organization);

  const { hospitals } = useAppSelector((state) => state.hospital);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'directory' | 'architecture'>('directory');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'ENTERPRISE' | 'STANDARD'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [targetOrg, setTargetOrg] = useState<OrganizationResponse | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<OrganizationCreatePayload>({
    code: '',
    name: '',
    tier: 'ENTERPRISE',
    config: {
      tele_icu_enabled: true,
    },
  });
  const [teleIcuEnabled, setTeleIcuEnabled] = useState(true);
  const [formErrors, setFormErrors] = useState<{ code?: string; name?: string }>({});

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchOrganizationsThunk());
    dispatch(fetchHospitalsThunk());
  }, [dispatch]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearOrganizationSuccessMessage()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearOrganizationError()), 6000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Filtered Organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier =
        tierFilter === 'ALL' ? true : org.tier.toUpperCase() === tierFilter;
      const matchesStatus =
        statusFilter === 'ALL' ? true : org.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [organizations, searchTerm, tierFilter, statusFilter]);

  // Stats
  const totalCount = organizations.length;
  const enterpriseCount = organizations.filter(
    (o) => o.tier.toUpperCase() === 'ENTERPRISE'
  ).length;
  const teleIcuCount = organizations.filter(
    (o) => o.config?.tele_icu_enabled === true
  ).length;
  const totalHospitalsMapped = hospitals.length;

  // Validation
  const validateCreateForm = () => {
    const errors: { code?: string; name?: string } = {};
    if (!createForm.code.trim()) {
      errors.code = 'Organization Code is required (e.g. ORG-APOLLO-01)';
    } else if (createForm.code.trim().length < 2) {
      errors.code = 'Code must be at least 2 characters';
    }

    if (!createForm.name.trim()) {
      errors.name = 'Organization Name is required (e.g. Apollo Healthcare Group)';
    } else if (createForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setCreateForm({
      code: '',
      name: '',
      tier: 'ENTERPRISE',
      config: { tele_icu_enabled: true },
    });
    setTeleIcuEnabled(true);
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    await dispatch(
      createOrganizationThunk({
        ...createForm,
        code: createForm.code.toUpperCase().trim(),
        name: createForm.name.trim(),
        config: {
          ...createForm.config,
          tele_icu_enabled: teleIcuEnabled,
        },
      })
    );
    setIsCreateModalOpen(false);
    dispatch(fetchOrganizationsThunk());
  };

  const handleOpenConfigModal = (org: OrganizationResponse) => {
    setTargetOrg(org);
    setIsConfigModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button
            onClick={() => dispatch(clearOrganizationSuccessMessage())}
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
            onClick={() => dispatch(clearOrganizationError())}
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
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-700">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  Healthcare Organizations & Parent Trusts
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                  Tenant Root
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Parent Multi-Tenant Healthcare Entities • Organization → Hospital Facilities → Wards
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* API Status Pill */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-medium text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-500">API: /api/v1/organizations</span>
          </div>

          <button
            onClick={() => navigate('/admin/hospitals')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Facilities Directory</span>
          </button>

          <button
            onClick={() => dispatch(fetchOrganizationsThunk())}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Refresh from Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Parent Organization</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Organizations
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Healthcare Parent Trusts</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
            <Network className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enterprise Tier
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{enterpriseCount}</h3>
            <span className="text-[11px] text-indigo-600 font-medium">Enterprise License</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tele-ICU Enabled
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{teleIcuCount}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Command Center Active</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hospital Facilities
            </p>
            <h3 className="text-2xl font-bold text-teal-600 mt-1">{totalHospitalsMapped}</h3>
            <span className="text-[11px] text-teal-600 font-medium">Affiliated Hospitals</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 bg-white px-4 pt-2 rounded-t-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'directory'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Organizations Directory ({filteredOrganizations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'architecture'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Multi-Tenant Architecture Map</span>
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search organization by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-purple-600"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="STANDARD">Standard</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-purple-600"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-2xs text-purple-700'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white shadow-2xs text-purple-700'
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
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Loading organizations from /api/v1/organizations...
              </p>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrganizations.map((org) => {
                const isEnterprise = org.tier.toUpperCase() === 'ENTERPRISE';
                const hasTeleIcu = org.config?.tele_icu_enabled === true;

                return (
                  <div
                    key={org.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Network className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {org.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-purple-700 font-bold">
                              {org.code}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isEnterprise
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {org.tier}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {org.status}
                      </span>
                    </div>

                    {/* Features / Config Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hasTeleIcu && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md border border-emerald-200 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          <span>Tele-ICU Enabled</span>
                        </span>
                      )}
                      {org.config?.synthetic_fixture && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-md border border-amber-200">
                          Synthetic Fixture
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>ID: {org.id.slice(0, 14)}...</span>
                      <span>
                        {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => navigate('/admin/hospitals')}
                        className="flex-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-purple-200"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>View Facilities</span>
                      </button>

                      <button
                        onClick={() => handleOpenConfigModal(org)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        title="Inspect Config"
                      >
                        <FileCode className="w-4 h-4" />
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
                      <th className="py-3 px-4">Org Code</th>
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">License Tier</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Organization UUID</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredOrganizations.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">
                          {org.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {org.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {org.tier}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {org.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {org.id}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {org.created_at ? new Date(org.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenConfigModal(org)}
                              className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              Config JSON
                            </button>
                            <button
                              onClick={() => navigate('/admin/hospitals')}
                              className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                            >
                              Facilities
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && filteredOrganizations.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Network className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No organizations found</p>
              <p className="text-xs text-slate-400">
                Register a new parent organization or reset search filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MULTI-TENANT ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Multi-Tenant Critical Care Architecture Overview
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Smart ICU platform follows a four-tier tenancy governance model isolating data and security per parent organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tier 1 */}
            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">
                Tier 1
              </span>
              <h4 className="font-bold text-purple-900 text-base">Parent Organization</h4>
              <p className="text-xs text-purple-700 leading-relaxed">
                Healthcare trust, conglomerate, or government directorate managing multiple hospitals with central policy and licensing.
              </p>
              <span className="font-mono text-[10px] text-purple-600 block mt-2">
                Endpoint: /api/v1/organizations
              </span>
            </div>

            {/* Tier 2 */}
            <div className="p-5 bg-teal-50 rounded-2xl border border-teal-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                Tier 2
              </span>
              <h4 className="font-bold text-[#0F766E] text-base">Hospital Facility</h4>
              <p className="text-xs text-teal-800 leading-relaxed">
                Physical or virtual hospital entity mapped under an organization and local geographical district.
              </p>
              <span className="font-mono text-[10px] text-teal-600 block mt-2">
                Endpoint: /api/v1/hospitals
              </span>
            </div>

            {/* Tier 3 */}
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                Tier 3
              </span>
              <h4 className="font-bold text-blue-900 text-base">ICU Wards & Depts</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Intensive Care Units (MICU, SICU, PICU, CCU) hosted inside hospital facilities.
              </p>
              <span className="font-mono text-[10px] text-blue-600 block mt-2">
                Endpoint: /api/v1/icus
              </span>
            </div>

            {/* Tier 4 */}
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">
                Tier 4
              </span>
              <h4 className="font-bold text-indigo-900 text-base">Beds & Telemetry</h4>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Active ICU beds, bedside monitors, medical telemetry streams, and admitted patients.
              </p>
              <span className="font-mono text-[10px] text-indigo-600 block mt-2">
                Endpoint: /api/v1/beds
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: REGISTER PARENT HEALTHCARE ORGANIZATION     */}
      {/* ---------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Register Parent Organization</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    POST /api/v1/organizations • Tenant Root Entity
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
                  Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Healthcare Trust, Max Healthcare Network"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white ${
                    formErrors.name ? 'border-rose-300' : 'border-slate-300 focus:border-purple-600'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Organization Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORG-APOLLO-01, NHS-TRUST-02"
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })
                  }
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:bg-white ${
                    formErrors.code ? 'border-rose-300' : 'border-slate-300 focus:border-purple-600'
                  }`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.code}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">License / Tenant Tier</label>
                <select
                  value={createForm.tier}
                  onChange={(e) => setCreateForm({ ...createForm, tier: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                >
                  <option value="ENTERPRISE">ENTERPRISE (Full Multi-Hospital Suite)</option>
                  <option value="STANDARD">STANDARD</option>
                  <option value="ACADEMIC">ACADEMIC / RESEARCH</option>
                </select>
              </div>

              {/* Feature Configuration Checkbox */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Tele-ICU Command Center Integration
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Enables central multi-hospital monitoring & bed census aggregation
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={teleIcuEnabled}
                  onChange={(e) => setTeleIcuEnabled(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
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
                  className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Register Organization</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: INSPECT CONFIG JSON MODAL                   */}
      {/* ---------------------------------------------------- */}
      {isConfigModalOpen && targetOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-purple-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 text-white rounded-xl">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {targetOrg.name} Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Code: {targetOrg.code} • Tier: {targetOrg.tier}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-60 shadow-inner">
                <pre>{JSON.stringify(targetOrg.config || {}, null, 2)}</pre>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagementPage;
