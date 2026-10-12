import React, { useState, useEffect } from 'react';
import {
  Building2,
  UserCheck,
  Plus,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  GitFork,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  Activity,
  Radio,
  ExternalLink,
  ChevronRight,
  Globe,
  X,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchHospitalsThunk,
  createHospitalThunk,
  fetchHospitalDetailsThunk,
  updateHospitalThunk,
  deleteHospitalThunk,
  fetchHospitalHierarchyThunk,
  assignDirectorToHospital,
  addDirector,
  setSelectedHospital,
  clearHospitalDetails,
  clearHospitalSuccessMessage,
  Hospital,
} from '../../store/slices/hospitalSlice';
import { validateEmail } from '../../utils/validation';
import { hospitalApi, HospitalHierarchyResponse } from '../../api/hospitalApi';
import { API_BASE_URL } from '../../api/axios.config';

export const AdminHospitalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    hospitals,
    directors,
    selectedHospitalDetails,
    isLoading,
    isDetailsLoading,
    error,
    successMessage,
  } = useAppSelector(state => state.hospital);
  const { activeRole } = useAppSelector(state => state.auth);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal & Form States
  const [isCreateHospitalOpen, setIsCreateHospitalOpen] = useState(false);
  const [isAssignDirectorOpen, setIsAssignDirectorOpen] = useState(false);
  const [isAddDirectorOpen, setIsAddDirectorOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Hierarchy Modal State
  const [hierarchyData, setHierarchyData] = useState<HospitalHierarchyResponse | null>(null);
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(false);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  // Edit Hospital State
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTimezone, setEditTimezone] = useState('UTC');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editCommandCenter, setEditCommandCenter] = useState(true);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Delete Hospital Confirmation State
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success Notification
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Hospital Form
  const [hospName, setHospName] = useState('');
  const [hospCode, setHospCode] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [contactPhone, setContactPhone] = useState('+91 11 2658 8500');
  const [contactEmail, setContactEmail] = useState('');
  const [totalBeds, setTotalBeds] = useState('40');
  const [selectedUnits, setSelectedUnits] = useState(['MICU-01', 'SICU-01']);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  // Assign Director Form
  const [selectedHospId, setSelectedHospId] = useState(hospitals[0]?.id || '');
  const [selectedDirId, setSelectedDirId] = useState(directors[0]?.id || '');

  // Add Director Form
  const [dirName, setDirName] = useState('');
  const [dirEmail, setDirEmail] = useState('');
  const [dirEmailError, setDirEmailError] = useState<string | null>(null);
  const [totalBedsError, setTotalBedsError] = useState<string | null>(null);
  const [dirPhone, setDirPhone] = useState('');
  const [dirSpecialty, setDirSpecialty] = useState('Chief Medical Officer');

  // Load Hospitals on mount from live backend (GET /api/v1/hospitals)
  useEffect(() => {
    dispatch(fetchHospitalsThunk());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchHospitalsThunk());
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // 1. CREATE HOSPITAL (POST /api/v1/hospitals)
  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName.trim() || !hospCode.trim()) return;

    const numBeds = Number(totalBeds);
    if (!totalBeds || isNaN(numBeds) || numBeds < 1) {
      setTotalBedsError('Total ICU beds must be a positive number (minimum 1)');
      return;
    }
    setTotalBedsError(null);
    setIsCreateSubmitting(true);
    setActionError(null);

    try {
      await dispatch(
        createHospitalThunk({
          name: hospName.trim(),
          code: hospCode.trim().toUpperCase(),
          organization_id: 'e1111111-1111-1111-1111-111111111111',
          timezone: 'UTC',
          country_code: 'IND',
          address: {
            city: city.trim() || 'New Delhi',
            state: state.trim() || 'Delhi',
            street: `${city} Smart Medical Road`,
          },
          contact_phone: contactPhone.trim(),
          contact_email: contactEmail.trim() || undefined,
          is_command_center_enabled: true,
        })
      ).unwrap();

      showSuccess(`Hospital "${hospName}" registered successfully on backend.`);
      setHospName('');
      setHospCode('');
      setTotalBeds('40');
      setIsCreateHospitalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to register hospital facility.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  // 2. OPEN EDIT MODAL (PATCH /api/v1/hospitals/{id})
  const handleOpenEdit = (hosp: Hospital) => {
    setEditingHospital(hosp);
    setEditName(hosp.name);
    setEditPhone(hosp.contact_phone || hosp.contactNumber || '');
    setEditTimezone('UTC');
    setEditStatus(hosp.status || 'ACTIVE');
    setEditCommandCenter(hosp.is_command_center_enabled ?? true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;

    setIsEditSubmitting(true);
    setActionError(null);

    try {
      await dispatch(
        updateHospitalThunk({
          id: editingHospital.id,
          payload: {
            name: editName.trim(),
            contact_phone: editPhone.trim(),
            timezone: editTimezone,
            status: editStatus,
            is_command_center_enabled: editCommandCenter,
          },
        })
      ).unwrap();

      showSuccess(`Hospital "${editName}" updated successfully.`);
      setEditingHospital(null);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update hospital facility.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // 3. DELETE HOSPITAL (DELETE /api/v1/hospitals/{id})
  const handleConfirmDelete = async () => {
    if (!hospitalToDelete) return;
    setIsDeleting(true);
    setActionError(null);

    try {
      await dispatch(deleteHospitalThunk(hospitalToDelete.id)).unwrap();
      showSuccess(`Hospital "${hospitalToDelete.name}" deleted / deactivated successfully.`);
      setHospitalToDelete(null);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to delete hospital facility.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. FETCH HIERARCHY (GET /api/v1/hospitals/{id}/hierarchy)
  const handleViewHierarchy = async (hosp: Hospital) => {
    setIsHierarchyLoading(true);
    setHierarchyError(null);
    setHierarchyData(null);

    try {
      const res = await hospitalApi.hierarchy(hosp.id);
      setHierarchyData(res.data);
    } catch (err: any) {
      setHierarchyError(err?.message || 'Failed to load location hierarchy for this facility.');
    } finally {
      setIsHierarchyLoading(false);
    }
  };

  // 5. FETCH HOSPITAL DETAILS (GET /api/v1/hospitals/{id})
  const handleViewDetails = (hosp: Hospital) => {
    setDetailsModalOpen(true);
    dispatch(fetchHospitalDetailsThunk(hosp.id));
  };

  // 6. ASSIGN DIRECTOR
  const handleAssignDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospId || !selectedDirId) return;

    dispatch(
      assignDirectorToHospital({
        hospitalId: selectedHospId,
        directorId: selectedDirId,
      })
    );
    showSuccess('Medical Director assigned successfully.');
    setIsAssignDirectorOpen(false);
  };

  // 6. ADD DIRECTOR
  const handleAddDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirName.trim()) return;

    const emailValidation = validateEmail(dirEmail, 'Director email', true);
    if (emailValidation !== true) {
      setDirEmailError(emailValidation);
      return;
    }
    setDirEmailError(null);

    dispatch(
      addDirector({
        name: dirName.trim(),
        email: dirEmail.trim(),
        phone: dirPhone.trim() || '+91 98000 00000',
        specialty: dirSpecialty.trim(),
      })
    );

    showSuccess('Medical Director profile created.');
    setDirName('');
    setDirEmail('');
    setIsAddDirectorOpen(false);
  };

  // Filtered list
  const filteredHospitals = hospitals.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? h.status === 'ACTIVE'
        : h.status !== 'ACTIVE';

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans pb-12">
      {/* ================= HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white border border-teal-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              COMMAND CENTER GOVERNANCE
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API: {API_BASE_URL.replace(/^https?:\/\//, '')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hospital Facilities & Network Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage public & command-center hospital nodes via live REST endpoints: 
            <span className="font-mono text-teal-300 ml-1">POST, GET, PATCH, DELETE, Hierarchy</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-200 border border-teal-700/50 font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Refresh hospitals from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync API</span>
          </button>

          <button
            onClick={() => setIsCreateHospitalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Hospital Facility</span>
          </button>

          <button
            onClick={() => setIsAssignDirectorOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Director</span>
          </button>
        </div>
      </div>

      {/* ================= ALERTS & FEEDBACK ================= */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {(actionError || error) && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError || error}</span>
        </div>
      )}

      {/* ================= CONTROLS & FILTER BAR ================= */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search hospitals by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All ({hospitals.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'INACTIVE'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* ================= HOSPITAL CARDS GRID ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>Connected Facility Nodes ({filteredHospitals.length})</span>
          </h2>
          <button
            onClick={() => setIsAddDirectorOpen(true)}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 font-mono flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medical Director Profile</span>
          </button>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              No hospital facilities found matching your search.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-teal-600 underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/5 rounded-bl-full pointer-events-none" />

                <div className="space-y-3">
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                        {hosp.code}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {hosp.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] font-mono border shrink-0 ${
                        hosp.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {hosp.status}
                    </span>
                  </div>

                  {/* Location & Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">
                        {hosp.city}, {hosp.state}
                      </span>
                    </div>

                    {hosp.contact_phone && (
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hosp.contact_phone}</span>
                      </div>
                    )}

                    {hosp.contact_email && (
                      <div className="flex items-center gap-2 text-[11px] truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hosp.contact_email}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Director Badge */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                      Assigned Hospital Director
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">{hosp.directorName || 'Unassigned (Pending)'}</span>
                    </div>
                  </div>

                  {/* ICU Beds and Command Center Flag */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>
                      Total Beds: <strong className="text-slate-800 dark:text-slate-200">{hosp.totalBeds}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                      <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                      Telemetry Ready
                    </span>
                  </div>
                </div>

                {/* Card Actions (Details, Hierarchy, Edit, Delete) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewDetails(hosp)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Inspect Hospital Details (GET /api/v1/hospitals/{id})"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleViewHierarchy(hosp)}
                      className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Inspect State & District hierarchy (GET /api/v1/hospitals/{id}/hierarchy)"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Hierarchy</span>
                    </button>

                    <button
                      onClick={() => {
                        dispatch(setSelectedHospital(hosp.id));
                        navigate('/admin/hospital-details');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Manage Clinical Departments (GET & POST /api/v1/departments)"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Departments</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(hosp)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Edit Hospital details (PATCH)"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setHospitalToDelete(hosp)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Deactivate / Delete facility"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL 1: REGISTER HOSPITAL (POST /api/v1/hospitals) ================= */}
      {isCreateHospitalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <span>Register Hospital Facility (POST /api/v1/hospitals)</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  Enrolls new facility node into command center backend
                </p>
              </div>
              <button
                onClick={() => setIsCreateHospitalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHospital} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hospital Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  placeholder="e.g. Apex Central Smart ICU Hospital"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hospital Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hospCode}
                    onChange={(e) => setHospCode(e.target.value)}
                    placeholder="e.g. HOSP-APEX-01"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Total ICU Beds <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  {totalBedsError && (
                    <span className="text-rose-500 text-[10px] block mt-1">{totalBedsError}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 11 2658 8500"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@hospital.org"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateHospitalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreateSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isCreateSubmitting ? 'Registering...' : 'Register Hospital'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT HOSPITAL (PATCH /api/v1/hospitals/{id}) ================= */}
      {editingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-teal-600" />
                  <span>Update Hospital Facility</span>
                </h2>
                <span className="text-[10px] font-mono text-teal-600">
                  PATCH /api/v1/hospitals/{editingHospital.id}
                </span>
              </div>
              <button
                onClick={() => setEditingHospital(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value)}
                    placeholder="UTC"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ccEnabled"
                  checked={editCommandCenter}
                  onChange={(e) => setEditCommandCenter(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label
                  htmlFor="ccEnabled"
                  className="font-bold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  Enable Command Center Telemetry Stream
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingHospital(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isEditSubmitting ? 'Updating...' : 'Save Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DELETE HOSPITAL CONFIRMATION (DELETE /api/v1/hospitals/{id}) ================= */}
      {hospitalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-rose-300 dark:border-rose-900 shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Deactivate Hospital Facility?
                </h3>
                <p className="text-xs text-rose-600 font-mono">
                  DELETE /api/v1/hospitals/{hospitalToDelete.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to deactivate{' '}
              <strong>"{hospitalToDelete.name}"</strong> ({hospitalToDelete.code})?
              This will remove its active telemetry ingestion and unlink command center nodes.
            </p>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setHospitalToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Deactivate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: LOCATION HIERARCHY INSPECTOR (GET /api/v1/hospitals/{id}/hierarchy) ================= */}
      {(hierarchyData || isHierarchyLoading || hierarchyError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-teal-500/30 shadow-2xl p-6 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Hospital Location Hierarchy
                  </h3>
                  <span className="text-[10px] font-mono text-teal-600">
                    GET /api/v1/hospitals/{'{id}'}/hierarchy
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setHierarchyData(null);
                  setHierarchyError(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isHierarchyLoading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                <span className="text-xs text-slate-500 font-mono">
                  Loading state, district, and user hierarchy...
                </span>
              </div>
            )}

            {hierarchyError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{hierarchyError}</span>
              </div>
            )}

            {hierarchyData && (
              <div className="space-y-4 text-xs">
                {/* Visual Breadcrumb Hierarchy */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Geographic & Administrative Hierarchy
                  </div>

                  <div className="space-y-2">
                    {/* State Level */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">State</span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {hierarchyData.state?.name || 'Central Healthcare Administration'}
                          {hierarchyData.state?.code && (
                            <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                              {hierarchyData.state.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* District Level */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ml-4">
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">District</span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {hierarchyData.district?.name || 'Regional Healthcare District'}
                          {hierarchyData.district?.code && (
                            <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {hierarchyData.district.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Facility Level */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800 ml-8">
                      <ChevronRight className="w-4 h-4 text-teal-500 shrink-0" />
                      <Building2 className="w-4 h-4 text-teal-700 dark:text-teal-300 shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase font-bold">
                          Facility Node
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {hierarchyData.name} ({hierarchyData.code})
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 border border-emerald-300">
                        {hierarchyData.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Users / Staff */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>Associated Clinical & Governance Staff ({hierarchyData.users?.length || 0})</span>
                    </span>
                  </div>

                  {hierarchyData.users && hierarchyData.users.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {hierarchyData.users.map((u) => (
                        <div
                          key={u.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {u.first_name} {u.last_name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{u.email}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {u.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      No clinical users directly assigned to this hospital yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setHierarchyData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: ASSIGN DIRECTOR ================= */}
      {isAssignDirectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Assign Medical Director to Hospital
              </h2>
              <button
                onClick={() => setIsAssignDirectorOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignDirector} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Hospital
                </label>
                <select
                  value={selectedHospId}
                  onChange={(e) => setSelectedHospId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-sans"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Director Profile
                </label>
                <select
                  value={selectedDirId}
                  onChange={(e) => setSelectedDirId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-sans"
                >
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignDirectorOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Assign Director
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: ADD DIRECTOR PROFILE ================= */}
      {isAddDirectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                Add Director Profile
              </h2>
              <button
                onClick={() => setIsAddDirectorOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDirector} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Director Full Name
                </label>
                <input
                  type="text"
                  required
                  value={dirName}
                  onChange={(e) => setDirName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Chander"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={dirEmail}
                  onChange={(e) => {
                    setDirEmail(e.target.value);
                    if (dirEmailError) setDirEmailError(null);
                  }}
                  placeholder="director@hospital.org"
                  className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                    dirEmailError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white transition-colors focus:outline-none`}
                />
                {dirEmailError && (
                  <span className="text-rose-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                    {dirEmailError}
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Specialty & Title
                </label>
                <input
                  type="text"
                  value={dirSpecialty}
                  onChange={(e) => setDirSpecialty(e.target.value)}
                  placeholder="Chief Medical Officer & ICU Director"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDirectorOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-md cursor-pointer"
                >
                  Create Director Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: HOSPITAL DETAILS (GET /api/v1/hospitals/{id}) ================= */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-teal-500/30 shadow-2xl p-6 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/80 rounded-2xl text-teal-700 dark:text-teal-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Hospital Facility Details
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      GET /api/v1/hospitals/{'{id}'}
                    </span>
                    <span className="text-[11px] text-slate-400">Live API Response</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  dispatch(clearHospitalDetails());
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDetailsLoading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                <span className="text-xs font-bold">Querying backend for facility details...</span>
              </div>
            )}

            {!isDetailsLoading && selectedHospitalDetails && (
              <div className="space-y-4 text-xs">
                {/* Name & Code Header Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                        CODE: {selectedHospitalDetails.code}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedHospitalDetails.name}
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] font-mono border ${
                        selectedHospitalDetails.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {selectedHospitalDetails.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    UUID: {selectedHospitalDetails.id}
                  </div>
                </div>

                {/* Location & Timezone Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      City & State
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{selectedHospitalDetails.city}, {selectedHospitalDetails.state}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Timezone & Region
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>{selectedHospitalDetails.timezone || 'UTC'} ({selectedHospitalDetails.country_code || 'IND'})</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Channels
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedHospitalDetails.contact_phone || selectedHospitalDetails.contactNumber || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedHospitalDetails.contact_email || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* ICU Beds & Telemetry */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ICU Capacity
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedHospitalDetails.totalBeds} Total Beds
                      </span>
                      <span className="text-slate-400 font-mono">
                        ({selectedHospitalDetails.availableBeds ?? 14} Available)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>{selectedHospitalDetails.is_command_center_enabled ? 'Command Center Enabled' : 'Local Only'}</span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDetailsModalOpen(false);
                        handleViewHierarchy(selectedHospitalDetails);
                      }}
                      className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>View Hierarchy</span>
                    </button>
                    <button
                      onClick={() => {
                        setDetailsModalOpen(false);
                        dispatch(setSelectedHospital(selectedHospitalDetails.id));
                        navigate('/admin/hospital-details');
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Clinical Departments</span>
                    </button>
                    <button
                      onClick={() => {
                        setDetailsModalOpen(false);
                        handleOpenEdit(selectedHospitalDetails);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Facility</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      dispatch(clearHospitalDetails());
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHospitalsPage;
