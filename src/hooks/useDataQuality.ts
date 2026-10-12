import { DataQuality } from '../types/observation';

export function useDataQuality(quality: DataQuality) {
  const getQualityDetails = () => {
    switch (quality) {
      case 'LIVE':
        return {
          label: 'LIVE',
          color: 'bg-emerald-500 text-white',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dotClass: 'bg-emerald-500 animate-live-pulse',
          description: 'Streaming real-time telemetry verified (< 3s latency)'
        };
      case 'DELAYED':
        return {
          label: 'DELAYED',
          color: 'bg-amber-500 text-white',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
          dotClass: 'bg-amber-500',
          description: 'Network buffer delay detected (30s - 5min latency)'
        };
      case 'STALE':
        return {
          label: 'STALE',
          color: 'bg-slate-500 text-white',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
          dotClass: 'bg-slate-400',
          description: 'Data packet timeout (> 5min). Do not rely for live titration.'
        };
      case 'DISCONNECTED':
        return {
          label: 'DISCONNECTED',
          color: 'bg-rose-600 text-white',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
          dotClass: 'bg-rose-600 animate-ping',
          description: 'Bedside device physically offline or gateway unmapped.'
        };
    }
  };

  return getQualityDetails();
}
