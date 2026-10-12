import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  History,
  Stethoscope,
  HeartPulse,
  Lock,
  FileEdit,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addDoctorRemark, addNurseRemark, UnifiedRemark } from '../store/slices/patientSlice';
import { SuperAdminEditRemarkModal } from '../components/admin/SuperAdminEditRemarkModal';
import { AuditHistoryModal } from '../components/patient/AuditHistoryModal';

export const PatientTimelinePage: React.FC = () => {
  const { patientId: routePatientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { patients } = useAppSelector(state => state.patient);
  const { activeRole, currentUser } = useAppSelector(state => state.auth);

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    routePatientId || patients[0]?.id || 'P-1024'
  );

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Filters & Tabs
  const [filterType, setFilterType] = useState<'ALL' | 'DOCTOR' | 'NURSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Creation forms
  const [showDoctorCheckupForm, setShowDoctorCheckupForm] = useState(false);
  const [showNurseCheckupForm, setShowNurseCheckupForm] = useState(false);

  // Form states
  const [docCategory, setDocCategory] = useState('Ventilator / Respiratory Plan');
  const [docPriority, setDocPriority] = useState('HIGH');
  const [docContent, setDocContent] = useState('');

  const [nurseCategory, setNurseCategory] = useState('Nursing Assessment & Vitals');
  const [nursePriority, setNursePriority] = useState('ROUTINE');
  const [nurseContent, setNurseContent] = useState('');

  // Modals for Super Admin & Audit
  const [editingRemark, setEditingRemark] = useState<UnifiedRemark | null>(null);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

  const [auditRemark, setAuditRemark] = useState<UnifiedRemark | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Submit Doctor Checkup Remark
  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docContent.trim()) return;

    dispatch(
      addDoctorRemark({
        patientId: patient.id,
        doctorName: currentUser.name || 'Dr. Ananya Roy',
        category: docCategory,
        priority: docPriority,
        content: docContent.trim()
      })
    );

    setDocContent('');
    setShowDoctorCheckupForm(false);
  };

  // Submit Nurse Checkup Remark
  const handleNurseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseContent.trim()) return;

    dispatch(
      addNurseRemark({
        patientId: patient.id,
        nurseName: currentUser.name || 'Nurse Priya Sharma',
        category: nurseCategory,
        priority: nursePriority,
        content: nurseContent.trim()
      })
    );

    setNurseContent('');
    setShowNurseCheckupForm(false);
  };

  // Filtered Remarks List
  const allRemarks = patient?.unifiedRemarks || [];
  const filteredRemarks = allRemarks.filter(rem => {
    if (filterType === 'DOCTOR' && rem.type !== 'DOCTOR_REMARK') return false;
    if (filterType === 'NURSE' && rem.type !== 'NURSE_REMARK') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rem.content.toLowerCase().includes(q) ||
        rem.authorName.toLowerCase().includes(q) ||
        rem.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Top Header & Patient Selection Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold">
                UNIFIED TIMELINE
              </span>
              <span className="text-xs font-mono text-slate-400">
                Current Role: <strong className="text-slate-800 dark:text-slate-200">{activeRole === 'SUPER_ADMIN' ? 'COMMAND CENTER' : activeRole}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Patient Timeline & Checkup Remarks Hub
            </h1>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 font-mono">Select Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-sans shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.bedNumber} • {p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-3xl text-white border border-teal-500/30 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 font-mono text-xs font-bold">
                Bed {patient.bedNumber}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              MRN: {patient.mrn} • {patient.unitName} • Attending: {patient.assignedClinician} • Nurse: {patient.assignedNurse}
            </p>
          </div>
        </div>

        {/* Action Checkup Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setShowDoctorCheckupForm(true);
              setShowNurseCheckupForm(false);
            }}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Checkup (Create Remark)</span>
          </button>

          <button
            onClick={() => {
              setShowNurseCheckupForm(true);
              setShowDoctorCheckupForm(false);
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Nurse Checkup (Create Remark)</span>
          </button>
        </div>
      </div>

      {/* Checkup Entry Form: DOCTOR */}
      {showDoctorCheckupForm && (
        <form
          onSubmit={handleDoctorSubmit}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-teal-500 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Doctor Checkup Entry — Add Doctor Remark
            </h3>
            <span className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Remark will be LOCKED upon submission
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Directive Category</label>
              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans"
              >
                <option value="Ventilator / Respiratory Plan">Ventilator / Respiratory Plan</option>
                <option value="Infection Control & Antibiotics">Infection Control & Antibiotics</option>
                <option value="Hemodynamics & Vasopressors">Hemodynamics & Vasopressors</option>
                <option value="Sedation & Pain Management">Sedation & Pain Management</option>
                <option value="General Round Observations">General Round Observations</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority Level</label>
              <select
                value={docPriority}
                onChange={e => setDocPriority(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans font-bold"
              >
                <option value="CRITICAL">CRITICAL (Immediate Implementation)</option>
                <option value="HIGH">HIGH (Priority Round Directive)</option>
                <option value="ROUTINE">ROUTINE (Standard Assessment)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Doctor Remark Content</label>
            <textarea
              rows={3}
              required
              value={docContent}
              onChange={e => setDocContent(e.target.value)}
              placeholder="Enter detailed clinical remarks, treatment orders, and round assessment..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">
              Author: {currentUser.name || 'Dr. Ananya Roy'} ({activeRole})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDoctorCheckupForm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                CREATE & LOCK REMARK
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Checkup Entry Form: NURSE */}
      {showNurseCheckupForm && (
        <form
          onSubmit={handleNurseSubmit}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
              Nurse Checkup Entry — Add Nurse Remark
            </h3>
            <span className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Remark will be LOCKED upon submission
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nursing Care Category</label>
              <select
                value={nurseCategory}
                onChange={e => setNurseCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans"
              >
                <option value="Nursing Assessment & Vitals">Nursing Assessment & Vitals</option>
                <option value="Airway & Suctioning Care">Airway & Suctioning Care</option>
                <option value="Fluid Intake/Output & Catheter">Fluid Intake/Output & Catheter</option>
                <option value="Position Change & Skin Integrity">Position Change & Skin Integrity</option>
                <option value="Bedside Shift Handover Note">Bedside Shift Handover Note</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority Level</label>
              <select
                value={nursePriority}
                onChange={e => setNursePriority(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans font-bold"
              >
                <option value="HIGH">HIGH (Requires Physician Review)</option>
                <option value="ROUTINE">ROUTINE (Standard Shift Note)</option>
                <option value="STABLE">STABLE (Normal Assessment)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nurse Remark Content</label>
            <textarea
              rows={3}
              required
              value={nurseContent}
              onChange={e => setNurseContent(e.target.value)}
              placeholder="Enter nursing observations, vitals checks, hygiene, lines care, and fluid monitoring details..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">
              Author: {currentUser.name || 'Nurse Priya Sharma'} ({activeRole})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNurseCheckupForm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                CREATE & LOCK REMARK
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Type Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Remarks ({allRemarks.length})
          </button>

          <button
            onClick={() => setFilterType('DOCTOR')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'DOCTOR'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor Remarks ({allRemarks.filter(r => r.type === 'DOCTOR_REMARK').length})
          </button>

          <button
            onClick={() => setFilterType('NURSE')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'NURSE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Nurse Remarks ({allRemarks.filter(r => r.type === 'NURSE_REMARK').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search remarks, author..."
            className="pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-sans text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Unified Timeline Feed */}
      <div className="space-y-4">
        {filteredRemarks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <History className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-mono text-slate-500">No remarks found matching your filter criteria.</p>
          </div>
        ) : (
          filteredRemarks.map((rem) => {
            const isDoctor = rem.type === 'DOCTOR_REMARK';
            return (
              <div
                key={rem.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs space-y-3 relative overflow-hidden ${
                  isDoctor ? 'border-teal-200 dark:border-teal-900/60' : 'border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                {/* Status Indicator Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        isDoctor
                          ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {isDoctor ? <Stethoscope className="w-3.5 h-3.5" /> : <HeartPulse className="w-3.5 h-3.5" />}
                      <span>{isDoctor ? 'DOCTOR REMARK' : 'NURSE REMARK'}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                      {rem.category}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">
                      {rem.priority}
                    </span>
                  </div>

                  {/* Lock Badge & Super Admin Action */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-rose-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-rose-500/30">
                      <Lock className="w-3 h-3 text-rose-400" />
                      LOCKED
                    </span>

                    {/* If Super Admin is logged in, show Super Admin Edit button */}
                    {(activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') && (
                      <button
                        onClick={() => {
                          setEditingRemark(rem);
                          setIsSuperAdminModalOpen(true);
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>Edit Remark (Command Center)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Remark Content */}
                <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed font-sans font-medium pt-1">
                  {rem.content}
                </p>

                {/* Footer Metadata & Super Admin Audit Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Author: {rem.authorName} ({rem.authorRole})
                    </span>
                    <span>•</span>
                    <span>{rem.timestamp}</span>
                  </div>

                  {/* Audit History link if edited by Super Admin */}
                  {(rem.isEditedBySuperAdmin || (rem.auditHistory && rem.auditHistory.length > 0)) && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold text-[10px]">
                        ✏️ Edited by Command Center
                      </span>
                      <button
                        onClick={() => {
                          setAuditRemark(rem);
                          setIsAuditModalOpen(true);
                        }}
                        className="text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3 h-3" />
                        <span>View Audit History ({rem.auditHistory?.length || 0})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Super Admin Edit Remark Modal */}
      <SuperAdminEditRemarkModal
        isOpen={isSuperAdminModalOpen}
        onClose={() => setIsSuperAdminModalOpen(false)}
        remark={editingRemark}
        patientId={patient.id}
        patientName={patient.name}
      />

      {/* Audit History Drawer / Modal */}
      <AuditHistoryModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        remark={auditRemark}
        patientName={patient.name}
      />
    </div>
  );
};

export default PatientTimelinePage;
