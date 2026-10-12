import React from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  lastReceived?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'DATA STREAM INTERRUPTED',
  message = 'Bedside telemetry connection lost. Do not rely on current values for clinical titration.',
  lastReceived = '12:41:08 IST',
  onRetry,
}) => (
  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center space-y-3 font-mono text-xs">
    <WifiOff className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto animate-pulse" />
    <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">{title}</h3>
    <p className="text-rose-800 dark:text-rose-300 max-w-md mx-auto font-sans">{message}</p>
    <div className="text-[11px] text-rose-700 dark:text-rose-400">
      Last Received: <strong>{lastReceived}</strong> · Status: <strong className="uppercase">Disconnected</strong>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Connection</span>
      </button>
    )}
  </div>
);
