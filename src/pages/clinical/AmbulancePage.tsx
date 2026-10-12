import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Bed, 
  User, 
  Activity, 
  Heart, 
  Search, 
  CheckCircle2, 
  Radio, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send
} from 'lucide-react';

interface AmbulanceTrip {
  transferId: string;
  ambulanceUnit: string;
  ambulanceType: 'ALS' | 'BLS' | 'NEONATAL';
  patientName: string;
  age: number;
  gender: string;
  encounterId: string;
  referringFacility: string;
  destinationIcu: string;
  reservedBed: string;
  etaMinutes: number;
  chiefComplaint: string;
  vitals: { hr: number; spo2: number; bp: string; gcs: number };
  status: 'IN_TRANSIT' | 'PRE_ARRIVAL_ALERT' | 'DISPATCHED' | 'ARRIVED';
  gpsCoords: { lat: number; lng: number };
  paramedic: string;
}

export const AmbulancePage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<AmbulanceTrip | null>(null);

  const [trips, setTrips] = useState<AmbulanceTrip[]>([
    {
      transferId: 'TRF-77401',
      ambulanceUnit: 'ALS Ambulance #04 (BR-01-PA-9901)',
      ambulanceType: 'ALS',
      patientName: 'Rameshwar Rai',
      age: 58,
      gender: 'M',
      encounterId: 'ENC-90840',
      referringFacility: 'Sadar Hospital Hajipur',
      destinationIcu: 'MICU-01',
      reservedBed: 'BED-07',
      etaMinutes: 14,
      chiefComplaint: 'Acute Pulmonary Edema / Post Myocardial Infarction',
      vitals: { hr: 112, spo2: 89, bp: '168/102', gcs: 14 },
      status: 'PRE_ARRIVAL_ALERT',
      gpsCoords: { lat: 25.612, lng: 85.144 },
      paramedic: 'EMT S. Pandey'
    },
    {
      transferId: 'TRF-77402',
      ambulanceUnit: 'Neonatal Critical Transport #02',
      ambulanceType: 'NEONATAL',
      patientName: 'Baby of Kavita Devi',
      age: 0,
      gender: 'F',
      encounterId: 'ENC-90841',
      referringFacility: 'Darbhanga Medical College Hospital',
      destinationIcu: 'NICU-01',
      reservedBed: 'BED-03 (Incubator)',
      etaMinutes: 38,
      chiefComplaint: 'Preterm 29 Weeks / Severe Respiratory Distress Syndrome',
      vitals: { hr: 154, spo2: 92, bp: '58/34', gcs: 10 },
      status: 'IN_TRANSIT',
      gpsCoords: { lat: 25.750, lng: 85.320 },
      paramedic: 'EMT N. Akhtar'
    },
    {
      transferId: 'TRF-77395',
      ambulanceUnit: 'ALS Ambulance #01 (BR-01-GA-1102)',
      ambulanceType: 'ALS',
      patientName: 'Deepak Choudhary',
      age: 34,
      gender: 'M',
      encounterId: 'ENC-90838',
      referringFacility: 'PMCH Emergency Triage',
      destinationIcu: 'SICU-01',
      reservedBed: 'BED-01',
      etaMinutes: 4,
      chiefComplaint: 'Polytrauma / Hemoperitoneum post RTA',
      vitals: { hr: 128, spo2: 94, bp: '90/58', gcs: 11 },
      status: 'PRE_ARRIVAL_ALERT',
      gpsCoords: { lat: 25.620, lng: 85.155 },
      paramedic: 'EMT K. Sharma'
    }
  ]);

  const handleAcknowledgeAlert = (transferId: string) => {
    setTrips(prev => prev.map(t => t.transferId === transferId ? { ...t, status: 'IN_TRANSIT' } : t));
    alert(`Transfer ${transferId} pre-arrival alert acknowledged. Bed reservation and trauma bay team notified.`);
  };

  const filteredTrips = trips.filter(t => {
    if (filterStatus === 'PRE_ARRIVAL' && t.status !== 'PRE_ARRIVAL_ALERT') return false;
    if (filterStatus === 'IN_TRANSIT' && t.status !== 'IN_TRANSIT') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.transferId.toLowerCase().includes(q) ||
        t.patientName.toLowerCase().includes(q) ||
        t.ambulanceUnit.toLowerCase().includes(q) ||
        t.referringFacility.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 19: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-900 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 uppercase tracking-widest">
              SCREEN 19
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Emergency Medical Transport Network · Bihar Statewide Fleet
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Ambulance Telemetry & Pre-Arrival Command Center</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Realtime GPS geolocation, in-transit continuous telemetry, bed reservation & handover bridge.
          </p>
        </div>

        {/* Fleet Metrics */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">ACTIVE TRANSFERS</span>
            <span className="text-base font-black text-teal-700 dark:text-teal-400">{trips.length} EN ROUTE</span>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800/80">
            <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-bold">PRE-ARRIVAL ALERTS</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-300">
              {trips.filter(t => t.status === 'PRE_ARRIVAL_ALERT').length} CRITICAL
            </span>
          </div>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold shadow-2xs">
          {['ALL', 'PRE_ARRIVAL', 'IN_TRANSIT'].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === f
                  ? 'bg-rose-600 text-white font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search TransferID, ambulance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-slate-900 dark:text-white w-52 sm:w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* PRIMARY LAYOUT: Map + Active Trips List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Live GPS Route Map Simulation */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
              <span className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                LIVE GPS TELEMETRY RADAR
              </span>
              <span className="text-slate-500 text-[10px]">Refresh: 1s</span>
            </div>

            {/* Simulated Vector Map */}
            <div className="mt-3 aspect-4/3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex items-center justify-center">
              {/* Grid Roads Overlay */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, #0F766E 1px, transparent 1px), linear-gradient(to bottom, #0F766E 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Central Receiving Hospital Pin (Patna) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-500/20 border border-teal-500 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shadow-md animate-pulse">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-[9px] font-mono text-teal-800 dark:text-teal-300 font-bold mt-1 bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-2xs">
                  PMCH PATNA HUB
                </span>
              </div>

              {/* Inbound Ambulance Pins */}
              <div className="absolute top-1/4 left-1/3 flex flex-col items-center animate-bounce duration-1000">
                <div className="w-6 h-6 rounded-full bg-rose-600 border border-white text-white flex items-center justify-center shadow-lg">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-mono text-rose-700 dark:text-rose-300 font-bold bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-rose-200 dark:border-slate-800 shadow-2xs">
                  TRF-77401 (14m)
                </span>
              </div>

              <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-amber-500 border border-white text-white flex items-center justify-center shadow-lg">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-mono text-amber-700 dark:text-amber-300 font-bold bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-amber-200 dark:border-slate-800 shadow-2xs">
                  TRF-77402 (38m)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Traffic Corridor:</span>
              <strong className="text-emerald-700 dark:text-emerald-400">Green Corridor Active</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Receiving Bed Protocol:</span>
              <strong className="text-slate-900 dark:text-white">Autobooked on Dispatch</strong>
            </div>
          </div>
        </div>

        {/* Right Columns: Active Trips List (TransferID + ETA + bed reservation) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTrips.map(trip => (
            <div
              key={trip.transferId}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all duration-200 ${
                trip.status === 'PRE_ARRIVAL_ALERT'
                  ? 'border-rose-300 dark:border-rose-700/80 hover:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500'
              }`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      {trip.transferId}
                    </span>
                    <span className="text-[10px] font-mono bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-slate-700 font-bold">
                      {trip.ambulanceType}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {trip.ambulanceUnit}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                    {trip.patientName} ({trip.age}y/{trip.gender})
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block">
                    Origin: {trip.referringFacility} → Target: <strong className="text-slate-800 dark:text-white">{trip.destinationIcu}</strong>
                  </span>
                </div>

                {/* ETA Countdown Badge */}
                <div className="text-right font-mono">
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>ETA {trip.etaMinutes} MIN</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 block mt-1">
                    Reserved: {trip.reservedBed}
                  </span>
                </div>
              </div>

              {/* In-Transit Vitals & Chief Complaint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                    CHIEF COMPLAINT / EN ROUTE NOTES
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium font-sans leading-relaxed">
                    {trip.chiefComplaint}
                  </p>
                  <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 block mt-1">
                    Paramedic: {trip.paramedic}
                  </span>
                </div>

                {/* Vitals Telemetry Matrix */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-center">
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 uppercase font-bold block mb-1">
                    IN-TRANSIT LIVE TELEMETRY
                  </span>
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    <div>
                      <span className="text-[8px] text-slate-500 block">HR</span>
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">{trip.vitals.hr}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block">SpO2</span>
                      <span className="text-base font-black text-sky-600 dark:text-sky-400">{trip.vitals.spo2}%</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block">BP</span>
                      <span className="text-xs font-black text-purple-700 dark:text-purple-300 mt-1 block">{trip.vitals.bp}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block">GCS</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{trip.vitals.gcs}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar: Open | Acknowledge | Escalate | Bed reservation */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Encounter: <strong className="text-slate-700 dark:text-slate-200">{trip.encounterId}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {trip.status === 'PRE_ARRIVAL_ALERT' && (
                    <button
                      onClick={() => handleAcknowledgeAlert(trip.transferId)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs"
                    >
                      Acknowledge Pre-Arrival
                    </button>
                  )}
                  <button
                    onClick={() => alert(`Receiving bed ${trip.reservedBed} confirmed locked for ${trip.patientName}.`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700"
                  >
                    Confirm Bed {trip.reservedBed}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AmbulancePage;
