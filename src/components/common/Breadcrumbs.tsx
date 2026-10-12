import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNameMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'patients': 'Patient Registry',
    'icu-beds': 'ICU Beds Overview',
    'live-monitoring': 'Live Telemetry & Vitals',
    'devices': 'Biomedical Devices',
    'nursing': 'Nursing Station',
    'alerts': 'Alert Center',
    'incidents': 'Incident Reports',
    'risks': 'AI Risk Assessment',
    'audits': 'Audit Trail & Compliance',
    'actions': 'Clinical Action Engine',
    'documents': 'Documents & Clinical Guidelines',
    'analytics': 'ICU Analytics & Performance',
    'virtual-icu': 'Virtual ICU Command Center',
    'admin': 'Administration',
    'command-center': 'Command Center',
    'biomedical': 'Biomedical Console',
    'handover': 'Shift Handover',
    'doctor': 'Physician Workstation',
    'nurse': 'Nurse Workstation'
  };

  if (pathnames.length === 0 || location.pathname === '/') {
    return (
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
        <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 flex-wrap">
      <Link
        to="/dashboard"
        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-slate-600 dark:text-slate-400"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[value] || (value.startsWith('P-') ? `Patient ${value}` : value);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[200px]">
                {displayName}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[140px]"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
