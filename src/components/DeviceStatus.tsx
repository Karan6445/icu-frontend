import React from 'react';
import { DeviceItem } from '../types/icu';
import { StatusBadge } from './StatusBadge';
import { Monitor, Cpu, Activity, AlertCircle } from 'lucide-react';

interface DeviceStatusProps {
  device: DeviceItem;
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({ device }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
          {device.type === 'MONITOR' ? (
            <Monitor className="w-4 h-4 text-blue-700" />
          ) : (
            <Cpu className="w-4 h-4 text-slate-700" />
          )}
        </div>
        <div>
          <h5 className="font-semibold text-slate-900">{device.name}</h5>
          <p className="text-[11px] text-slate-500 font-mono">
            {device.vendor} • Bed: <span className="font-bold text-slate-800">{device.bedNumber}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div>
          <span className="text-[10px] text-slate-400 block font-mono">Latency</span>
          <span className="font-mono font-semibold text-slate-800">{device.latencyMs} ms</span>
        </div>
        <StatusBadge status={device.status} type="quality" />
      </div>
    </div>
  );
};
