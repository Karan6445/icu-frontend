import React from 'react';
import { X, History, ShieldAlert, ArrowRight, UserCheck, Calendar } from 'lucide-react';
import { AuditHistoryRecord, UnifiedRemark } from '../../store/slices/patientSlice';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  remark: UnifiedRemark | null;
  patientName: string;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  remark,
  patientName
}) => {
  if (!isOpen || !remark) return null;

  const history = remark.auditHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans space-y-0 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Audit History & Change Lineage
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {history.length} Revision(s) Recorded
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                Patient: {patientName} • Remark ID: {remark.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Current Live State */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                Current Active Remark (Live State)
              </span>
              <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400">
                Author: {remark.authorName} ({remark.authorRole})
              </span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans pt-1">
              {remark.content}
            </p>
          </div>

          {/* Timeline of Revisions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Historical Audit Trail & Diff Logs
            </h3>

            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                No Command Center revisions have been made to this remark yet.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record, index) => (
                  <div
                    key={record.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white font-bold text-[10px] font-mono">
                          REVISION #{history.length - index}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Edited by {record.editedBy} ({record.editedByRole})
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {record.timestamp}
                      </span>
                    </div>

                    {/* Mandatory Audit Reason */}
                    <div className="p-3 rounded-xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300/40 text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200 uppercase text-[10px] font-mono block">
                        Mandatory Audit Reason:
                      </span>
                      <p className="text-amber-800 dark:text-amber-300 text-xs mt-0.5 italic">
                        "{record.auditReason}"
                      </p>
                    </div>

                    {/* Side by side or stacked diff */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400 uppercase">
                          Previous Content (Before Edit)
                        </span>
                        <p className="text-rose-900 dark:text-rose-200 line-through decoration-rose-400">
                          {record.previousContent}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                          New Content (After Edit)
                        </span>
                        <p className="text-emerald-900 dark:text-emerald-200 font-medium">
                          {record.newContent}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
