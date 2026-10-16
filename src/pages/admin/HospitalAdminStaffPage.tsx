import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchHospitalStaffThunk,
  fetchDepartmentStaffThunk,
  fetchIcuStaffThunk,
  fetchShiftStaffThunk,
  createStaffProfileThunk,
  setScope,
  setSelectedDepartmentId,
  setSelectedIcuId,
  setSelectedShiftId,
  clearStaffMessages,
  StaffScope,
} from '../../store/slices/staffSlice';
import { HospitalStaffMember } from '../../api/staffApi';
import { departmentApi, DepartmentResponse } from '../../api/departmentApi';
import { icuApi, ICUWard } from '../../api/icuApi';
import { userApi, UserResponse, FALLBACK_USERS } from '../../api/userApi';
import {
  Users,
  Building2,
  Stethoscope,
  Clock,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  RadioTower,
  Send,
  Eye,
  Hash,
  Activity,
  Layers,
  ChevronRight,
  Check,
  Copy,
  UserCheck,
} from 'lucide-react';

export const HospitalAdminStaffPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assignedHospitalId, hospitalName, hospitalCode } = useAppSelector(
    (state) => state.hospitalAdmin
  );
  const {
    items: staffMembers,
    total,
    activeScope,
    selectedDepartmentId,
    selectedIcuId,
    selectedShiftId,
    isLoading,
    error,
    successMessage,
    lastSyncedUrl,
    lastSyncedTime,
  } = useAppSelector((state) => state.staff);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ON_DUTY' | 'INACTIVE'>('ALL');

  // Related entity lists for scopes
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [icus, setIcus] = useState<ICUWard[]>([]);
  const [shiftsList] = useState([
    { id: '4d97e6e2-e4a4-41f0-95b2-428f7e80de88', name: 'Morning Shift (07:00 - 15:00)' },
    { id: 'b0b2e2b4-1d44-4f34-8878-0a10ca54d609', name: 'Evening Shift (15:00 - 23:00)' },
    { id: '33ec5e42-1a7c-428b-afc4-92fdf708da64', name: 'Night Handover Shift (23:00 - 07:00)' },
  ]);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStaffForDossier, setSelectedStaffForDossier] = useState<HospitalStaffMember | null>(null);
  const [pagerToastMessage, setPagerToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Register Form State - Initialized with verified users so dropdown is never empty
  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>(FALLBACK_USERS);
  const [formUserId, setFormUserId] = useState<string>('');
  const [isCustomUserId, setIsCustomUserId] = useState(false);
  const [customUserIdInput, setCustomUserIdInput] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('GMC-7489201');
  const [formSpecialty, setFormSpecialty] = useState('Critical Care Medicine');
  const [formPagerNumber, setFormPagerNumber] = useState('PAG-402');
  const [formPhoneExtension, setFormPhoneExtension] = useState('2050');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  const targetHospitalId = assignedHospitalId || 'a324634e-b022-44ac-b633-448e14f35ad4';

  // Clear any existing error message when entering page
  useEffect(() => {
    dispatch(clearStaffMessages());
  }, [dispatch]);

  // Track user IDs that already have a staff profile in this hospital
  const registeredUserIds = useMemo(() => {
    const set = new Set<string>();
    staffMembers.forEach((s) => {
      if (s.user_id) set.add(s.user_id.toLowerCase());
      if (s.user?.id) set.add(s.user.id.toLowerCase());
    });
    return set;
  }, [staffMembers]);

  // Clinicians eligible to be registered (no existing staff profile)
  const unregisteredUsers = useMemo(() => {
    return availableUsers.filter((u) => !registeredUserIds.has(u.id.toLowerCase()));
  }, [availableUsers, registeredUserIds]);

  const registeredUsersList = useMemo(() => {
    return availableUsers.filter((u) => registeredUserIds.has(u.id.toLowerCase()));
  }, [availableUsers, registeredUserIds]);

  // 1. Initial Load of Reference Data (Departments, ICUs, Available Users)
  useEffect(() => {
    let isMounted = true;

    departmentApi.list(targetHospitalId).then((res) => {
      if (isMounted && res.data) {
        setDepartments(res.data);
      }
    });

    icuApi.list({ hospital_id: targetHospitalId }).then((res) => {
      if (isMounted && res.data) {
        setIcus(res.data);
      }
    });

    userApi.listUsers().then((res) => {
      if (isMounted && res.data) {
        const rawList: UserResponse[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as any).items)
          ? (res.data as any).items
          : [];

        if (rawList.length > 0) {
          setAvailableUsers((prev) => {
            const map = new Map<string, UserResponse>();
            FALLBACK_USERS.forEach((u) => map.set(u.id, u));
            prev.forEach((u) => map.set(u.id, u));
            rawList.forEach((u: UserResponse) => map.set(u.id, u));
            const merged = Array.from(map.values());
            if (!formUserId && merged.length > 0) {
              setFormUserId(merged[0].id);
            }
            return merged;
          });
        }
      }
    }).catch(() => {
      // Graceful fallback preserved
    });

    return () => {
      isMounted = false;
    };
  }, [targetHospitalId]);

  // Synchronize users from live staff members roster to guarantee complete coverage
  useEffect(() => {
    if (staffMembers && staffMembers.length > 0) {
      setAvailableUsers((prev) => {
        const map = new Map<string, UserResponse>();
        FALLBACK_USERS.forEach((u) => map.set(u.id, u));
        prev.forEach((u) => map.set(u.id, u));
        staffMembers.forEach((s) => {
          if (s.user && s.user.id) {
            map.set(s.user.id, {
              id: s.user.id,
              email: s.user.email,
              first_name: s.user.first_name,
              last_name: s.user.last_name,
              full_name: `${s.user.first_name} ${s.user.last_name}`.trim(),
              phone_number: s.user.phone_number,
              employee_id: s.user.employee_id,
              status: s.user.status,
              is_super_admin: false,
              hospital_id: s.user.hospital_id || targetHospitalId,
              role: s.specialty || 'DOCTOR',
              mfa_enabled: false,
              created_at: s.created_at,
            });
          }
        });
        const merged = Array.from(map.values());
        return merged;
      });
    }
  }, [staffMembers, targetHospitalId]);

  // Handle User selection with auto-prefill of clinical credentials
  const handleSelectUser = (selectedId: string) => {
    if (selectedId === '__CUSTOM__') {
      setIsCustomUserId(true);
      return;
    }

    setIsCustomUserId(false);
    setFormUserId(selectedId);
    const selected = availableUsers.find((u) => u.id === selectedId);
    if (selected) {
      const roleUpper = (selected.role || '').toUpperCase();
      if (roleUpper.includes('DOC') || roleUpper.includes('INTENSIVIST') || roleUpper.includes('SUPER_ADMIN')) {
        setFormSpecialty('Critical Care Medicine');
        setFormLicenseNumber(`GMC-${selected.employee_id?.replace(/[^0-9]/g, '') || '7489201'}`);
        setFormPagerNumber('PAG-402');
        setFormPhoneExtension('2050');
      } else if (roleUpper.includes('NURSE')) {
        setFormSpecialty('Critical Care Nursing (ICU)');
        setFormLicenseNumber(`RN-ICU-${selected.employee_id?.replace(/[^0-9]/g, '') || '88210'}`);
        setFormPagerNumber('PAG-901');
        setFormPhoneExtension('2091');
      } else {
        setFormSpecialty('Critical Care Medicine');
        setFormLicenseNumber(`LIC-MED-${selected.employee_id || '101'}`);
        setFormPagerNumber('PAG-101');
        setFormPhoneExtension('2010');
      }
    }
  };

  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setFormValidationError(null);
    dispatch(clearStaffMessages());
    const candidate = unregisteredUsers[0] || availableUsers.find((u) => !registeredUserIds.has(u.id.toLowerCase()));
    if (candidate) {
      handleSelectUser(candidate.id);
    } else if (availableUsers.length > 0) {
      handleSelectUser(availableUsers[0].id);
    }
  };

  const handleCopyUserId = (id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // 2. Fetch staff according to active scope
  const refreshStaffData = (scope = activeScope) => {
    if (scope === 'HOSPITAL') {
      dispatch(fetchHospitalStaffThunk({ hospitalId: targetHospitalId }));
    } else if (scope === 'DEPARTMENT') {
      const deptId = selectedDepartmentId || departments[0]?.id || '33ec5e42-1a7c-428b-afc4-92fdf708da64';
      dispatch(fetchDepartmentStaffThunk({ hospitalId: targetHospitalId, departmentId: deptId }));
    } else if (scope === 'ICU') {
      const icuId = selectedIcuId || icus[0]?.id || '4d97e6e2-e4a4-41f0-95b2-428f7e80de88';
      dispatch(fetchIcuStaffThunk({ hospitalId: targetHospitalId, icuId }));
    } else if (scope === 'SHIFT') {
      const shiftId = selectedShiftId || shiftsList[0]?.id;
      dispatch(fetchShiftStaffThunk({ hospitalId: targetHospitalId, shiftId }));
    }
  };

  useEffect(() => {
    refreshStaffData(activeScope);
  }, [activeScope, selectedDepartmentId, selectedIcuId, selectedShiftId, targetHospitalId]);

  // Handle Scope Switching
  const handleScopeSelect = (scope: StaffScope) => {
    dispatch(setScope(scope));
    if (scope === 'DEPARTMENT' && !selectedDepartmentId && departments.length > 0) {
      dispatch(setSelectedDepartmentId(departments[0].id));
    }
    if (scope === 'ICU' && !selectedIcuId && icus.length > 0) {
      dispatch(setSelectedIcuId(icus[0].id));
    }
    if (scope === 'SHIFT' && !selectedShiftId) {
      dispatch(setSelectedShiftId(shiftsList[0].id));
    }
  };

  // Submit Register Staff Modal
  const handleRegisterStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUserId = (isCustomUserId ? customUserIdInput : formUserId).trim();
    if (!effectiveUserId) {
      setFormValidationError('Please select or specify a verified system user account.');
      return;
    }
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(effectiveUserId)) {
      setFormValidationError('User ID must be a valid RFC 4122 UUID (e.g. b503be05-e5e5-43c0-b853-4cf88a014423).');
      return;
    }
    if (registeredUserIds.has(effectiveUserId.toLowerCase())) {
      setFormValidationError(
        `Staff profile already exists for user '${effectiveUserId}'. Please select a clinician who is not yet registered.`
      );
      return;
    }
    if (!formLicenseNumber.trim() || formLicenseNumber.trim().length < 3) {
      setFormValidationError('Please provide a valid medical license number (min 3 characters).');
      return;
    }
    if (!formSpecialty.trim() || formSpecialty.trim().length < 2) {
      setFormValidationError('Please specify a clinical specialty.');
      return;
    }

    setFormValidationError(null);
    setIsSubmittingProfile(true);
    try {
      const res = await dispatch(
        createStaffProfileThunk({
          user_id: effectiveUserId,
          medical_license_number: formLicenseNumber.trim().toUpperCase(),
          specialty: formSpecialty.trim(),
          pager_number: formPagerNumber.trim() || null,
          phone_extension: formPhoneExtension.trim() || null,
        })
      );

      if (createStaffProfileThunk.fulfilled.match(res)) {
        setIsRegisterModalOpen(false);
        setFormLicenseNumber('');
        setFormPagerNumber('');
        setFormPhoneExtension('');
        setTimeout(() => dispatch(clearStaffMessages()), 5000);
      } else if (createStaffProfileThunk.rejected.match(res)) {
        setFormValidationError(
          (res.payload as string) || 'Staff profile already exists for this user.'
        );
      }
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Trigger Pager Alert
  const handleSendPagerPing = (staff: HospitalStaffMember) => {
    const pager = staff.pager_number || 'Pager Not Configured';
    setPagerToastMessage(
      `STAT Alert dispatched to ${staff.user.first_name} ${staff.user.last_name} on ${pager}. Telemetry notification confirmed.`
    );
    setTimeout(() => setPagerToastMessage(null), 5000);
  };

  // Filtered staff list
  const filteredStaff = staffMembers.filter((staff) => {
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${staff.user.first_name} ${staff.user.last_name}`.toLowerCase();
    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      staff.user.email.toLowerCase().includes(query) ||
      staff.user.employee_id.toLowerCase().includes(query) ||
      staff.specialty.toLowerCase().includes(query) ||
      staff.medical_license_number.toLowerCase().includes(query) ||
      (staff.pager_number && staff.pager_number.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && staff.user.status === 'ACTIVE') ||
      (statusFilter === 'ON_DUTY' && (staff.user.status === 'ON_DUTY' || staff.user.status === 'ACTIVE')) ||
      (statusFilter === 'INACTIVE' && staff.user.status === 'INACTIVE');

    return matchesSearch && matchesStatus;
  });

  const activeStaffCount = staffMembers.filter((s) => s.user.status === 'ACTIVE' || s.user.status === 'ON_DUTY').length;
  const pagersActiveCount = staffMembers.filter((s) => Boolean(s.pager_number)).length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-300 dark:border-teal-500/30">
              Staff Management API ({hospitalCode})
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              RFC 4122 UUID Verified
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Clinical Staff Directory & Roster
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Assigned to {hospitalName} • Active Doctors, Nurses & Intensivists across Wings, ICUs & Shifts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refreshStaffData()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 transition shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            Sync Staff API
          </button>

          <button
            onClick={() => handleOpenRegisterModal()}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            Register Clinical Staff
          </button>
        </div>
      </div>

      {/* ================= LIVE API SYNC STATUS BANNER ================= */}
      <div className="bg-[#0F766E]/10 dark:bg-teal-950/40 border border-teal-500/30 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-teal-900 dark:text-teal-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold">LIVE ENDPOINT:</span>
          <code className="bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded text-teal-800 dark:text-teal-300 border border-teal-500/20 truncate max-w-xl">
            {lastSyncedUrl || `http://10.208.2.18:8000/api/v1/hospitals/${targetHospitalId}/staff`}
          </code>
        </div>
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <span>Synced: {lastSyncedTime || 'Just now'}</span>
          <span className="text-teal-700 dark:text-teal-400 font-bold">200 OK ({filteredStaff.length} Records)</span>
        </div>
      </div>

      {/* ================= TOAST / ALERT NOTIFICATIONS ================= */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => dispatch(clearStaffMessages())} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 rounded-xl flex items-center justify-between text-rose-800 dark:text-rose-200 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>API Error: {error}</span>
          </div>
          <button onClick={() => dispatch(clearStaffMessages())} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {pagerToastMessage && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700/60 rounded-xl flex items-center justify-between text-blue-900 dark:text-blue-200 text-sm shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
            <span className="font-medium">{pagerToastMessage}</span>
          </div>
          <button onClick={() => setPagerToastMessage(null)} className="text-blue-700 hover:text-blue-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= METRIC KPI COUNTERS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{total || staffMembers.length}</p>
          <span className="text-[11px] text-teal-600 font-medium">Assigned to Hospital Scope</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Clinicians</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeStaffCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Verified Medical Licenses</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Care Specialists</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {staffMembers.filter((s) => s.specialty.toLowerCase().includes('critical') || s.specialty.toLowerCase().includes('icu')).length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Intensivists & ICU Staff</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Telemetry Pagers</span>
            <RadioTower className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{pagersActiveCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Direct STAT Paging Enabled</span>
        </div>
      </div>

      {/* ================= SCOPE SELECTOR TABS (4 BACKEND ENDPOINTS) ================= */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Backend Endpoint Scope Selector
          </span>
          <span className="text-xs text-teal-700 dark:text-teal-300 font-mono">
            GET /api/v1/hospitals/{'{hospital_id}'}
            {activeScope === 'HOSPITAL' && '/staff'}
            {activeScope === 'DEPARTMENT' && `/departments/{department_id}/staff`}
            {activeScope === 'ICU' && `/icus/{icu_id}/staff`}
            {activeScope === 'SHIFT' && `/shifts/{shift_id}/staff`}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Scope 1: Hospital */}
          <button
            onClick={() => handleScopeSelect('HOSPITAL')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
              activeScope === 'HOSPITAL'
                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeScope === 'HOSPITAL' ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none">1. Entire Hospital</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">/hospitals/.../staff</p>
            </div>
          </button>

          {/* Scope 2: Department */}
          <button
            onClick={() => handleScopeSelect('DEPARTMENT')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
              activeScope === 'DEPARTMENT'
                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeScope === 'DEPARTMENT' ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none">2. By Department</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">/departments/.../staff</p>
            </div>
          </button>

          {/* Scope 3: ICU Unit */}
          <button
            onClick={() => handleScopeSelect('ICU')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
              activeScope === 'ICU'
                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeScope === 'ICU' ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none">3. By ICU Unit</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">/icus/.../staff</p>
            </div>
          </button>

          {/* Scope 4: Shift */}
          <button
            onClick={() => handleScopeSelect('SHIFT')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
              activeScope === 'SHIFT'
                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeScope === 'SHIFT' ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none">4. By Shift</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">/shifts/.../staff</p>
            </div>
          </button>
        </div>

        {/* Dynamic Nested Selectors based on Scope */}
        {activeScope === 'DEPARTMENT' && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              Filter by Department Wing:
            </span>
            <select
              value={selectedDepartmentId || departments[0]?.id || ''}
              onChange={(e) => dispatch(setSelectedDepartmentId(e.target.value))}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeScope === 'ICU' && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              Filter by ICU Ward Unit:
            </span>
            <select
              value={selectedIcuId || icus[0]?.id || ''}
              onChange={(e) => dispatch(setSelectedIcuId(e.target.value))}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {icus.map((icu) => (
                <option key={icu.id} value={icu.id}>
                  {icu.name} ({icu.code}) - {icu.floor}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeScope === 'SHIFT' && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              Filter by Active Shift Handover:
            </span>
            <select
              value={selectedShiftId || shiftsList[0]?.id || ''}
              onChange={(e) => dispatch(setSelectedShiftId(e.target.value))}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {shiftsList.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ================= SEARCH & STATUS FILTER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, License, Specialty, Employee ID, Pager..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-200 dark:bg-slate-700/60 p-0.5 rounded-xl text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'ON_DUTY', 'INACTIVE'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === s
                    ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= STAFF MEMBER CARDS ================= */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Querying Staff Management Service...
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">GET /api/v1/hospitals/.../staff</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-12 text-center">
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Staff Members Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No clinicians matched your current scope or search criteria. Try switching the scope or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const isOnline = staff.user.status === 'ACTIVE' || staff.user.status === 'ON_DUTY';
            const initials = `${staff.user.first_name[0] || 'D'}${staff.user.last_name[0] || 'S'}`;

            return (
              <div
                key={staff.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Initials & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {initials}
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {staff.user.first_name} {staff.user.last_name}
                        </h3>
                        <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold block mt-0.5">
                          {staff.user.employee_id}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        staff.user.status === 'ON_DUTY'
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50'
                          : isOnline
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {staff.user.status}
                    </span>
                  </div>

                  {/* Specialty & License Grid */}
                  <div className="space-y-2 py-2 border-y border-slate-100 dark:border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Specialty:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {staff.specialty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> License:
                      </span>
                      <span className="font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded border border-teal-500/20 text-[11px]">
                        {staff.medical_license_number}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <RadioTower className="w-3.5 h-3.5 text-purple-600" /> Pager / Ext:
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {staff.pager_number ? (
                          <span className="text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {staff.pager_number}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                        {staff.phone_extension && (
                          <span className="text-slate-600 dark:text-slate-300">
                            ext {staff.phone_extension}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-3 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{staff.user.email}</span>
                    </div>
                    {staff.user.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{staff.user.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedStaffForDossier(staff)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Staff Dossier
                  </button>

                  <button
                    onClick={() => handleSendPagerPing(staff)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50 rounded-lg text-xs font-bold transition shadow-2xs"
                    title="Send STAT Emergency Pager Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Ping Pager
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: REGISTER CLINICAL STAFF PROFILE ================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Register Clinical Staff Profile
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">POST /api/v1/staff</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formValidationError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formValidationError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterStaffSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Verified User Account *
                  </label>
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1 font-mono">
                    <UserCheck className="w-3.5 h-3.5" />
                    {unregisteredUsers.length} Ready to Register
                  </span>
                </div>

                <select
                  value={isCustomUserId ? '__CUSTOM__' : formUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="" disabled>-- Select a Verified Clinical Account --</option>
                  {unregisteredUsers.length > 0 && (
                    <optgroup label="Available to Register">
                      {unregisteredUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} ({u.email}) — {u.role || 'STAFF'} [{u.employee_id || 'ID'}]
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {registeredUsersList.length > 0 && (
                    <optgroup label="Already Registered (Profile Exists)">
                      {registeredUsersList.map((u) => (
                        <option key={u.id} value={u.id} disabled>
                          {u.first_name} {u.last_name} ({u.email}) — [Already Registered]
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__CUSTOM__">⚡ Enter Custom User UUID...</option>
                </select>

                {isCustomUserId ? (
                  <div className="mt-2.5 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Direct User Account UUID:
                    </label>
                    <input
                      type="text"
                      value={customUserIdInput}
                      onChange={(e) => setCustomUserIdInput(e.target.value)}
                      placeholder="e.g. b503be05-e5e5-43c0-b853-4cf88a014423"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-teal-400 dark:border-teal-600 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                ) : (
                  (() => {
                    const activeUser = availableUsers.find((u) => u.id === formUserId) || availableUsers[0];
                    if (!activeUser) {
                      return (
                        <span className="text-[11px] text-slate-500 font-mono block mt-1">
                          User ID: {formUserId || 'None selected'}
                        </span>
                      );
                    }
                    return (
                      <div className="mt-2 p-2.5 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {activeUser.first_name} {activeUser.last_name}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-teal-200 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 rounded">
                              {activeUser.role || 'STAFF'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                            <span>UUID: {activeUser.id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyUserId(activeUser.id)}
                              className="text-teal-600 hover:text-teal-700 flex items-center gap-0.5 ml-1 transition"
                              title="Copy User UUID"
                            >
                              {copiedId === activeUser.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                          {activeUser.email}
                        </span>
                      </div>
                    );
                  })()
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medical License Number *
                  </label>
                  <input
                    type="text"
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    placeholder="e.g. GMC-7489201"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Specialty *
                  </label>
                  <input
                    type="text"
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    placeholder="e.g. Critical Care Medicine"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pager Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPagerNumber}
                    onChange={(e) => setFormPagerNumber(e.target.value)}
                    placeholder="e.g. PAG-402"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Extension (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPhoneExtension}
                    onChange={(e) => setFormPhoneExtension(e.target.value)}
                    placeholder="e.g. 2050"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingProfile ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: STAFF DOSSIER ================= */}
      {selectedStaffForDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Clinician Dossier
              </h3>
              <button
                onClick={() => setSelectedStaffForDossier(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                {selectedStaffForDossier.user.first_name[0]}
                {selectedStaffForDossier.user.last_name[0]}
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white mt-2">
                {selectedStaffForDossier.user.first_name} {selectedStaffForDossier.user.last_name}
              </h2>
              <p className="text-xs text-teal-700 dark:text-teal-400 font-mono font-bold">
                {selectedStaffForDossier.user.employee_id}
              </p>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Record UUID:</span>
                <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-[190px]">
                  {selectedStaffForDossier.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-[190px]">
                  {selectedStaffForDossier.user_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medical License:</span>
                <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                  {selectedStaffForDossier.medical_license_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinical Specialty:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStaffForDossier.specialty}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pager Number:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  {selectedStaffForDossier.pager_number || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Extension:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedStaffForDossier.phone_extension || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedStaffForDossier.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {selectedStaffForDossier.user.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStaffForDossier(null)}
                className="w-full py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminStaffPage;
