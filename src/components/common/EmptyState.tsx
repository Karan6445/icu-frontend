import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active items requiring attention',
  message = 'All parameters are within baseline limits and telemetry streams are healthy.',
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">{title}</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{message}</p>
  </div>
);
