import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ExternalLink, 
  Maximize2, 
  ShieldCheck, 
  Eye, 
  X, 
  Layers, 
  Sliders, 
  Download,
  AlertTriangle,
  Clock,
  Camera
} from 'lucide-react';

interface ImagingStudy {
  accession: string;
  studyUid: string;
  modality: 'CR' | 'CT' | 'MR' | 'US';
  title: string;
  bodyPart: string;
  date: string;
  instancesCount: number;
  reportStatus: 'FINAL' | 'PRELIMINARY';
  critical: boolean;
  radiologist: string;
  impression: string;
  series: { seriesUid: string; description: string; count: number }[];
}

export const ImagingPage: React.FC = () => {
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudy, setActiveStudy] = useState<ImagingStudy | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerTokenTime, setViewerTokenTime] = useState(890); // 15 min token countdown

  const studies: ImagingStudy[] = [
    {
      accession: 'ACC-2026-90412',
      studyUid: '1.2.840.10008.5.1.4.1.1.2.90412',
      modality: 'CR',
      title: 'Chest Portable 1 View (AP)',
      bodyPart: 'CHEST',
      date: '29-Sep-2026 07:15',
      instancesCount: 1,
      reportStatus: 'FINAL',
      critical: true,
      radiologist: 'Dr. S. K. Mukherjee (Senior Radiologist)',
      impression: 'Bilateral diffuse alveolar infiltrates consistent with ARDS. Endotracheal tube tip is 3.5cm above the carina. Right internal jugular CVC tip at cavoatrial junction.',
      series: [
        { seriesUid: 'SERIES-01', description: 'Chest AP Supine', count: 1 }
      ]
    },
    {
      accession: 'ACC-2026-88190',
      studyUid: '1.2.840.10008.5.1.4.1.1.2.88190',
      modality: 'CT',
      title: 'CT Pulmonary Angiography (CTPA)',
      bodyPart: 'CHEST',
      date: '28-Sep-2026 16:40',
      instancesCount: 420,
      reportStatus: 'FINAL',
      critical: false,
      radiologist: 'Dr. Neha Kapoor (Consultant Radiologist)',
      impression: 'No evidence of central or segmental pulmonary embolism. Extensive bilateral dependent consolidations and ground-glass attenuation.',
      series: [
        { seriesUid: 'SERIES-CT-01', description: 'Scout Topogram', count: 2 },
        { seriesUid: 'SERIES-CT-02', description: 'Angio Thin 0.75mm', count: 320 },
        { seriesUid: 'SERIES-CT-03', description: 'Lung Window Reconstruction', count: 98 }
      ]
    },
    {
      accession: 'ACC-2026-87941',
      studyUid: '1.2.840.10008.5.1.4.1.1.2.87941',
      modality: 'US',
      title: 'Point of Care Echocardiography (POCUS)',
      bodyPart: 'CARDIAC',
      date: '28-Sep-2026 14:10',
      instancesCount: 18,
      reportStatus: 'FINAL',
      critical: false,
      radiologist: 'Dr. Anand Verma (Intensivist bedside)',
      impression: 'Preserved LV ejection fraction (~55%). Inferior vena cava plethoric with minimal respiratory variation, indicating volume overload or elevated CVP.',
      series: [
        { seriesUid: 'SERIES-US-01', description: 'Parasternal Long & Short Axis', count: 8 },
        { seriesUid: 'SERIES-US-02', description: 'Apical 4 Chamber + Subcostal IVC', count: 10 }
      ]
    },
    {
      accession: 'ACC-2026-86104',
      studyUid: '1.2.840.10008.5.1.4.1.1.2.86104',
      modality: 'MR',
      title: 'Brain MRI with Diffusion & FLAIR',
      bodyPart: 'BRAIN',
      date: '26-Sep-2026 19:20',
      instancesCount: 180,
      reportStatus: 'FINAL',
      critical: false,
      radiologist: 'Dr. S. K. Mukherjee',
      impression: 'No acute territorial infarction or intracranial hemorrhage. Mild periventricular microvascular ischemic changes.',
      series: [
        { seriesUid: 'SERIES-MR-01', description: 'T1 Axial', count: 45 },
        { seriesUid: 'SERIES-MR-02', description: 'T2 FLAIR Axial', count: 45 },
        { seriesUid: 'SERIES-MR-03', description: 'DWI / ADC B1000', count: 90 }
      ]
    }
  ];

  const filteredStudies = studies.filter(s => {
    if (modalityFilter !== 'ALL' && s.modality !== modalityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.accession.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.impression.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenViewer = (study: ImagingStudy) => {
    setActiveStudy(study);
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 10: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-800 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 10
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              DICOM 3.0 PACS Gateway · Encounter ENC-90821
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Diagnostic Imaging & DICOM PACS Viewer</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Encrypted zero-footprint web viewer, short-lived tokens, multi-series stack navigation & radiologist reports.
          </p>
        </div>

        {/* TOOLBAR (Date; modality; report status) */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Modality Chips */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {['ALL', 'CR', 'CT', 'MR', 'US'].map(mod => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  modalityFilter === mod
                    ? 'bg-teal-700 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Accession, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-600 text-slate-900 dark:text-white w-48 sm:w-56 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* STUDIES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudies.map((study) => (
          <div
            key={study.accession}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-500 transition-all duration-200 group flex flex-col justify-between text-slate-800 dark:text-slate-100"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-black text-xs border ${
                    study.modality === 'CR' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40' :
                    study.modality === 'CT' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40' :
                    study.modality === 'MR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40' :
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  }`}>
                    {study.modality}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {study.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                      {study.accession} · {study.date}
                    </span>
                  </div>
                </div>

                {study.critical && (
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 font-mono text-[10px] font-black animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> CRITICAL FINDING
                  </span>
                )}
              </div>

              {/* Radiologist Impression */}
              <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">
                  RADIOLOGY REPORT IMPRESSION ({study.reportStatus})
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans">{study.impression}</p>
                <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 block pt-1 font-bold">
                  Reported by: {study.radiologist}
                </span>
              </div>

              {/* Series Breakdown */}
              <div className="space-y-1 font-mono text-[11px]">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">DICOM SERIES ({study.series.length})</span>
                {study.series.map(s => (
                  <div key={s.seriesUid} className="flex items-center justify-between text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/60 px-2 py-1 rounded border border-slate-100 dark:border-transparent">
                    <span>{s.description}</span>
                    <span className="text-teal-700 dark:text-teal-300 font-bold">{s.count} images</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">
                {study.instancesCount} Total DICOM Objects
              </span>
              <button
                onClick={() => handleOpenViewer(study)}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Launch PACS Viewer</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SECURE DICOM VIEWER MODAL */}
      {isViewerOpen && activeStudy && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in zoom-in-95 duration-150">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
            {/* Viewer Header */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-teal-400 font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AUTHENTICATED DICOM VIEWER
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-white font-bold">{activeStudy.title} ({activeStudy.accession})</span>
                <span className="text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 text-[10px]">
                  Token TTL: 14m 50s
                </span>
              </div>
              <button
                onClick={() => setIsViewerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Toolbar */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">WW/WL: Lung</button>
                <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">WW/WL: Mediastinum</button>
                <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Invert</button>
                <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Caliper (Measure)</button>
              </div>
              <div className="text-slate-400 text-[11px]">
                Zoom: 100% · Matrix: 2048 x 2048 · 16-bit Grayscale
              </div>
            </div>

            {/* Image Canvas Simulation */}
            <div className="flex-1 bg-black flex items-center justify-center relative p-4 overflow-hidden">
              <div className="w-full max-w-lg aspect-square bg-slate-950 border border-slate-800 rounded-xl relative flex items-center justify-center text-slate-600 font-mono text-xs overflow-hidden shadow-inner">
                {/* Simulated X-Ray image layout */}
                <div className="text-center space-y-2 p-6">
                  <div className="w-32 h-44 border-2 border-slate-700 rounded-3xl mx-auto relative flex items-center justify-center bg-radial-at-c from-slate-800/80 to-slate-950">
                    <span className="text-[10px] text-teal-400/80">SIMULATED CHEST MATRIX</span>
                    {/* Simulated ETT Line */}
                    <div className="absolute top-2 w-0.5 h-16 bg-cyan-400/80 animate-pulse" />
                  </div>
                  <span className="block text-slate-400 font-bold">{activeStudy.title}</span>
                  <span className="block text-[10px] text-slate-500">StudyUID: {activeStudy.studyUid}</span>
                </div>

                {/* DICOM OSD Overlays */}
                <div className="absolute top-3 left-3 text-[10px] font-mono text-teal-300 space-y-0.5">
                  <p className="font-bold">Rahul Sharma (42M)</p>
                  <p className="text-slate-400">MRN: MRN-8849201</p>
                  <p className="text-slate-400">{activeStudy.date}</p>
                </div>

                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-teal-300 text-right space-y-0.5">
                  <p>KVP: 120 · mA: 320</p>
                  <p>W: 1500 L: -600</p>
                  <p>Lossless PACS Direct</p>
                </div>
              </div>
            </div>

            {/* Viewer Footer Report */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 font-sans flex items-center justify-between">
              <p className="truncate max-w-3xl">
                <strong className="text-white font-mono">Impression:</strong> {activeStudy.impression}
              </p>
              <button
                onClick={() => alert('DICOM audit trail updated: IMAGING_VIEWER log generated.')}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs hover:text-white"
              >
                Log Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagingPage;
