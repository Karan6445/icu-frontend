import React, { useState } from 'react';
import { Cpu, Wifi, WifiOff, Search, Activity, Server, Radio, Video, Plus } from 'lucide-react';
import { MOCK_DEVICES } from '../data/mockData';
import { PtzCameraConfigModal } from '../components/camera/PtzCameraConfigModal';

export const DevicesPage: React.FC = () => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPtzModalOpen, setIsPtzModalOpen] = useState(false);

  const filteredDevices = MOCK_DEVICES.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.gatewayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || d.type === filterType;
    return matchesSearch && matchesType;
  });

  const onlineCount = MOCK_DEVICES.filter(d => d.status === 'LIVE').length;
  const totalCount = MOCK_DEVICES.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
              ICU Medical Devices & Gateway Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Biomedical device connectivity tracking, gateway routing, serial telemetry verification, and PTZ camera registry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-300">
            {onlineCount} / {totalCount} Devices Online
          </span>

          <button
            onClick={() => setIsPtzModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4 text-teal-300" />
            <span>+ Add / Configure PTZ Camera</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device name, vendor, model, gateway, bed..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType('MONITOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'MONITOR' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Monitors
          </button>
          <button
            onClick={() => setFilterType('VENTILATOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'VENTILATOR' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Ventilators
          </button>
          <button
            onClick={() => setFilterType('INFUSION_PUMP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'INFUSION_PUMP' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Infusion Pumps
          </button>
        </div>
      </div>

      {/* Device Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const isOnline = device.status === 'LIVE';
          return (
            <div
              key={device.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                  {device.bedNumber} • {device.id}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                }`}>
                  {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
                  {device.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">{device.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{device.vendor} — {device.model}</p>
              </div>

              <div className="space-y-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gateway:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{device.gatewayId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{device.ipAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Protocol:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{device.protocol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Latency:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{device.latencyMs} ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Telemetry:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{device.lastMessage}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PTZ Camera Configuration Modal */}
      <PtzCameraConfigModal
        isOpen={isPtzModalOpen}
        onClose={() => setIsPtzModalOpen(false)}
      />
    </div>
  );
};

export default DevicesPage;
