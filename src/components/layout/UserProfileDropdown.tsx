import React, { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  LogOut, 
  ChevronRight, 
  User,
  ShieldCheck,
  Settings,
  Crown,
  Building2,
  Stethoscope,
  HeartPulse,
  RefreshCw,
  LayoutDashboard,
  Activity,
  Users
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { UserProfile, SystemRole, logoutUserThunk, logout as reduxLogout } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store/hooks';

export interface UserProfileDropdownProps {
  user: UserProfile | any;
  activeRole?: string;
  hospital?: string;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange?: (role: SystemRole) => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user,
  activeRole = 'SUPER_ADMIN',
  isOpen,
  onClose,
  onRoleChange
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when pressing Escape or clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    AuthService.logout();
    dispatch(logoutUserThunk());
    dispatch(reduxLogout());
    onClose();
    navigate('/login');
  };

  const handleSelectRole = (role: SystemRole) => {
    if (onRoleChange) {
      onRoleChange(role);
    }
    onClose();
  };

  const displayName = user?.name || 'Dr. Vikramaditya Sen';
  const displayStaffId = user?.staffId || 'SA-9901';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Role-specific compact links
  const getRoleLinks = () => {
    switch (activeRole) {
      case 'DOCTOR':
        return [
          { label: 'Doctor Profile', path: '/doctor/profile', icon: User },
          { label: 'Shift Handover', path: '/handover', icon: RefreshCw },
          { label: 'Assigned Patients', path: '/doctor/patients', icon: Stethoscope }
        ];
      case 'CHARGE_NURSE':
      case 'NURSE_LEAD':
        return [
          { label: 'Charge Nurse Cockpit', path: '/nurse', icon: LayoutDashboard },
          { label: 'Bedside Telemetry Stream', path: '/nurse/monitoring', icon: Activity },
          { label: 'Interactive Bed Map', path: '/nurse/beds', icon: HeartPulse },
          { label: 'Patient Roster & Intake', path: '/nurse/patients', icon: Users },
          { label: 'Shift Handover Roster', path: '/handover', icon: RefreshCw }
        ];
      case 'NURSE':
        return [
          { label: 'Nurse Profile', path: '/nurse/profile', icon: User },
          { label: 'Shift Handover', path: '/handover', icon: RefreshCw },
          { label: 'Bed Monitoring', path: '/nurse/beds', icon: HeartPulse }
        ];
      case 'ADMIN':
        return [
          { label: 'User Roles & RBAC', path: '/admin/roles', icon: ShieldCheck },
          { label: 'Activity Logs', path: '/admin/activity-logs', icon: FileText },
          { label: 'Settings', path: '/admin/settings', icon: Settings }
        ];
      case 'SUPER_ADMIN':
      default:
        return [
          { label: 'Role Permissions & RBAC', path: '/admin/roles', icon: ShieldCheck },
          { label: 'Audit Logs & Trail', path: '/admin/audit-logs', icon: FileText },
          { label: 'System Settings', path: '/admin/settings', icon: Settings }
        ];
    }
  };

  const roleLinks = getRoleLinks();

  return (
    <>
      {/* Invisible backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/10" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Compact Popover */}
      <div 
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 font-sans animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Compact Header */}
        <div className="p-3 bg-gradient-to-r from-[#0F766E] to-[#0A3D38] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/30 border border-teal-300/40 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold truncate text-white leading-tight">{displayName}</h4>
              <div className="flex items-center gap-1.5 text-[10px] text-teal-100 font-mono mt-0.5">
                <span className="font-bold text-teal-200">{activeRole === 'SUPER_ADMIN' ? 'COMMAND CENTER' : activeRole}</span>
                <span>•</span>
                <span className="text-teal-100/90">{displayStaffId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Command Center Perspective Switcher: Sleek 1-Row Grid (Only for Command Center) */}
        {activeRole === 'SUPER_ADMIN' && onRoleChange && (
          <div className="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Switch Perspective
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { role: 'SUPER_ADMIN', label: 'Command', icon: Crown },
                { role: 'ADMIN', label: 'Admin', icon: Building2 },
                { role: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
                { role: 'NURSE', label: 'Nurse', icon: HeartPulse }
              ].map(r => {
                const isActive = activeRole === r.role;
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleSelectRole(r.role as SystemRole)}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0F766E] text-white border-[#0D655E] shadow-xs'
                        : 'bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                    title={`Switch to ${r.label}`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="leading-none text-[9px]">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Role-Specific Links */}
        <div className="p-1.5 space-y-0.5">
          {roleLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            );
          })}
        </div>

        {/* Compact Logout Footer */}
        <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfileDropdown;
