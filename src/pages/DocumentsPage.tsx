import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  CheckCircle2, 
  Filter, 
  Upload, 
  Star, 
  FileSpreadsheet, 
  FileCode, 
  Folder, 
  MoreVertical, 
  Plus, 
  X, 
  LayoutGrid, 
  Table as TableIcon, 
  Clock, 
  User, 
  Tag, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export type DocCategory = 'Clinical SOPs' | 'Ventilator Protocols' | 'Infection Control' | 'Pharmacology & Dosing' | 'Audit Evidence' | 'Equipment Manuals';
export type FileExtension = 'PDF' | 'DOCX' | 'XLSX' | 'PNG';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocCategory;
  extension: FileExtension;
  fileSize: string;
  version: string;
  author: string;
  reviewDate: string;
  lastModified: string;
  status: 'Approved' | 'Under Review' | 'Draft';
  starred?: boolean;
  downloadsCount: number;
  tags: string[];
}

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'SOP-2026-102',
    title: 'ICU Vasopressor & Inotrope Administration SOP',
    category: 'Pharmacology & Dosing',
    extension: 'PDF',
    fileSize: '2.4 MB',
    version: 'v4.2',
    author: 'Dr. Rahul Sharma',
    reviewDate: '30 Nov 2026',
    lastModified: '2026-09-15',
    status: 'Approved',
    starred: true,
    downloadsCount: 142,
    tags: ['Norepinephrine', 'Vasopressors', 'Smart Pump', 'ICU Dosing']
  },
  {
    id: 'PRO-2026-088',
    title: 'Hamilton C6 & Servo-u Ventilator Weaning Protocol',
    category: 'Ventilator Protocols',
    extension: 'PDF',
    fileSize: '3.8 MB',
    version: 'v2.1',
    author: 'Dr. Ananya Roy',
    reviewDate: '20 Sep 2026',
    lastModified: '2026-09-12',
    status: 'Under Review',
    starred: true,
    downloadsCount: 98,
    tags: ['Ventilator', 'SBT Weaning', 'PRVC Mode', 'Ppeak']
  },
  {
    id: 'EVD-2026-031',
    title: 'Central Line CLABSI Prevention Bundle Evidence Package',
    category: 'Infection Control',
    extension: 'DOCX',
    fileSize: '1.9 MB',
    version: 'v1.0',
    author: 'Infection Control Committee',
    reviewDate: '15 Dec 2026',
    lastModified: '2026-09-10',
    status: 'Approved',
    starred: false,
    downloadsCount: 64,
    tags: ['CLABSI', 'CVC Dressing', 'Subclavian', 'Aseptic']
  },
  {
    id: 'SOP-2026-077',
    title: 'Hand Hygiene & Contact Precaution Standard Manual',
    category: 'Infection Control',
    extension: 'PDF',
    fileSize: '5.1 MB',
    version: 'v6.0',
    author: 'Dr. Ananya Roy',
    reviewDate: '15 Jan 2027',
    lastModified: '2026-09-08',
    status: 'Approved',
    starred: false,
    downloadsCount: 210,
    tags: ['Hand Hygiene', 'PPE', 'MRSA Isolation', 'Sterilization']
  },
  {
    id: 'AUD-2026-044',
    title: 'Q3 Biomedical Device Calibration Log & Certificate Matrix',
    category: 'Audit Evidence',
    extension: 'XLSX',
    fileSize: '840 KB',
    version: 'v1.4',
    author: 'Eng. Rajesh Vardhan',
    reviewDate: '01 Oct 2026',
    lastModified: '2026-09-17',
    status: 'Approved',
    starred: false,
    downloadsCount: 35,
    tags: ['Biomedical', 'Calibration', 'Defibrillator', 'Gateway']
  },
  {
    id: 'MAN-2026-012',
    title: 'Mindray BeneVision N22 Monitor Operations Manual',
    category: 'Equipment Manuals',
    extension: 'PDF',
    fileSize: '8.7 MB',
    version: 'v1.2',
    author: 'Mindray Medical Tech',
    reviewDate: '10 Dec 2026',
    lastModified: '2026-08-20',
    status: 'Approved',
    starred: false,
    downloadsCount: 52,
    tags: ['Mindray N22', 'ECG Monitor', 'SpO2 Lead', 'Telemetry']
  }
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS);
  const [filterCategory, setFilterCategory] = useState<DocCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentItem | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocCategory>('Clinical SOPs');
  const [newExtension, setNewExtension] = useState<FileExtension>('PDF');
  const [newVersion, setNewVersion] = useState('v1.0');
  const [newAuthor, setNewAuthor] = useState('Dr. Rahul Sharma');
  const [newTagInput, setNewTagInput] = useState('ICU Protocol, Guideline');

  const toggleStar = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, starred: !d.starred } : d));
  };

  const filtered = documents.filter(doc => {
    if (filterCategory !== 'ALL' && doc.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchId = doc.id.toLowerCase().includes(q);
      const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
      const matchCat = doc.category.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchTags && !matchCat) return false;
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: DocumentItem = {
      id: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle || 'Uploaded ICU Clinical Document',
      category: newCategory,
      extension: newExtension,
      fileSize: `${(1 + Math.random() * 4).toFixed(1)} MB`,
      version: newVersion || 'v1.0',
      author: newAuthor,
      reviewDate: '30 Dec 2026',
      lastModified: new Date().toISOString().slice(0, 10),
      status: 'Approved',
      starred: false,
      downloadsCount: 1,
      tags: newTagInput.split(',').map(t => t.trim()).filter(Boolean)
    };

    setDocuments([created, ...documents]);
    setShowUploadModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
    setNewTitle('');
  };

  const getFileBadgeColor = (ext: FileExtension) => {
    switch (ext) {
      case 'PDF':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border-rose-200 dark:border-rose-900';
      case 'DOCX':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'XLSX':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'PNG':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border-purple-200 dark:border-purple-900';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Document Uploaded Successfully</h4>
            <p className="text-xs text-slate-300">
              File published to Google Drive style ICU repository.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                ICU Policy & Clinical SOP Document Drive
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Google Drive style card view • SOP repository • Controlled clinical versions • Category filters
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Filter Pills & Search Bar Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'ALL'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Docs ({documents.length})
          </button>
          <button
            onClick={() => setFilterCategory('Clinical SOPs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'Clinical SOPs'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Clinical SOPs
          </button>
          <button
            onClick={() => setFilterCategory('Ventilator Protocols')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'Ventilator Protocols'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Ventilator Protocols
          </button>
          <button
            onClick={() => setFilterCategory('Infection Control')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'Infection Control'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Infection Control
          </button>
          <button
            onClick={() => setFilterCategory('Pharmacology & Dosing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'Pharmacology & Dosing'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Pharmacology
          </button>
          <button
            onClick={() => setFilterCategory('Audit Evidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'Audit Evidence'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Audit Evidence
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, tags, SOPs..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Google Drive Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Table List View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View or Table View */}
      {viewMode === 'grid' ? (
        /* GOOGLE DRIVE STYLE CARDS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              No clinical documents match the search or category filter.
            </div>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Thumbnail Header Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border font-mono ${getFileBadgeColor(doc.extension)}`}>
                        {doc.extension}
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                        {doc.version}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleStar(doc.id)}
                      className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${doc.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {doc.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans mt-0.5 leading-snug group-hover:text-teal-500 transition-colors">
                      {doc.title}
                    </h3>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Info & Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>Size: {doc.fileSize}</div>
                    <div>Mod: {doc.lastModified}</div>
                  </div>

                  <button
                    onClick={() => setSelectedDocDetail(doc)}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Drive File</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <th className="py-4 px-6">Doc ID</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Document Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Version</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {doc.id}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${getFileBadgeColor(doc.extension)}`}>
                        {doc.extension}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {doc.title}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {doc.category}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 whitespace-nowrap">
                      {doc.version}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400 whitespace-nowrap">
                      {doc.fileSize}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDocDetail(doc)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <Upload className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                  Upload Clinical Document to Drive
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Drag & Drop Zone */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20 text-center space-y-2 cursor-pointer hover:bg-teal-50/50 transition-colors">
              <Upload className="w-8 h-8 text-teal-500 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drag and drop PDF, DOCX, or XLSX file here
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Maximum file size: 25MB • Automated virus & HIPAA scan active
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ICU Sepsis Resuscitation Guideline"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocCategory)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Clinical SOPs">Clinical SOPs</option>
                    <option value="Ventilator Protocols">Ventilator Protocols</option>
                    <option value="Infection Control">Infection Control</option>
                    <option value="Pharmacology & Dosing">Pharmacology & Dosing</option>
                    <option value="Audit Evidence">Audit Evidence</option>
                    <option value="Equipment Manuals">Equipment Manuals</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    File Type Extension
                  </label>
                  <select
                    value={newExtension}
                    onChange={(e) => setNewExtension(e.target.value as FileExtension)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="PDF">PDF (Portable Document)</option>
                    <option value="DOCX">DOCX (Word Document)</option>
                    <option value="XLSX">XLSX (Spreadsheet)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Version Code
                  </label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g. v1.0"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Author / Lead Clinician
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="e.g. Norepinephrine, Vasopressor, Dosing"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish to Drive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW DRAWER */}
      {selectedDocDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full h-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black border font-mono ${getFileBadgeColor(selectedDocDetail.extension)}`}>
                      {selectedDocDetail.extension}
                    </span>
                    <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                      {selectedDocDetail.version}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedDocDetail.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedDocDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Overview Card */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">Document ID: {selectedDocDetail.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {selectedDocDetail.status}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div>Author: <span className="font-bold text-white">{selectedDocDetail.author}</span></div>
                  <div>Category: <span className="font-bold text-teal-400">{selectedDocDetail.category}</span></div>
                  <div>File Size: <span className="font-mono font-bold text-white">{selectedDocDetail.fileSize}</span></div>
                  <div>Next Scheduled Review: <span className="font-mono font-bold text-white">{selectedDocDetail.reviewDate}</span></div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Indexed Search Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocDetail.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version Audit Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Version History & Read Audit Log
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">Version {selectedDocDetail.version}</span>
                    <span className="text-slate-400 font-mono">{selectedDocDetail.lastModified}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Reviewed and approved by Chief Medical Officer and ICU Quality Steering Committee.
                  </p>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-bold">
                    ✓ 100% Active ICU Staff Read Receipts Confirmed
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  alert(`Downloading ${selectedDocDetail.title} (${selectedDocDetail.fileSize})...`);
                }}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>

              <button
                onClick={() => setSelectedDocDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
