import React from 'react';
import { DeviceService } from '../../services/deviceService';
import { StatusBadge } from '../../components/StatusBadge';
import { DeviceTopology } from '../../components/svg/DeviceTopology';
import { Cpu, Server, HardDrive, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export const BiomedicalPage: React.FC = () => {
  const devices = DeviceService.getDevicesSync();
  const gateways = DeviceService.getGateways();

  const totalDevices = devices.length;
  const connectedCount = devices.filter(d => d.status === 'LIVE').length;
  const delayedCount = devices.filter(d => d.status === 'DELAYED').length;
  const disconnectedCount = devices.filter(d => d.status === 'DISCONNECTED').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Biomedical Engineering & Gateway Console
            </h1>
            <span className="text-xs text-slate-500">
              Device connectivity, gateway health diagnostics, error rates, and protocol parameter mapping.
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Gateway telemetry diagnostics refreshed.')}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold font-mono transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          <span>Refresh Telemetry Bus</span>
        </button>
      </div>

      {/* Gateway Telemetry Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 uppercase font-bold text-[10px]">TOTAL ICU DEVICES</span>
          <div className="text-3xl font-black text-slate-900">{totalDevices} Devices</div>
          <span className="text-[11px] text-teal-600 font-bold block">36 Channels Mapped</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-emerald-700 uppercase font-bold text-[10px]">CONNECTED & STREAMING</span>
          <div className="text-3xl font-black text-emerald-600">{connectedCount} Devices</div>
          <span className="text-[11px] text-slate-500 block">&lt; 3s Heartbeat Verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-amber-800 uppercase font-bold text-[10px]">BUFFER DELAYED</span>
          <div className="text-3xl font-black text-amber-600">{delayedCount} Devices</div>
          <span className="text-[11px] text-slate-500 block">Packet Retry Buffer Active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs space-y-1">
          <span className="text-rose-800 uppercase font-bold text-[10px]">DISCONNECTED / ERROR</span>
          <div className="text-3xl font-black text-rose-600">{disconnectedCount} Devices</div>
          <span className="text-[11px] text-slate-500 block">Physical Check Required</span>
        </div>
      </div>

      {/* Gateways Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {gateways.map(gw => (
          <div key={gw.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-900 text-sm">{gw.id} ({gw.unit})</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {gw.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>IP: <span className="font-bold text-slate-900">{gw.ipAddress}</span></div>
              <div>Connected: <span className="font-bold text-slate-900">{gw.connectedDevices}</span></div>
              <div>Rate: <span className="font-bold text-teal-600">{gw.packetsPerSec} pps</span></div>
              <div>Latency: <span className="font-bold text-purple-600">{gw.latencyMs} ms</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Topology SVG */}
      <DeviceTopology />

      {/* Master Device Registry Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 font-mono">
          Bedside Device Telemetry & Protocol Registry
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Device Name</th>
                <th className="py-2.5 px-3">Vendor / Model</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Bed</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Pkt Rate</th>
                <th className="py-2.5 px-3">Error Rate</th>
                <th className="py-2.5 px-3">Last Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {devices.map(dev => (
                <tr key={dev.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{dev.name}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{dev.vendor} ({dev.model})</td>
                  <td className="py-3 px-3 font-bold text-teal-700 dark:text-teal-400">{dev.type}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{dev.bedNumber}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{dev.protocol}</td>
                  <td className="py-3 px-3"><StatusBadge status={dev.status} type="quality" /></td>
                  <td className="py-3 px-3 font-bold">{dev.packetsPerMin} ppm</td>
                  <td className={`py-3 px-3 font-bold ${dev.errorRate > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {dev.errorRate}%
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{dev.lastMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
