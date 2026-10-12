import React, { useState } from 'react';
import { X, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { addHospital } from '../../store/slices/superAdminSlice';
import { createHospital } from '../../store/slices/hospitalSlice';
import { hospitalApi } from '../../api/hospitalApi';

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDistrict?: string;
}

const BIHAR_DISTRICTS = [
  'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Rohtas', 'Baran',
  'Saran (Chhapra)', 'Samastipur', 'Begusarai', 'Vaishali (Hajipur)', 'East Champaran',
  'West Champaran', 'Katihar', 'Saharsa', 'Madhepura', 'Munger', 'Nalanda (Bihar Sharif)',
  'Bhojpur (Ara)', 'Buxar', 'Siwan', 'Gopalganj', 'Sitamarhi', 'Madhubani', 'Araria',
  'Kishanganj', 'Supaul', 'Banka', 'Jamui', 'Lakhisarai', 'Sheikhpura', 'Nawada',
  'Aurangabad', 'Jehanabad', 'Arwal', 'Kaimur (Bhabua)', 'Khagaria'
];

export const AddHospitalModal: React.FC<AddHospitalModalProps> = ({
  isOpen,
  onClose,
  defaultDistrict = 'Patna'
}) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [district, setDistrict] = useState(defaultDistrict);
  const [category, setCategory] = useState<'Apex Medical College' | 'District Hospital' | 'Sub-Divisional Hospital' | 'Private Super Speciality'>('Apex Medical College');
  const [totalBeds, setTotalBeds] = useState('120');
  const [totalICUBeds, setTotalICUBeds] = useState('24');
  const [directorName, setDirectorName] = useState('');
  const [phone, setPhone] = useState('+91 612 2300100');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const numTotalBeds = parseInt(totalBeds, 10) || 0;
    const numICUBeds = parseInt(totalICUBeds, 10) || 0;

    if (numTotalBeds <= 0 || numICUBeds <= 0) return;

    const generatedCode = code.toUpperCase().trim();
    const availableICUBeds = Math.floor(numICUBeds * 0.4);

    setIsSubmitting(true);
    setApiError(null);

    try {
      // 1. Post to live backend: POST /api/v1/hospitals
      const apiRes = await hospitalApi.create({
        name: name.trim(),
        code: generatedCode,
        organization_id: 'e1111111-1111-1111-1111-111111111111',
        timezone: 'UTC',
        country_code: 'IND',
        address: {
          city: district,
          state: 'Bihar',
          street: `${district} Healthcare Hub, Main Highway`,
        },
        contact_phone: phone.trim(),
        is_command_center_enabled: true,
      });

      const registeredHosp = apiRes.data;

      // 2. Dispatch to Super Admin Slice
      dispatch(
        addHospital({
          name: registeredHosp.name || name.trim(),
          code: registeredHosp.code || generatedCode,
          district: district,
          state: 'Bihar',
          type: 'Super Specialty Center',
          address: `${district} Healthcare Hub, Main Highway`,
          contactNumber: phone.trim(),
          email: `contact@${generatedCode.toLowerCase()}.smarticu.org`,
          totalBeds: numTotalBeds,
          occupiedBeds: Math.floor(numTotalBeds * 0.7),
          availableBeds: Math.ceil(numTotalBeds * 0.3),
          totalICUBeds: numICUBeds,
          availableICUBeds: availableICUBeds,
          occupiedICUBeds: numICUBeds - availableICUBeds,
          reservedICUBeds: 2,
          maintenanceICUBeds: 1,
          doctorsCount: 18,
          nursesCount: 42,
          patientsCount: numICUBeds - availableICUBeds,
          status: 'Active'
        })
      );

      // 3. Dispatch to hospitalSlice for local hospital management
      dispatch(
        createHospital({
          name: registeredHosp.name || name.trim(),
          code: registeredHosp.code || generatedCode,
          city: district,
          state: 'Bihar',
          totalBeds: numTotalBeds,
          status: 'ACTIVE',
          units: ['MICU-01', 'SICU-01', 'CCU-01']
        })
      );

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        setName('');
        setCode('');
        setTotalBeds('120');
        setTotalICUBeds('24');
        setPhone('+91 612 2300100');
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('[AddHospitalModal] Failed to register hospital:', err);
      setApiError(err?.message || 'Failed to register hospital facility on backend.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-teal-500/30 shadow-2xl overflow-hidden font-sans space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0F766E] to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 text-teal-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-sans flex items-center gap-2">
                Add New Hospital Network Node
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-teal-400 text-slate-950">
                  COMMAND CENTER
                </span>
              </h2>
              <p className="text-xs text-teal-100 font-mono">
                Provision new hospital ICU grid & district telemetry nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {apiError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 font-bold flex items-center gap-2 animate-in slide-in-from-top">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in slide-in-from-top">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Hospital Node "{name}" successfully provisioned & added to State Telemetry Network!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hospital Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Hospital Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AIIMS Patna Super Speciality Hospital"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Hospital Code */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Hospital Node Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. AIIMS-PAT-01"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
              />
            </div>

            {/* District Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Assigned District (38 Bihar Districts) <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {BIHAR_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Hospital Tier / Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Apex Medical College">Apex Medical College</option>
                <option value="District Hospital">District Hospital</option>
                <option value="Sub-Divisional Hospital">Sub-Divisional Hospital</option>
                <option value="Private Super Speciality">Private Super Speciality</option>
              </select>
            </div>

            {/* Total General Beds */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Total Hospital Beds <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={totalBeds}
                onChange={(e) => setTotalBeds(e.target.value.replace(/\D/g, ''))}
                placeholder="120"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Total ICU Beds */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Total ICU Telemetry Beds <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={totalICUBeds}
                onChange={(e) => setTotalICUBeds(e.target.value.replace(/\D/g, ''))}
                placeholder="24"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-teal-500/50 rounded-xl text-teal-700 dark:text-teal-400 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Director / Medical Superintendent */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Medical Director / Superintendent Name
              </label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Kumar (MS)"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Emergency Phone Contact */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Emergency ICU Hotline Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 612 2300100"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess || isSubmitting}
              className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Registering on Backend...' : 'Provision & Register Hospital Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
