import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchRolesThunk,
  fetchRoleByIdThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  assignRolePermissionsThunk,
  bulkRevokeRolePermissionsThunk,
  revokeSingleRolePermissionThunk,
  fetchPermissionsThunk,
  fetchPermissionsMatrixThunk,
  setSearchQuery,
  clearRoleError,
  clearRoleSuccessMessage,
  PermissionCategory,
  PermissionAction,
} from '../../store/slices/rolePermissionSlice';
import { fetchHospitalsThunk } from '../../store/slices/hospitalSlice';
import {
  RoleResponse,
  PermissionResponse,
  RoleCreatePayload,
  RoleUpdatePayload,
  normalizePermissionCode,
  normalizePermissionCodes,
} from '../../api/roleApi';
import {
  ShieldCheck,
  Shield,
  Plus,
  Search,
  Check,
  Trash2,
  Edit2,
  X,
  Lock,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

export const AdminRolesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { roles, permissions, permissionsMatrix, searchQuery, isLoading, isActionLoading, error, successMessage } =
    useAppSelector((state) => state.rolePermission);
  const { hospitals } = useAppSelector((state) => state.hospital);

  // Filters
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('ALL');
  const [selectedRoleTypeFilter, setSelectedRoleTypeFilter] = useState<'ALL' | 'SYSTEM' | 'CUSTOM'>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);
  const [managingPermsRole, setManagingPermsRole] = useState<RoleResponse | null>(null);

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

  interface MatrixCategoryItem {
    id: string;
    label: string;
    description: string;
  }

  const matrixCategories: MatrixCategoryItem[] = [
    { id: 'patient', label: 'Patients', description: 'Patient records, vitals, admissions and demographics' },
    { id: 'bed', label: 'Beds & ICU', description: 'Bed occupancy, telemetries, and smart ICU slots' },
    { id: 'staff', label: 'Clinical Staff', description: 'Physicians, nurse leads, specialists, and shift rosters' },
    { id: 'clinical', label: 'Clinical Encounters', description: 'Progress notes, bedside consults, and care plans' },
    { id: 'order', label: 'Medication & Orders', description: 'Medication administration, orders, and pharmacy' },
    { id: 'audit', label: 'Audit & Reports', description: 'Clinical audit trails, forensic logs, and KPI reports' },
    { id: 'hospital', label: 'Hospital Settings', description: 'Facility configuration, units, and security rules' },
    { id: 'user', label: 'User Governance', description: 'User account provisioning, credentials, and access' },
  ];

  const actions: { label: PermissionAction; key: string }[] = [
    { label: 'View', key: 'read' },
    { label: 'Create', key: 'create' },
    { label: 'Edit', key: 'update' },
    { label: 'Delete', key: 'delete' },
  ];

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchRolesThunk());
    dispatch(fetchPermissionsThunk());
    dispatch(fetchPermissionsMatrixThunk());
    dispatch(fetchHospitalsThunk());
  }, [dispatch]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearRoleSuccessMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Filtered Roles
  const filteredRoles = (roles || []).filter((role) => {
    if (!role) return false;
    const name = (role.name || '').toLowerCase();
    const code = (role.code || role.id || '').toLowerCase();
    const desc = (role.description || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      code.includes(query) ||
      desc.includes(query);

    const matchesHospital =
      selectedHospitalFilter === 'ALL' || !role.hospital_id || role.hospital_id === selectedHospitalFilter;

    const isSystem = Boolean(role.is_system_role || (role as any).isSystemDefault);
    const matchesType =
      selectedRoleTypeFilter === 'ALL' ||
      (selectedRoleTypeFilter === 'SYSTEM' && isSystem) ||
      (selectedRoleTypeFilter === 'CUSTOM' && !isSystem);

    return matchesSearch && matchesHospital && matchesType;
  });

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

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

  // Helper to toggle a single permission on a role directly from the matrix table
  const handleToggleMatrixPermission = async (role: RoleResponse, moduleKey: string, actKey: string) => {
    const permCode = `${moduleKey}:${actKey}`;
    const perms = Array.isArray(role.permissions) ? role.permissions : [];
    const alreadyHas = perms.some((p) => {
      const code = typeof p === 'string' ? p : p?.code;
      return code && (code === permCode || normalizePermissionCode(code) === permCode);
    });

    if (alreadyHas) {
      // Single revoke: DELETE /api/v1/roles/{id}/permissions/{permission_code}
      await dispatch(
        revokeSingleRolePermissionThunk({
          id: role.id,
          permission_code: permCode,
        })
      );
    } else {
      // Assign: POST /api/v1/roles/{id}/permissions
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

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#10B981] selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 font-mono text-xs font-bold rounded-full">
              RBAC & ROLES MATRIX
            </span>
            <span className="text-xs text-slate-400 font-medium">Access Control Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Role-Based Access Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system and custom clinical roles, assign fine-grained permissions, and audit tenant access privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchRolesThunk())}
            disabled={isLoading}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Refresh Roles"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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

      {/* Notifications */}
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
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
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
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SYSTEM">System Roles Only</option>
              <option value="CUSTOM">Custom Roles Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roles & Permissions Cards */}
      <div className="space-y-6">
        {filteredRoles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No matching roles found. Click "Create Custom Role" to provision a new security profile.
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

              {/* Permission Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 font-bold">
                    <tr>
                      <th className="p-3 w-40 text-slate-900 dark:text-white">Resource Module</th>
                      {actions.map((act) => (
                        <th key={act.label} className="p-3 text-center w-24">
                          {act.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {matrixCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-[#0F766E] dark:text-teal-400 block">{cat.label}</span>
                          <span className="text-[10px] text-slate-400 font-sans hidden sm:block truncate max-w-xs">{cat.description}</span>
                        </td>
                        {actions.map((act) => {
                          const permCode = `${cat.id}:${act.key}`;
                          const perms = Array.isArray(role.permissions) ? role.permissions : [];
                          const isGranted = perms.some((p) => {
                            const code = typeof p === 'string' ? p : p?.code;
                            return code && (code === permCode || normalizePermissionCode(code) === permCode);
                          });

                          return (
                            <td key={act.label} className="p-3 text-center">
                              <button
                                disabled={role.is_system_role && role.code === 'SUPER_ADMIN'}
                                onClick={() => handleToggleMatrixPermission(role, cat.id, act.key)}
                                title={`${isGranted ? 'Click to Revoke' : 'Click to Assign'} ${cat.label} ${act.label} (${permCode})`}
                                className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all cursor-pointer ${
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

      {/* ================= MODAL: CREATE ROLE ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-xs"
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
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Initial Module Permissions ({newRoleForm.permission_codes?.length || 0} selected)
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
                    Select All
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                {permissions.map((p) => {
                  const normCode = normalizePermissionCode(p.code);
                  const currentCodes = (newRoleForm.permission_codes || []).map(normalizePermissionCode);
                  const isChecked = currentCodes.includes(normCode);
                  return (
                    <label
                      key={p.code}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
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

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionLoading}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold flex items-center gap-2"
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
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-xs"
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
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Assigned Permissions ({editRoleForm.permission_codes?.length || 0})
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
                    Select All
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                {permissions.map((p) => {
                  const normCode = normalizePermissionCode(p.code);
                  const currentCodes = (editRoleForm.permission_codes || []).map(normalizePermissionCode);
                  const isChecked = currentCodes.includes(normCode);
                  return (
                    <label
                      key={p.code}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
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

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionLoading}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold flex items-center gap-2"
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
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2"
              >
                {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;
