import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Building2,
  MapPin,
  Bed,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const HospitalReportsPage: React.FC = () => {
  const { districts, hospitals, icuBeds, doctors, nurses, patients } = useSelector(
    (state: RootState) => state.superAdmin
  );

  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('30days');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredHospitals = hospitals.filter(h => {
    if (districtFilter !== 'ALL' && h.district !== districtFilter) return false;
    if (hospitalFilter !== 'ALL' && h.id !== hospitalFilter) return false;
    return true;
  });

  const totalICUBeds = filteredHospitals.reduce((acc, h) => acc + h.totalICUBeds, 0);
  const occupiedICUBeds = filteredHospitals.reduce((acc, h) => acc + h.occupiedICUBeds, 0);
  const availableICUBeds = filteredHospitals.reduce((acc, h) => acc + h.availableICUBeds, 0);
  const occupancyRate = Math.round((occupiedICUBeds / (totalICUBeds || 1)) * 100);

  const handleExportCSV = () => {
    const csvRows = [
      ['Hospital Code', 'Hospital Name', 'District', 'Facility Type', 'Total ICU Beds', 'Occupied Beds', 'Available Beds', 'Status'].join(',')
    ];

    filteredHospitals.forEach(h => {
      csvRows.push(
        [
          `"${h.code}"`,
          `"${h.name}"`,
          `"${h.district}"`,
          `"${h.type}"`,
          h.totalICUBeds,
          h.occupiedICUBeds,
          h.availableICUBeds,
          `"${h.status}"`
        ].join(',')
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TamilNadu_ICU_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    setExportNotice('CSV Report downloaded successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl print:bg-white print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F766E]">
              Hospital Analytics & Reports Console
            </h1>
            <p className="text-xs text-slate-500 font-medium">Generate, print, and export compliance reports across 38 districts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <label className="text-xs text-slate-600 font-bold block mb-1">Select District</label>
          <select
            value={districtFilter}
            onChange={e => {
              setDistrictFilter(e.target.value);
              setHospitalFilter('ALL');
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All 38 Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-600 font-bold block mb-1">Select Hospital</label>
          <select
            value={hospitalFilter}
            onChange={e => setHospitalFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Hospitals</option>
            {hospitals
              .filter(h => districtFilter === 'ALL' || h.district === districtFilter)
              .map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-600 font-bold block mb-1">Date Timeframe</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="ytd">Year to Date (2026)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-semibold">Total Monitored Hospitals</span>
          <span className="text-2xl font-black text-slate-900 mt-1">{filteredHospitals.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-semibold">Total ICU Capacity</span>
          <span className="text-2xl font-black text-[#0F766E] mt-1">{totalICUBeds} Beds</span>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-700 block font-bold">Available ICU Beds</span>
          <span className="text-2xl font-black text-emerald-700 mt-1">{availableICUBeds}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-semibold">ICU Occupancy Rate</span>
          <span className="text-2xl font-black text-cyan-700 mt-1">{occupancyRate}%</span>
        </div>
      </div>

      {/* Detailed Hospital Table Report */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-4 px-6">Code & Hospital Name</th>
              <th className="py-4 px-6">District</th>
              <th className="py-4 px-6">Facility Type</th>
              <th className="py-4 px-6">ICU Beds (Tot/Avail)</th>
              <th className="py-4 px-6">Doctors</th>
              <th className="py-4 px-6">Nurses</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredHospitals.map(h => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="py-4 px-6">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-[#0F766E] rounded">
                    {h.code}
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-1">{h.name}</p>
                </td>
                <td className="py-4 px-6 text-slate-800 font-medium">{h.district}</td>
                <td className="py-4 px-6 text-slate-800 font-medium">{h.type}</td>
                <td className="py-4 px-6">
                  <span className="font-bold text-[#0F766E]">{h.totalICUBeds} Total</span>
                  <p className="text-[11px] text-emerald-700 font-bold">{h.availableICUBeds} Avail</p>
                </td>
                <td className="py-4 px-6 font-bold text-slate-900">{h.doctorsCount}</td>
                <td className="py-4 px-6 font-bold text-slate-900">{h.nursesCount}</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalReportsPage;
