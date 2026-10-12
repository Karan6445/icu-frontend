import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchRolesThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  assignRolePermissionsThunk,
  revokeSingleRolePermissionThunk,
  fetchPermissionsThunk,
  fetchPermissionsMatrixThunk,
  assignTenantMembershipThunk,
  setSearchQuery,
  setSelectedModuleFilter,
  clearRoleError,
  clearRoleSuccessMessage,
  PermissionAction,
} from '../../store/slices/rolePermissionSlice';
import { fetchHospitalsThunk } from '../../store/slices/hospitalSlice';
import { fetchUsersThunk } from '../../store/slices/userSlice';
import { TenantMembershipCreate } from '../../api/tenantApi';
import {
  RoleResponse,
  PermissionResponse,
  RoleCreatePayload,
  RoleUpdatePayload,
  normalizePermissionCode,
  normalizePermissionCodes,
} from '../../api/roleApi';
import {
  FALLBACK_PERMISSIONS_MATRIX,
  ResourcePermissionsSummary,
} from '../../api/permissionApi';
import {
  ShieldCheck,
  Shield,
  Plus,
  Search,
  Check,
  Trash2,
  Edit2,
  X,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Layers,
  Copy,
  Key,
  Database,
  Filter,
  CheckCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

export const AdminRolesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useRBAC();
  const {
    roles,
    permissions,
    permissionsMatrix,
    searchQuery,
    selectedModuleFilter,
    isLoading,
    isActionLoading,
    isPermissionsLoading,
    isMatrixLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.rolePermission);
  const { hospitals } = useAppSelector((state) => state.hospital);
  const { users } = useAppSelector((state) => state.user);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'roles-matrix' | 'resource-matrix' | 'system-permissions'>('roles-matrix');

  // Filters
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('ALL');
  const [selectedRoleTypeFilter, setSelectedRoleTypeFilter] = useState<'ALL' | 'SYSTEM' | 'CUSTOM'>('ALL');

  // Permissions Catalog Search & Copy State
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);
  const [tenantMembershipModalOpen, setTenantMembershipModalOpen] = useState(false);
  const [tenantMembershipForm, setTenantMembershipForm] = useState<TenantMembershipCreate>({
    user_id: '',
    hospital_id: '',
    role_id: '',
    badge_number: '',
  });

  // Modal Permission Search & Module Filter
  const [modalPermSearch, setModalPermSearch] = useState<string>('');
  const [modalActiveModule, setModalActiveModule] = useState<string>('ALL');

  // Form: Create Role
  const [newRoleForm, setNewRoleForm] = useState<RoleCreatePayload>({
    code: '',
    name: '',
    description: '',
    hospital_id: '',
    permission_codes: [],
  });

  // Form: Edit Role
  const [editRoleForm, setEditRoleForm] = useState<RoleUpdatePayload>({
    name: '',
    description: '',
    permission_codes: [],
  });

  // CRUD actions for matrix columns
  const actions: { label: PermissionAction; key: 'read' | 'create' | 'update' | 'delete' }[] = [
    { label: 'View', key: 'read' },
    { label: 'Create', key: 'create' },
    { label: 'Edit', key: 'update' },
    { label: 'Delete', key: 'delete' },
  ];

  // Initial Fetch on component mount
  useEffect(() => {
    dispatch(fetchRolesThunk());
    dispatch(fetchPermissionsThunk());
    dispatch(fetchPermissionsMatrixThunk());
    dispatch(fetchHospitalsThunk());
    dispatch(fetchUsersThunk());
  }, [dispatch]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearRoleSuccessMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Copy helper
  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Synchronized active resources matrix (from GET /api/v1/permissions/matrix)
  const activeMatrix: ResourcePermissionsSummary[] = useMemo(() => {
    if (Array.isArray(permissionsMatrix) && permissionsMatrix.length > 0) {
      return permissionsMatrix;
    }
    return FALLBACK_PERMISSIONS_MATRIX;
  }, [permissionsMatrix]);

  // Unique modules extracted dynamically from loaded system permissions
  const availableModules = useMemo(() => {
    const mods = new Set<string>();
    permissions.forEach((p) => {
      if (p.module) mods.add(p.module.toLowerCase());
    });
    activeMatrix.forEach((m) => {
      if (m.resource) mods.add(m.resource.toLowerCase());
    });
    return Array.from(mods).sort();
  }, [permissions, activeMatrix]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return (roles || []).filter((role) => {
      if (!role) return false;
      const name = (role.name || '').toLowerCase();
      const code = (role.code || role.id || '').toLowerCase();
      const desc = (role.description || '').toLowerCase();
      const query = (searchQuery || '').toLowerCase();

      const matchesSearch = name.includes(query) || code.includes(query) || desc.includes(query);
      const matchesHospital =
        selectedHospitalFilter === 'ALL' || !role.hospital_id || role.hospital_id === selectedHospitalFilter;

      const isSystem = Boolean(role.is_system_role || (role as any).isSystemDefault);
      const matchesType =
        selectedRoleTypeFilter === 'ALL' ||
        (selectedRoleTypeFilter === 'SYSTEM' && isSystem) ||
        (selectedRoleTypeFilter === 'CUSTOM' && !isSystem);

      return matchesSearch && matchesHospital && matchesType;
    });
  }, [roles, searchQuery, selectedHospitalFilter, selectedRoleTypeFilter]);

  // Filtered Permissions Catalog (from GET /api/v1/permissions)
  const filteredCatalogPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesModule =
        selectedModuleFilter === 'ALL' || p.module.toLowerCase() === selectedModuleFilter.toLowerCase();
      const q = catalogSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        (p.action || '').toLowerCase().includes(q);
      return matchesModule && matchesSearch;
    });
  }, [permissions, selectedModuleFilter, catalogSearch]);

  // Filtered Permissions inside Create/Edit Modal
  const modalFilteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesModule =
        modalActiveModule === 'ALL' || p.module.toLowerCase() === modalActiveModule.toLowerCase();
      const q = modalPermSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q);
      return matchesModule && matchesSearch;
    });
  }, [permissions, modalActiveModule, modalPermSearch]);

  // Group modal permissions by module
  const modalGroupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionResponse[]> = {};
    modalFilteredPermissions.forEach((p) => {
      const mod = p.module.toLowerCase();
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(p);
    });
    return groups;
  }, [modalFilteredPermissions]);

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  const handleRefreshAll = () => {
    dispatch(fetchRolesThunk());
    dispatch(fetchPermissionsThunk(selectedModuleFilter === 'ALL' ? undefined : selectedModuleFilter));
    dispatch(fetchPermissionsMatrixThunk());
    dispatch(fetchHospitalsThunk());
  };

  const handleModuleFilterChange = (mod: string) => {
    dispatch(setSelectedModuleFilter(mod));
    if (mod !== 'ALL') {
      dispatch(fetchPermissionsThunk(mod));
    } else {
      dispatch(fetchPermissionsThunk());
    }
  };

  const handleOpenCreateModal = () => {
    setNewRoleForm({
      code: 'ROLE_',
      name: '',
      description: '',
      hospital_id: hospitals[0]?.id || '',
      permission_codes: [
        'patient:read',
        'bed:read',
        'staff:read',
        'clinical:read',
        'audit:read',
      ],
    });
    setModalPermSearch('');
    setModalActiveModule('ALL');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.code || !newRoleForm.name) return;

    const normalizedCodes = normalizePermissionCodes(newRoleForm.permission_codes);

    await dispatch(
      createRoleThunk({
        code: newRoleForm.code.toUpperCase().trim(),
        name: newRoleForm.name.trim(),
        description: newRoleForm.description ? newRoleForm.description.trim() : null,
        hospital_id: newRoleForm.hospital_id ? newRoleForm.hospital_id : null,
        permission_codes: normalizedCodes,
      })
    );
    setCreateModalOpen(false);
  };

  const handleOpenEditModal = (role: RoleResponse) => {
    setEditingRole(role);
    setModalPermSearch('');
    setModalActiveModule('ALL');
    setEditRoleForm({
      name: role.name || '',
      description: role.description || '',
      permission_codes: Array.isArray(role.permissions)
        ? normalizePermissionCodes(
            role.permissions.map((p) => (typeof p === 'string' ? p : p?.code)).filter(Boolean) as string[]
          )
        : [],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    const normalizedCodes = normalizePermissionCodes(editRoleForm.permission_codes);

    await dispatch(
      updateRoleThunk({
        id: editingRole.id,
        payload: {
          ...editRoleForm,
          permission_codes: normalizedCodes,
        },
      })
    );
    setEditingRole(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;
    await dispatch(deleteRoleThunk(deletingRole.id));
    setDeletingRole(null);
  };

  // Toggle permission directly from matrix table for a role
  const handleToggleMatrixPermission = async (role: RoleResponse, permCode: string) => {
    const normalizedTarget = normalizePermissionCode(permCode);
    const perms = Array.isArray(role.permissions) ? role.permissions : [];
    const alreadyHas = perms.some((p) => {
      const code = typeof p === 'string' ? p : p?.code;
      return code && (code === permCode || normalizePermissionCode(code) === normalizedTarget);
    });

    if (alreadyHas) {
      await dispatch(
        revokeSingleRolePermissionThunk({
          id: role.id,
          permission_code: permCode,
        })
      );
    } else {
      await dispatch(
        assignRolePermissionsThunk({
          id: role.id,
          permission_codes: [permCode],
        })
      );
    }
  };

  const getHospitalName = (hId?: string | null) => {
    if (!hId) return 'Global (All Facilities)';
    const found = hospitals.find((h) => h.id === hId);
    return found ? found.name : 'Metro Central Hospital';
  };

  // Helper to get roles that possess a specific permission code
  const getRolesWithPermission = (permCode: string) => {
    const norm = normalizePermissionCode(permCode);
    return roles.filter((r) =>
      (r.permissions || []).some((p) => {
        const c = typeof p === 'string' ? p : p?.code;
        return c && (c === permCode || normalizePermissionCode(c) === norm);
      })
    );
  };

  const getActionBadgeColor = (action?: string | null) => {
    const act = (action || '').toUpperCase();
    if (act === 'CREATE') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    if (act === 'READ') return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800';
    if (act === 'UPDATE') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    if (act === 'DELETE') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
  };

  const handleOpenTenantModal = (preselectedRoleId?: string, preselectedHospitalId?: string | null) => {
    setTenantMembershipForm({
      user_id: users[0]?.id || '',
      hospital_id: preselectedHospitalId || hospitals[0]?.id || '',
      role_id: preselectedRoleId || (roles[0]?.id || ''),
      badge_number: `STAFF-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setTenantMembershipModalOpen(true);
  };

  const handleAssignTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantMembershipForm.user_id || !tenantMembershipForm.hospital_id || !tenantMembershipForm.role_id) {
      return;
    }
    const result = await dispatch(assignTenantMembershipThunk(tenantMembershipForm));
    if (assignTenantMembershipThunk.fulfilled.match(result)) {
      setTenantMembershipModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#10B981] selection:text-white">
      {/* ================= HEADER BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 font-mono text-xs font-bold rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC & PERMISSIONS ENGINE
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-mono rounded-md">
              API: http://10.51.4.18:8000
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Role-Based Access Control & Permissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Integrated with backend OpenAPI endpoints <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-teal-700 dark:text-teal-300 font-mono">GET /api/v1/permissions</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-teal-700 dark:text-teal-300 font-mono">GET /api/v1/permissions/matrix</code>. Manage system & custom roles, inspect CRUD matrices, and audit security access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            disabled={isLoading || isPermissionsLoading || isMatrixLoading}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Refresh All APIs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isPermissionsLoading || isMatrixLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Sync Backend</span>
          </button>

          <button
            onClick={() => handleOpenTenantModal()}
            className="px-3.5 sm:px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            title="Assign User to Hospital Tenant with Role (POST /api/v1/tenants/memberships)"
          >
            <Building2 className="w-4 h-4 stroke-[2.5]" />
            <span>Assign Tenant Membership</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 sm:px-5 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* ================= NOTIFICATIONS ================= */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => dispatch(clearRoleSuccessMessage())} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => dispatch(clearRoleError())} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('roles-matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roles-matrix'
              ? 'bg-white dark:bg-slate-900 text-[#0F766E] dark:text-teal-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Profiles & Access Matrix</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
            {roles.length} Roles
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resource-matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'resource-matrix'
              ? 'bg-white dark:bg-slate-900 text-[#0F766E] dark:text-teal-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Resource CRUD Matrix for UI</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold">
            {activeMatrix.length} Modules
          </span>
        </button>

        <button
          onClick={() => setActiveTab('system-permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system-permissions'
              ? 'bg-white dark:bg-slate-900 text-[#0F766E] dark:text-teal-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>System Permissions Catalog</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold">
            {permissions.length} Permissions
          </span>
        </button>
      </div>

      {/* ================= TAB 1: ROLES & ASSIGNMENT MATRIX ================= */}
      {activeTab === 'roles-matrix' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search roles by title, code or scope..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white font-medium focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Hospital Filter */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-bold">Facility:</span>
                <select
                  value={selectedHospitalFilter}
                  onChange={(e) => setSelectedHospitalFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Facilities</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-bold">Type:</span>
                <select
                  value={selectedRoleTypeFilter}
                  onChange={(e) => setSelectedRoleTypeFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SYSTEM">System Roles Only</option>
                  <option value="CUSTOM">Custom Roles Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Roles Cards with Dynamic Matrix */}
          <div className="space-y-6">
            {filteredRoles.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                No matching roles found. Click &quot;Create Custom Role&quot; to provision a new security profile.
              </div>
            ) : (
              filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs"
                >
                  {/* Role Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          role.is_system_role
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {role.name || 'Unnamed Role'}
                          </h3>
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                            {role.code || role.id}
                          </span>
                          {role.is_system_role ? (
                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] rounded border border-purple-200 dark:border-purple-800 font-bold">
                              SYSTEM ROLE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-[10px] rounded border border-teal-200 dark:border-teal-800 font-bold">
                              CUSTOM ROLE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                          {role.description || 'No role description provided.'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{getHospitalName(role.hospital_id)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {Array.isArray(role.permissions) ? role.permissions.length : 0} Permissions Active
                      </span>

                      <button
                        onClick={() => handleOpenTenantModal(role.id, role.hospital_id)}
                        className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                        title="Assign Staff Member to this Role in Hospital Facility Tenant"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Assign Staff</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(role)}
                        className="p-2 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-xl transition-colors cursor-pointer"
                        title="Edit Role Details & Permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {!role.is_system_role && (
                        <button
                          onClick={() => setDeletingRole(role)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic CRUD Matrix Table for this Role (14 Resources from GET /api/v1/permissions/matrix) */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 font-bold">
                        <tr>
                          <th className="p-3 w-56 text-slate-900 dark:text-white">Resource Module</th>
                          {actions.map((act) => (
                            <th key={act.label} className="p-3 text-center w-24">
                              {act.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeMatrix.map((item) => (
                          <tr key={item.resource} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0F766E] dark:text-teal-400 block">{item.name}</span>
                                <span className="font-mono text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
                                  {item.resource}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-sans hidden sm:block truncate max-w-sm">
                                {item.description}
                              </span>
                            </td>
                            {actions.map((act) => {
                              const permCode = item.permissions?.[act.key] || `${item.resource}:${act.key}`;
                              const perms = Array.isArray(role.permissions) ? role.permissions : [];
                              const isGranted = perms.some((p) => {
                                const code = typeof p === 'string' ? p : p?.code;
                                return code && (code === permCode || normalizePermissionCode(code) === normalizePermissionCode(permCode));
                              });

                              return (
                                <td key={act.label} className="p-3 text-center">
                                  <button
                                    disabled={role.is_system_role && role.code === 'SUPER_ADMIN'}
                                    onClick={() => handleToggleMatrixPermission(role, permCode)}
                                    title={`${isGranted ? 'Click to Revoke' : 'Click to Assign'} ${item.name} ${act.label} (${permCode})`}
                                    className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                                      isGranted
                                        ? 'bg-[#10B981] text-white font-bold shadow-xs hover:bg-[#059669]'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-teal-500'
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                  >
                                    {isGranted ? <Check className="w-4 h-4 stroke-[3]" /> : '—'}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: RESOURCE CRUD MATRIX (GET /api/v1/permissions/matrix) ================= */}
      {activeTab === 'resource-matrix' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Resource CRUD Permissions Matrix for UI
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                  200 OK
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Source: <code className="font-mono text-teal-700 dark:text-teal-300">GET http://10.51.4.18:8000/api/v1/permissions/matrix</code>.
                Provides the canonical 4-tier capability structure (Create, Read, Update, Delete) mapped to each critical ICU domain resource.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(fetchPermissionsMatrixThunk())}
                disabled={isMatrixLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isMatrixLoading ? 'animate-spin' : ''}`} />
                <span>Re-fetch Matrix</span>
              </button>
            </div>
          </div>

          {/* Matrix Visual Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-mono font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 w-72">Resource & Description</th>
                    <th className="p-4 text-center">CREATE Permission</th>
                    <th className="p-4 text-center">READ Permission</th>
                    <th className="p-4 text-center">UPDATE Permission</th>
                    <th className="p-4 text-center">DELETE Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {activeMatrix.map((item) => (
                    <tr key={item.resource} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold">
                            {item.resource}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                          {item.description || 'Core system resource specification.'}
                        </p>
                      </td>

                      {/* Create */}
                      <td className="p-4 text-center font-mono">
                        {item.permissions.create ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleCopy(item.permissions.create!)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
                              title="Click to copy code"
                            >
                              {copiedCode === item.permissions.create ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 opacity-60" />}
                              <span>{item.permissions.create}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {getRolesWithPermission(item.permissions.create).length} roles assigned
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                        )}
                      </td>

                      {/* Read */}
                      <td className="p-4 text-center font-mono">
                        {item.permissions.read ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleCopy(item.permissions.read!)}
                              className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-bold text-[11px] flex items-center gap-1 hover:bg-sky-100 cursor-pointer"
                              title="Click to copy code"
                            >
                              {copiedCode === item.permissions.read ? <CheckCheck className="w-3 h-3 text-sky-600" /> : <Copy className="w-3 h-3 opacity-60" />}
                              <span>{item.permissions.read}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {getRolesWithPermission(item.permissions.read).length} roles assigned
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                        )}
                      </td>

                      {/* Update */}
                      <td className="p-4 text-center font-mono">
                        {item.permissions.update ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleCopy(item.permissions.update!)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
                              title="Click to copy code"
                            >
                              {copiedCode === item.permissions.update ? <CheckCheck className="w-3 h-3 text-amber-600" /> : <Copy className="w-3 h-3 opacity-60" />}
                              <span>{item.permissions.update}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {getRolesWithPermission(item.permissions.update).length} roles assigned
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="p-4 text-center font-mono">
                        {item.permissions.delete ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleCopy(item.permissions.delete!)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1 hover:bg-rose-100 cursor-pointer"
                              title="Click to copy code"
                            >
                              {copiedCode === item.permissions.delete ? <CheckCheck className="w-3 h-3 text-rose-600" /> : <Copy className="w-3 h-3 opacity-60" />}
                              <span>{item.permissions.delete}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {getRolesWithPermission(item.permissions.delete).length} roles assigned
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SYSTEM PERMISSIONS CATALOG (GET /api/v1/permissions) ================= */}
      {activeTab === 'system-permissions' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  System Permissions Directory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold">
                  {permissions.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Source: <code className="font-mono text-teal-700 dark:text-teal-300">GET http://10.51.4.18:8000/api/v1/permissions</code>.
                Query parameter: <code className="font-mono">?module={selectedModuleFilter === 'ALL' ? '' : selectedModuleFilter}</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(fetchPermissionsThunk(selectedModuleFilter === 'ALL' ? undefined : selectedModuleFilter))}
                disabled={isPermissionsLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPermissionsLoading ? 'animate-spin' : ''}`} />
                <span>Re-query API</span>
              </button>
            </div>
          </div>

          {/* Module Selector & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter permissions by code, keyword, action..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white text-xs font-medium focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>Showing:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {filteredCatalogPermissions.length} of {permissions.length} permissions
                </span>
              </div>
            </div>

            {/* Module Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Module Filter:
              </span>
              <button
                onClick={() => handleModuleFilterChange('ALL')}
                className={`px-3 py-1 rounded-lg font-bold font-mono text-[11px] transition-all cursor-pointer ${
                  selectedModuleFilter === 'ALL'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                ALL ({permissions.length})
              </button>
              {availableModules.map((mod) => {
                const count = permissions.filter((p) => p.module.toLowerCase() === mod).length;
                return (
                  <button
                    key={mod}
                    onClick={() => handleModuleFilterChange(mod)}
                    className={`px-3 py-1 rounded-lg font-bold font-mono text-[11px] transition-all cursor-pointer ${
                      selectedModuleFilter.toLowerCase() === mod
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {mod} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Grid Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-mono font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 w-72">Permission Code</th>
                    <th className="p-4 w-32">Module</th>
                    <th className="p-4 w-28 text-center">Action</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 w-52">Assigned Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredCatalogPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No permissions matched the current filter. Try clearing your search keyword.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalogPermissions.map((perm) => {
                      const assignedRoles = getRolesWithPermission(perm.code);
                      return (
                        <tr key={perm.id || perm.code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {perm.code}
                              </span>
                              <button
                                onClick={() => handleCopy(perm.code)}
                                className="text-slate-400 hover:text-teal-600 transition-colors p-1"
                                title="Copy code"
                              >
                                {copiedCode === perm.code ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-xs">
                              ID: {perm.id}
                            </span>
                          </td>

                          <td className="p-4 font-mono">
                            <span className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-[11px]">
                              {perm.module}
                            </span>
                          </td>

                          <td className="p-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeColor(perm.action)}`}>
                              {perm.action || 'CUSTOM'}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              {perm.description || 'System capability privilege.'}
                            </p>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {assignedRoles.length === 0 ? (
                                <span className="text-[10px] text-slate-400 font-mono">None</span>
                              ) : (
                                assignedRoles.map((r) => (
                                  <span
                                    key={r.id}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                      r.code === 'SUPER_ADMIN'
                                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {r.code}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE ROLE ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl text-xs max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create Custom Role
                </h3>
                <span className="text-[11px] text-slate-500 block">
                  Define new RBAC permissions profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Role Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleForm.code}
                    onChange={(e) =>
                      setNewRoleForm({
                        ...newRoleForm,
                        code: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                      })
                    }
                    placeholder="e.g. ROLE_ICU_SPECIALIST"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold uppercase focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Role Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    placeholder="e.g. ICU Specialist"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Hospital Affiliation
                </label>
                <select
                  value={newRoleForm.hospital_id || ''}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, hospital_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold focus:border-teal-600 focus:outline-none"
                >
                  <option value="">Global (All Facilities)</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRoleForm.description || ''}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  placeholder="Describe role duties and operational scope..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none"
                />
              </div>

              {/* Permission Checkboxes Selection */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">
                    Assigned Permissions ({newRoleForm.permission_codes?.length || 0} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNewRoleForm({
                          ...newRoleForm,
                          permission_codes: normalizePermissionCodes(permissions.map((p) => p.code)),
                        })
                      }
                      className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Select All ({permissions.length})
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewRoleForm({
                          ...newRoleForm,
                          permission_codes: [
                            'patient:read',
                            'bed:read',
                            'staff:read',
                            'clinical:read',
                            'audit:read',
                          ],
                        })
                      }
                      className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Clinical Defaults
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewRoleForm({
                          ...newRoleForm,
                          permission_codes: [],
                        })
                      }
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Modal Search & Module Filter */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={modalPermSearch}
                    onChange={(e) => setModalPermSearch(e.target.value)}
                    placeholder="Search permissions..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <select
                    value={modalActiveModule}
                    onChange={(e) => setModalActiveModule(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="ALL">All Modules</option>
                    {availableModules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  {Object.entries(modalGroupedPermissions).map(([modName, permsInMod]) => {
                    const currentCodes = (newRoleForm.permission_codes || []).map(normalizePermissionCode);
                    const allInModChecked = permsInMod.every((p) =>
                      currentCodes.includes(normalizePermissionCode(p.code))
                    );

                    return (
                      <div key={modName} className="space-y-1.5 border-b border-slate-200 dark:border-slate-700/60 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between text-[11px] font-sans font-bold text-slate-700 dark:text-slate-300">
                          <span className="uppercase text-teal-700 dark:text-teal-400">{modName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const modCodes = permsInMod.map((p) => normalizePermissionCode(p.code));
                              if (allInModChecked) {
                                setNewRoleForm({
                                  ...newRoleForm,
                                  permission_codes: currentCodes.filter((c) => !modCodes.includes(c)),
                                });
                              } else {
                                setNewRoleForm({
                                  ...newRoleForm,
                                  permission_codes: Array.from(new Set([...currentCodes, ...modCodes])),
                                });
                              }
                            }}
                            className="text-[10px] text-teal-600 hover:underline cursor-pointer"
                          >
                            {allInModChecked ? 'Deselect Module' : 'Select All in Module'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {permsInMod.map((p) => {
                            const normCode = normalizePermissionCode(p.code);
                            const isChecked = currentCodes.includes(normCode);
                            return (
                              <label
                                key={p.code}
                                className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer text-[10px]"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewRoleForm({
                                        ...newRoleForm,
                                        permission_codes: Array.from(new Set([...currentCodes, normCode])),
                                      });
                                    } else {
                                      setNewRoleForm({
                                        ...newRoleForm,
                                        permission_codes: currentCodes.filter((c) => c !== normCode),
                                      });
                                    }
                                  }}
                                  className="rounded text-teal-600"
                                />
                                <span className="truncate">{p.code}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionLoading}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer"
              >
                {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Role</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT ROLE ================= */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl text-xs max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Edit Role: {editingRole.name}
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Code: {editingRole.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editRoleForm.name || ''}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editRoleForm.description || ''}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 focus:border-teal-600 focus:outline-none"
                />
              </div>

              {/* Permission Checkboxes Selection */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">
                    Assigned Permissions ({editRoleForm.permission_codes?.length || 0} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditRoleForm({
                          ...editRoleForm,
                          permission_codes: normalizePermissionCodes(permissions.map((p) => p.code)),
                        })
                      }
                      className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Select All ({permissions.length})
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditRoleForm({
                          ...editRoleForm,
                          permission_codes: [],
                        })
                      }
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Modal Search & Module Filter */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={modalPermSearch}
                    onChange={(e) => setModalPermSearch(e.target.value)}
                    placeholder="Search permissions..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <select
                    value={modalActiveModule}
                    onChange={(e) => setModalActiveModule(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="ALL">All Modules</option>
                    {availableModules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  {Object.entries(modalGroupedPermissions).map(([modName, permsInMod]) => {
                    const currentCodes = (editRoleForm.permission_codes || []).map(normalizePermissionCode);
                    const allInModChecked = permsInMod.every((p) =>
                      currentCodes.includes(normalizePermissionCode(p.code))
                    );

                    return (
                      <div key={modName} className="space-y-1.5 border-b border-slate-200 dark:border-slate-700/60 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between text-[11px] font-sans font-bold text-slate-700 dark:text-slate-300">
                          <span className="uppercase text-teal-700 dark:text-teal-400">{modName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const modCodes = permsInMod.map((p) => normalizePermissionCode(p.code));
                              if (allInModChecked) {
                                setEditRoleForm({
                                  ...editRoleForm,
                                  permission_codes: currentCodes.filter((c) => !modCodes.includes(c)),
                                });
                              } else {
                                setEditRoleForm({
                                  ...editRoleForm,
                                  permission_codes: Array.from(new Set([...currentCodes, ...modCodes])),
                                });
                              }
                            }}
                            className="text-[10px] text-teal-600 hover:underline cursor-pointer"
                          >
                            {allInModChecked ? 'Deselect Module' : 'Select All in Module'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {permsInMod.map((p) => {
                            const normCode = normalizePermissionCode(p.code);
                            const isChecked = currentCodes.includes(normCode);
                            return (
                              <label
                                key={p.code}
                                className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer text-[10px]"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditRoleForm({
                                        ...editRoleForm,
                                        permission_codes: Array.from(new Set([...currentCodes, normCode])),
                                      });
                                    } else {
                                      setEditRoleForm({
                                        ...editRoleForm,
                                        permission_codes: currentCodes.filter((c) => c !== normCode),
                                      });
                                    }
                                  }}
                                  className="rounded text-teal-600"
                                />
                                <span className="truncate">{p.code}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionLoading}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer"
              >
                {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: DELETE ROLE CONFIRMATION ================= */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Delete Custom Role
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {deletingRole.code}
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete role <strong>{deletingRole.name}</strong>? Users assigned to this role will lose their custom permissions.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer"
              >
                {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN TENANT MEMBERSHIP ================= */}
      {tenantMembershipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Assign User to Hospital Tenant
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      POST /api/v1/tenants/memberships
                    </span>
                    <span className="text-[11px] text-slate-400">Tenant Governance</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTenantMembershipModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTenantSubmit} className="space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  User Account *
                </label>
                <select
                  value={tenantMembershipForm.user_id}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, user_id: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select User Account...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`} ({u.email}) - {u.role || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital Tenant Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Hospital Facility Tenant *
                </label>
                <select
                  value={tenantMembershipForm.hospital_id}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, hospital_id: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select Hospital Tenant...</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.code ? `(${h.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Tenant Role *
                </label>
                <select
                  value={tenantMembershipForm.role_id}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, role_id: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select Role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Badge Number (Optional) */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Badge Number / Facility Badge ID (Optional)
                </label>
                <input
                  type="text"
                  value={tenantMembershipForm.badge_number || ''}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, badge_number: e.target.value })}
                  placeholder="e.g. DOC-102, RN-88, TECH-45"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTenantMembershipModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                  <span>Assign Membership</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;
