import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  User, 
  Hash, 
  FileText, 
  Bed, 
  Cpu, 
  Truck, 
  ArrowRight, 
  Clock,
  Activity,
  HeartPulse
} from 'lucide-react';

export type SearchCategory = 'ALL' | 'PATIENT' | 'MRN' | 'ENCOUNTER' | 'BED' | 'DEVICE' | 'TRANSFER';

interface SearchResultItem {
  id: string;
  type: 'PATIENT' | 'MRN' | 'ENCOUNTER' | 'BED' | 'DEVICE' | 'TRANSFER';
  title: string;
  subtitle: string;
  badge: string;
  path: string;
  tagColor: string;
  icon: React.ElementType;
}

interface GlobalOmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalOmniSearch: React.FC<GlobalOmniSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mock Clinical Data Base across the 6 specified entity scopes
  const searchIndex: SearchResultItem[] = [
    // Patients
    {
      id: 'P-1024',
      type: 'PATIENT',
      title: 'Rahul Sharma (42M)',
      subtitle: 'Diagnosis: Septic Shock / Acute Resp Distress · Bed 04 · MICU-01',
      badge: 'CRITICAL',
      path: '/patient/P-1024',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: User
    },
    {
      id: 'P-1025',
      type: 'PATIENT',
      title: 'Pooja Verma (29F)',
      subtitle: 'Post-op Cardiac Bypass Day 2 · Bed 02 · CICU-01',
      badge: 'STABLE',
      path: '/patient/P-1025',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: User
    },
    {
      id: 'P-1026',
      type: 'PATIENT',
      title: 'Amitabh Sen (67M)',
      subtitle: 'Acute Traumatic Brain Injury (TBI) · Bed 08 · NICU-01',
      badge: 'HIGH ALERT',
      path: '/patient/P-1026',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: User
    },

    // MRN
    {
      id: 'MRN-2024-8849',
      type: 'MRN',
      title: 'MRN-2024-8849',
      subtitle: 'Patient: Rahul Sharma · Admitted 28-Sep 2026',
      badge: 'MRN RECORD',
      path: '/patient/P-1024',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Hash
    },
    {
      id: 'MRN-2024-9021',
      type: 'MRN',
      title: 'MRN-2024-9021',
      subtitle: 'Patient: Pooja Verma · Admitted 27-Sep 2026',
      badge: 'MRN RECORD',
      path: '/patient/P-1025',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Hash
    },

    // EncounterID
    {
      id: 'ENC-90821',
      type: 'ENCOUNTER',
      title: 'ENC-90821',
      subtitle: 'Episode: MICU Sepsis Protocol · Active Encounter · Attending: Dr. Verma',
      badge: 'ACTIVE EPISODE',
      path: '/patient/P-1024',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: FileText
    },
    {
      id: 'ENC-90835',
      type: 'ENCOUNTER',
      title: 'ENC-90835',
      subtitle: 'Episode: Post-OP Valve Replacement · Active Encounter',
      badge: 'ACTIVE EPISODE',
      path: '/patient/P-1025',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: FileText
    },

    // BedID
    {
      id: 'Bed 04',
      type: 'BED',
      title: 'Bed 04 (Pod A)',
      subtitle: 'Occupied: Rahul Sharma · Hamilton Vent + Philips Monitor Connected',
      badge: 'MICU-01',
      path: '/command-center',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: Bed
    },
    {
      id: 'Bed 07',
      type: 'BED',
      title: 'Bed 07 (Pod B)',
      subtitle: 'Status: Clean / Available for Incoming Patient Transfer',
      badge: 'EMPTY',
      path: '/icu-beds',
      tagColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      icon: Bed
    },

    // DeviceID
    {
      id: 'DEV-VENT-402',
      type: 'DEVICE',
      title: 'DEV-VENT-402 (Hamilton-G5)',
      subtitle: 'Ventilator Online · Telemetry Port 8042 · Bed 04 · Last Ping: 3s ago',
      badge: 'CONNECTED',
      path: '/devices',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: Cpu
    },
    {
      id: 'DEV-MON-108',
      type: 'DEVICE',
      title: 'DEV-MON-108 (Philips MX800)',
      subtitle: 'Multiparameter Patient Monitor · Bed 02 · 12-Lead ECG LIVE',
      badge: 'CONNECTED',
      path: '/devices',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: Cpu
    },

    // TransferID (Ambulance Transport)
    {
      id: 'TRF-77401',
      type: 'TRANSFER',
      title: 'TRF-77401 (ALS Ambulance #04)',
      subtitle: 'En route from Hajipur Referral Hospital · ETA 14 mins · Bed 07 Reserved',
      badge: 'ETA 14 MIN',
      path: '/ambulance',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Truck
    },
    {
      id: 'TRF-77409',
      type: 'TRANSFER',
      title: 'TRF-77409 (Neonatal Transport Van)',
      subtitle: 'Pre-arrival alert triggered · Inbound to NICU · SpO2 91%',
      badge: 'PRE-ARRIVAL',
      path: '/ambulance',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: Truck
    }
  ];

  // Filtering
  const filteredResults = searchIndex.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.type === activeCategory;
    if (!matchesCategory) return false;

    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-950/80">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Patient | MRN | EncounterID | BedID | DeviceID | TransferID..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* 6 Category Pills specified in PART 1 */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-mono font-bold">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">FILTER:</span>
          {(['ALL', 'PATIENT', 'MRN', 'ENCOUNTER', 'BED', 'DEVICE', 'TRANSFER'] as SearchCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-teal-700 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              No clinical records found matching "{query}"
            </div>
          ) : (
            filteredResults.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id + item.type}
                  onClick={() => handleSelect(item)}
                  className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black border ${item.tagColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Select record to navigate & update global context</span>
          <span>Press ↵ to open</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalOmniSearch;
