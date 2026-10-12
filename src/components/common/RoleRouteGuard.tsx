import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, UserCheck, AlertTriangle } from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { AppRole, RolePermissions } from '../../config/rbacConfig';

interface RoleRouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requiredPermission?: keyof RolePermissions;
  module?: 'ICU' | 'E_CLINIC';
  requiredModule?: 'ICU' | 'E_CLINIC';
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  module,
  requiredModule
}) => {
  const navigate = useNavigate();
  const { role, currentUser, permissions, can, canAccessModule, hasRole } = useRBAC();

  const targetModule = module || requiredModule;
  let isAuthorized = true;
  let denialReason = '';

  if (targetModule && !canAccessModule(targetModule)) {
    isAuthorized = false;
    denialReason = `Your clinical account (${role}) does not have credentialed access to the ${targetModule === 'ICU' ? 'Smart ICU' : 'E-Clinic Telemedicine'} module.`;
  } else if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    isAuthorized = false;
    denialReason = `This clinical workspace is restricted to roles: [${allowedRoles.join(', ')}]. Current role: [${role}].`;
  } else if (requiredPermission && !can(requiredPermission)) {
    isAuthorized = false;
    denialReason = `You lack the specific permission '${String(requiredPermission)}' required to view this clinical section.`;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-5 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-rose-300 dark:border-rose-800">
          Access Restricted • Role Policy
        </span>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-3 font-sans">
          Unauthorized Workspace
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          {denialReason}
        </p>

        {/* Current Active Account Box */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs font-mono">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px]">
            <span>LOGGED IN OPERATOR:</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">{role}</span>
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{currentUser.name}</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            {currentUser.department}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => navigate('/home')}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Smart Health Home</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
