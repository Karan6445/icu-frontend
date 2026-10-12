import React from 'react';
import { DeviceTopology } from '../../components/svg/DeviceTopology';
import { Cpu, Server, HardDrive, Cpu as Microchip } from 'lucide-react';

export const PlatformPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Device Interoperability Engine
        </span>
        <h1 className="text-4xl font-extrabold text-clinical-navy">Platform Architecture & Gateway Framework</h1>
        <p className="text-slate-600 text-sm">
          Decoupling bedside hardware from clinical software so hospital IT can connect mixed-vendor monitor fleets with zero UI disruption.
        </p>
      </div>

      <DeviceTopology />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <Microchip className="w-6 h-6 text-teal-600" />
          <h3 className="font-bold text-sm text-slate-900 font-sans">Multi-Vendor Adapters</h3>
          <p className="text-slate-600 font-sans">
            Built-in parsing modules for Mindray (HL7), Philips IntelliVue (MLLP), Hamilton (IEEE 11073), B. Braun Spaceplus (IHE PCD-01), and legacy Modbus serial output.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <Server className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 font-sans">Edge Gateway Isolation</h3>
          <p className="text-slate-600 font-sans">
            Edge gateway nodes run locally on hospital premises. If WAN internet connectivity drops, bedside data ingestion continues without data loss.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <HardDrive className="w-6 h-6 text-purple-600" />
          <h3 className="font-bold text-sm text-slate-900 font-sans">TimescaleDB Time-Series</h3>
          <p className="text-slate-600 font-sans">
            High-frequency waveform samples and vital sub-second metrics are stored in partitioned PostgreSQL + TimescaleDB for instant multi-hour trend rendering.
          </p>
        </div>
      </div>
    </div>
  );
};
