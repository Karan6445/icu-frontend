import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Bug, ChevronUp, ChevronDown, CheckCircle, Shield, Database, Terminal } from 'lucide-react';

export const DevApiDebugPanel: React.FC = () => {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const { user, currentUser, activeRole, isAuthenticated, lastApiResponse } = useAppSelector(
    state => state.auth
  );

  const activeUser = user || currentUser;

  return (
    <div className="fixed bottom-3 right-3 z-50 font-mono text-xs select-none">
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-teal-400 border border-teal-500/40 shadow-xl backdrop-blur-md transition-all active:scale-95"
          title="Open Dev API Debug Inspector"
        >
          <Bug className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-[11px] tracking-wider uppercase">DEV API Debug</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      ) : (
        /* Expanded Debug Panel Card */
        <div className="w-96 bg-slate-950/95 border border-teal-500/40 rounded-3xl shadow-2xl p-4 text-slate-200 backdrop-blur-lg animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="font-black text-xs text-white uppercase tracking-wider">
                Dev Auth & API Inspector
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {/* Section 1: Current Authenticated User */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Current Authenticated User (/auth/me)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
                <div>
                  <span className="text-slate-500 block">USER ID:</span>
                  <span className="font-bold text-white truncate block">{activeUser?.id || 'Unauthenticated'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ROLE:</span>
                  <span className="font-bold text-emerald-400 block">{activeUser?.role || activeRole}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">EMAIL/USERNAME:</span>
                  <span className="font-bold text-white truncate block">{activeUser?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">HOSPITAL:</span>
                  <span className="font-bold text-white truncate block">{activeUser?.hospital || 'N/A'}</span>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
                <span>AUTH STATUS:</span>
                <span className={isAuthenticated ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isAuthenticated ? '● AUTHENTICATED' : '○ UNAUTHENTICATED'}
                </span>
              </div>
            </div>

            {/* Section 2: Last API Response / Payload */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-teal-400">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Last Dashboard API Response</span>
                </div>
                <span className="text-[9px] font-normal text-slate-400">DEV MODE ONLY</span>
              </div>
              <pre className="p-2 rounded-xl bg-slate-950 text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-40 border border-slate-800 leading-tight">
                {lastApiResponse
                  ? JSON.stringify(lastApiResponse, null, 2)
                  : JSON.stringify({ message: 'No API calls made yet', timestamp: new Date().toISOString() }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevApiDebugPanel;
