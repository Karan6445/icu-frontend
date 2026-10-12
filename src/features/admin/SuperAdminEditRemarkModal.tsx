import React, { useState } from 'react';
import { X, ShieldAlert, FileEdit, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { superAdminEditRemark, UnifiedRemark } from '../../store/slices/patientSlice';
import { addAuditLog } from '../../store/slices/logSlice';

interface SuperAdminEditRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  remark: UnifiedRemark | null;
  patientId: string;
  patientName: string;
}

export const SuperAdminEditRemarkModal: React.FC<SuperAdminEditRemarkModalProps> = ({
  isOpen,
  onClose,
  remark,
  patientId,
  patientName
}) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);

  const [newContent, setNewContent] = useState('');
  const [auditReason, setAuditReason] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (remark) {
      setNewContent(remark.content);
      setAuditReason('');
      setError('');
    }
  }, [remark]);

  if (!isOpen || !remark) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setError('Remark content cannot be empty.');
      return;
    }
    if (!auditReason.trim() || auditReason.trim().length < 10) {
      setError('A detailed mandatory Audit Reason (minimum 10 characters) is required for Command Center edits.');
      return;
    }

    dispatch(
      superAdminEditRemark({
        patientId,
        remarkId: remark.id,
        newContent: newContent.trim(),
        auditReason: auditReason.trim(),
        superAdminName: currentUser.name || 'Command Center'
      })
    );

    // Also dispatch to global audit logs
    dispatch(
      addAuditLog({
        category: 'Action Log',
        action: `SUPER_ADMIN_EDIT_REMARK (${remark.type})`,
        userName: currentUser.name || 'Command Center',
        userRole: 'SUPER_ADMIN',
        module: 'Clinical Remarks & Audits',
        ipAddress: '192.168.1.100',
        status: 'SUCCESS',
        details: `Edited locked remark ${remark.id} for Patient ${patientId}. Reason: ${auditReason.trim()}`
      })
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-rose-500/30 shadow-2xl overflow-hidden font-sans space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Command Center Remark Override & Audit Edit
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500 text-white">
                  GOVERNANCE ACCESS
                </span>
              </h2>
              <p className="text-xs text-rose-200 font-mono">
                Patient: {patientName} • Remark ID: {remark.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-200 hover:text-white hover:bg-rose-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Command Center Administrative Privileges:</strong>
              <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
                This clinical remark is locked for standard Doctors & Nurses. As Command Center, your modifications will be stored permanently alongside the original version in the immutable Audit History log.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-300">
              {error}
            </div>
          )}

          {/* Original Content Display */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Original Locked Content (Read-Only)
            </label>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono leading-relaxed border border-slate-200 dark:border-slate-700">
              {remark.content}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Authored by {remark.authorName} ({remark.authorRole}) at {remark.timestamp}
            </div>
          </div>

          {/* New Content Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Updated Remark Content</span>
              <span className="text-[10px] text-rose-600 font-mono font-bold">REQUIRED</span>
            </label>
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none font-sans"
              placeholder="Enter updated remark details..."
            />
          </div>

          {/* Mandatory Audit Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Mandatory Audit Correction Reason</span>
              <span className="text-[10px] text-rose-600 font-mono font-bold">MANDATORY LOG REASON</span>
            </label>
            <textarea
              rows={2}
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none font-sans"
              placeholder="Explain why this locked clinical remark is being edited (e.g. Corrected medication dosage unit per pharmacy verification)..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Command Center Edit & Record Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
