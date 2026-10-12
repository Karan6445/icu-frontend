import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  Key,
  BadgeCheck,
  Trash2,
  RotateCcw,
  GitFork,
  ExternalLink,
  Edit,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
  UserCheck,
  MapPin,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchUsersThunk,
  fetchUserByIdThunk,
  provisionUserThunk,
  updateUserThunk,
  deleteUserThunk,
  restoreUserThunk,
  fetchUserHierarchyThunk,
  assignTenantMembershipThunk,
  clearUserError,
  clearUserSuccessMessage,
  clearUserHierarchy,
} from '../../store/slices/userSlice';
import { fetchHospitalsThunk } from '../../store/slices/hospitalSlice';
import { fetchRolesThunk } from '../../store/slices/rolePermissionSlice';
import { UserResponse, UserCreatePayload, UserUpdatePayload } from '../../api/userApi';
import { validateEmail, validate10DigitPhone, clean10DigitPhone } from '../../utils/validation';
import { useRBAC } from '../../hooks/useRBAC';

export const UserManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useRBAC();
  const { users, userHierarchy, isLoading, isActionLoading, error, successMessage } = useAppSelector(
    (state) => state.user
  );
  const { hospitals } = useAppSelector((state) => state.hospital);
  const { roles } = useAppSelector((state) => state.rolePermission);
  const { activeRole } = useAppSelector((state) => state.auth);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Modals State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [tenantMembershipForm, setTenantMembershipForm] = useState({
    user_id: '',
    hospital_id: '',
    role_id: '',
    badge_number: '',
  });

  // Selected User for Actions
  const [activeUser, setActiveUser] = useState<UserResponse | null>(null);

  // Form State: Provision User
  const [provisionForm, setProvisionForm] = useState<UserCreatePayload>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    employee_id: '',
    role_code: 'ICU_STAFF_NURSE',
    is_super_admin: false,
    hospital_id: '',
  });

  // Form State: Update User
  const [updateForm, setUpdateForm] = useState<UserUpdatePayload>({
    first_name: '',
    last_name: '',
    phone_number: '',
    employee_id: '',
    status: 'ACTIVE',
    hospital_id: '',
  });

  // Form State: Soft Delete Reason
  const [deleteReason, setDeleteReason] = useState('');

  // Initial Load
  useEffect(() => {
    dispatch(fetchUsersThunk({ include_deleted: includeDeleted }));
    dispatch(fetchHospitalsThunk());
    dispatch(fetchRolesThunk());
  }, [dispatch, includeDeleted]);

  // Handle Notifications Auto-dismiss
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearUserSuccessMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    // Search filter
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase());

    // Hospital filter
    const matchesHospital =
      selectedHospitalFilter === 'ALL' || u.hospital_id === selectedHospitalFilter;

    // Role filter
    const matchesRole =
      selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    // Soft-deleted filter
    const matchesDeleted = includeDeleted ? true : !u.is_deleted;

    return matchesSearch && matchesHospital && matchesRole && matchesDeleted;
  });

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  const handleOpenProvisionModal = () => {
    setProvisionForm({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      role_code: 'ICU_STAFF_NURSE',
      is_super_admin: false,
      hospital_id: hospitals[0]?.id || '',
    });
    setIsProvisionModalOpen(true);
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionForm.email || !provisionForm.first_name || !provisionForm.last_name) return;

    await dispatch(
      provisionUserThunk({
        ...provisionForm,
        phone_number: clean10DigitPhone(provisionForm.phone_number),
        hospital_id: provisionForm.hospital_id || null,
      })
    );
    setIsProvisionModalOpen(false);
  };

  const handleOpenUpdateModal = (user: UserResponse) => {
    setActiveUser(user);
    setUpdateForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || '',
      employee_id: user.employee_id || '',
      status: user.status || 'ACTIVE',
      hospital_id: user.hospital_id || '',
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    await dispatch(
      updateUserThunk({
        id: activeUser.id,
        payload: {
          ...updateForm,
          phone_number: clean10DigitPhone(updateForm.phone_number || ''),
          hospital_id: updateForm.hospital_id || null,
        },
      })
    );
    setIsUpdateModalOpen(false);
  };

  const handleOpenDeleteModal = (user: UserResponse) => {
    setActiveUser(user);
    setDeleteReason('Account deactivated by administrator');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    await dispatch(
      deleteUserThunk({
        id: activeUser.id,
        reason: deleteReason.trim(),
      })
    );
    setIsDeleteModalOpen(false);
  };

  const handleRestoreUser = async (user: UserResponse) => {
    await dispatch(restoreUserThunk(user.id));
  };

  const handleViewHierarchy = async (user: UserResponse) => {
    setActiveUser(user);
    dispatch(clearUserHierarchy());
    setIsHierarchyModalOpen(true);
    await dispatch(fetchUserHierarchyThunk(user.id));
  };

  const handleViewDetails = async (user: UserResponse) => {
    setActiveUser(user);
    setIsDetailsModalOpen(true);
    await dispatch(fetchUserByIdThunk(user.id));
  };

  const handleOpenTenantModal = (user?: UserResponse) => {
    setTenantMembershipForm({
      user_id: user?.id || (users[0]?.id || ''),
      hospital_id: user?.hospital_id || (hospitals[0]?.id || ''),
      role_id: roles[0]?.id || '',
      badge_number: user?.employee_id || '',
    });
    setIsTenantModalOpen(true);
  };

  const handleAssignTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantMembershipForm.user_id || !tenantMembershipForm.hospital_id || !tenantMembershipForm.role_id) {
      alert('Please select user, hospital facility, and role.');
      return;
    }
    await dispatch(
      assignTenantMembershipThunk({
        user_id: tenantMembershipForm.user_id,
        hospital_id: tenantMembershipForm.hospital_id,
        role_id: tenantMembershipForm.role_id,
        badge_number: tenantMembershipForm.badge_number ? tenantMembershipForm.badge_number.trim() : null,
      })
    );
    setIsTenantModalOpen(false);
  };

  const getHospitalName = (hId?: string | null) => {
    if (!hId) return 'Unassigned (Global)';
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
              CENTRAL IDENTITY & RBAC
            </span>
            <span className="text-xs text-slate-400 font-medium">Enterprise Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision user accounts, configure role codes, track MFA enrollment, view tenant hierarchy, and manage soft-deletion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchUsersThunk({ include_deleted: includeDeleted }))}
            disabled={isLoading}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenTenantModal()}
            className="px-4 py-3 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            title="Assign User to Hospital Tenant with Role (POST /api/v1/tenants/memberships)"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Assign Tenant Membership</span>
          </button>

          <button
            onClick={handleOpenProvisionModal}
            className="px-4 sm:px-5 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>Provision New User</span>
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
          <button onClick={() => dispatch(clearUserSuccessMessage())} className="text-emerald-700 hover:text-emerald-900">
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
          <button onClick={() => dispatch(clearUserError())} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, Filter & Include Deleted Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, email, employee ID..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white font-medium focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Hospital Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-bold">Hospital:</span>
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

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-bold">Role:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
              <option value="INTENSIVIST">INTENSIVIST</option>
              <option value="ICU_STAFF_NURSE">ICU_STAFF_NURSE</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="NURSE">NURSE</option>
            </select>
          </div>

          {/* Include Soft-Deleted Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="rounded text-teal-600 focus:ring-0"
            />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Show Soft-Deleted
            </span>
          </label>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role & Privileges</th>
                <th className="py-3 px-4">Affiliated Facility</th>
                <th className="py-3 px-4">MFA 2FA</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching user accounts found. Click "Provision New User" to register a staff account.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isDeleted = user.is_deleted;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        isDeleted ? 'bg-rose-50/20 dark:bg-rose-950/20 opacity-75' : ''
                      }`}
                    >
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              user.is_super_admin
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                            }`}
                          >
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {user.full_name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-mono">{user.email}</span>
                              {user.employee_id && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                                    {user.employee_id}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Privileges */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                            {user.role || 'STAFF'}
                          </span>
                          {user.is_super_admin && (
                            <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              ★ Super Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Affiliated Facility */}
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getHospitalName(user.hospital_id)}</span>
                        </span>
                      </td>

                      {/* MFA Status */}
                      <td className="py-3 px-4">
                        {user.mfa_enabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold font-mono">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-mono">
                            <ShieldAlert className="w-3 h-3 text-amber-500" />
                            <span>Not Enrolled</span>
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3 px-4">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold">
                            <span>Deleted</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>{user.status || 'ACTIVE'}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewHierarchy(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Tenant Hierarchy (User -> Hospital -> District -> State)"
                          >
                            <GitFork className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenTenantModal(user)}
                            className="p-1.5 rounded-lg text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
                            title="Assign to Hospital Tenant with Role (POST /api/v1/tenants/memberships)"
                          >
                            <Building2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenUpdateModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Update User Account"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {hasPermission('user:delete') && (
                            isDeleted ? (
                              <button
                                onClick={() => handleRestoreUser(user)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                                title="Restore Soft-Deleted Account"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenDeleteModal(user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                title="Soft Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )
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

      {/* ================= MODAL: PROVISION NEW USER ================= */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-600 text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Provision New User Account
                  </h3>
                  <span className="text-[11px] text-slate-500 block">
                    Role-Based Access Provisioning
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={provisionForm.first_name}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, first_name: e.target.value })
                    }
                    placeholder="e.g. Dr. Rajesh"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={provisionForm.last_name}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, last_name: e.target.value })
                    }
                    placeholder="e.g. Verma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={provisionForm.email}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, email: e.target.value })
                    }
                    placeholder="staff@smarticu.org"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={provisionForm.password}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, password: e.target.value })
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={provisionForm.phone_number}
                    onChange={(e) =>
                      setProvisionForm({
                        ...provisionForm,
                        phone_number: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={provisionForm.employee_id}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, employee_id: e.target.value })
                    }
                    placeholder="EMP-102"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono focus:border-teal-600 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Role Code *
                  </label>
                  <select
                    value={provisionForm.role_code}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, role_code: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold focus:border-teal-600 focus:outline-none"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Global)</option>
                    <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                    <option value="INTENSIVIST">INTENSIVIST</option>
                    <option value="ICU_STAFF_NURSE">ICU_STAFF_NURSE</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="NURSE">NURSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Hospital Affiliation
                  </label>
                  <select
                    value={provisionForm.hospital_id || ''}
                    onChange={(e) =>
                      setProvisionForm({ ...provisionForm, hospital_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold focus:border-teal-600 focus:outline-none"
                  >
                    <option value="">Unassigned (System / Global)</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={provisionForm.is_super_admin}
                    onChange={(e) =>
                      setProvisionForm({
                        ...provisionForm,
                        is_super_admin: e.target.checked,
                      })
                    }
                    className="rounded text-teal-600 focus:ring-0"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Grant Global Platform Super-Administrator Privileges
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Provision Account</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE USER ================= */}
      {isUpdateModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Update User Profile
                </h3>
                <span className="text-[11px] text-slate-500 block">
                  Modify Staff Account & Permissions
                </span>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={updateForm.first_name || ''}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, first_name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={updateForm.last_name || ''}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, last_name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={updateForm.phone_number || ''}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        phone_number: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={updateForm.employee_id || ''}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, employee_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Status
                  </label>
                  <select
                    value={updateForm.status || 'ACTIVE'}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Hospital
                  </label>
                  <select
                    value={updateForm.hospital_id || ''}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, hospital_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="">Unassigned (System)</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2"
                >
                  {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SOFT DELETE USER ================= */}
      {isDeleteModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Soft-Delete User Account
                </h3>
                <span className="text-[11px] text-slate-500 block">
                  Audit-Preserved Account Deactivation
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft-delete <strong>{activeUser.full_name}</strong> (
              <span className="font-mono">{activeUser.email}</span>)? The account will be marked inactive and preserved for auditing.
            </p>

            <form onSubmit={handleDeleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Reason for Deletion (Optional)
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Employee resignation or transfer"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2"
                >
                  {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Soft-Delete</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: USER HIERARCHY ================= */}
      {isHierarchyModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-600 text-white">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    User Governance Hierarchy
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsHierarchyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>Fetching hierarchy tree...</span>
              </div>
            ) : userHierarchy ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                      Target User
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {userHierarchy.full_name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {userHierarchy.email} • {userHierarchy.employee_id}
                    </span>
                  </div>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-500/40">
                  {/* Hospital Level */}
                  <div className="relative flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Facility Tier
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {userHierarchy.hospital_name || 'Unassigned Facility'}
                      </span>
                      {userHierarchy.hospital_id && (
                        <span className="text-[10px] font-mono text-slate-400 block">
                          ID: {userHierarchy.hospital_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* District Level */}
                  <div className="relative flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Administrative District
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {userHierarchy.district_name || 'Central District'}
                      </span>
                    </div>
                  </div>

                  {/* State Level */}
                  <div className="relative flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        State Health Federation
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {userHierarchy.state_name || 'National Capital Territory'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Hierarchy unavailable.</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHierarchyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: USER DETAILS ================= */}
      {isDetailsModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  User Details
                </h3>
                <span className="text-[11px] text-slate-500 block">
                  Staff Identity & Security Profile
                </span>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeUser.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{activeUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Employee ID</span>
                  <span className="font-mono font-bold text-teal-600">{activeUser.employee_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{activeUser.phone_number || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Role</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeUser.role || 'STAFF'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Super Admin</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeUser.is_super_admin ? 'Yes (Platform Global)' : 'No'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">MFA 2FA Enabled</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeUser.mfa_enabled ? 'Yes (TOTP Enrolled)' : 'No'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Created</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {new Date(activeUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {activeUser.is_deleted && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <span className="font-bold block">Soft-Deleted Account</span>
                  <span className="text-[11px] block">Reason: {activeUser.deletion_reason || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN USER TO TENANT WITH ROLE (POST /api/v1/tenants/memberships) ================= */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                    TENANT GOVERNANCE
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">POST /api/v1/tenants/memberships</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                  Assign User to Hospital Tenant with Role
                </h3>
              </div>
              <button
                onClick={() => setIsTenantModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTenantSubmit} className="space-y-4 text-xs">
              {/* User Select */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Target User Account *
                </label>
                <select
                  value={tenantMembershipForm.user_id}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, user_id: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">Select User...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email}) - Current: {u.role || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital Facility Select */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Hospital Facility (Tenant) *
                </label>
                <select
                  value={tenantMembershipForm.hospital_id}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, hospital_id: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">Select Hospital Tenant...</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.code ? `(${h.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Assigned Tenant Role *
                </label>
                <select
                  value={tenantMembershipForm.role_id}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, role_id: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
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
                  Badge Number / Hospital Employee ID (Optional)
                </label>
                <input
                  type="text"
                  value={tenantMembershipForm.badge_number}
                  onChange={(e) => setTenantMembershipForm({ ...tenantMembershipForm, badge_number: e.target.value })}
                  placeholder="e.g. DOC-102, RN-55"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold flex items-center gap-2 cursor-pointer"
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

export default UserManagementPage;
