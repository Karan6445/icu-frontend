import React, { useState } from 'react';
import { X, Bed, Stethoscope, HeartPulse, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { assignBedAndStaff, PatientRecord } from '../../store/slices/patientSlice';

interface PatientBedStaffAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
}

export const PatientBedStaffAssignmentModal: React.FC<PatientBedStaffAssignmentModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const dispatch = useAppDispatch();

  // Mock list of doctors and nurses
  const doctorsList = [
    'Dr. Rahul Sharma (Senior Intensivist)',
    'Dr. Ananya Roy (Pulmonologist & Tele-ICU)',
    'Dr. Amit Kumar (Cardiothoracic Critical Care)',
    'Dr. Sunita Patel (Interventional Cardiology)',
    'Dr. Suresh Nair (Trauma Lead)'
  ];

  const nursesList = [
    'Nurse Priya Sharma (ICU Charge Nurse)',
    'Nurse Vikram Singh (Critical Care RN)',
    'Nurse Anjali Deshmukh (Nurse Practitioner)',
    'Nurse Sneha Rao (Cardiac ICU Nurse)',
    'Nurse Meera Nair (Staff Nurse)'
  ];

  const bedsList = [
    { bed: 'BED-01', unit: 'Medical ICU' },
    { bed: 'BED-02', unit: 'Surgical ICU' },
    { bed: 'BED-03', unit: 'Medical ICU' },
    { bed: 'BED-04', unit: 'Cardiac ICU' },
    { bed: 'BED-05', unit: 'Medical ICU' },
    { bed: 'BED-07', unit: 'Medical ICU' },
    { bed: 'BED-12', unit: 'Cardiac ICU' }
  ];

  const [selectedBed, setSelectedBed] = useState(patient?.bedNumber || 'BED-07');
  const [selectedUnit, setSelectedUnit] = useState(patient?.unitName || 'Medical ICU');
  const [selectedDoctor, setSelectedDoctor] = useState(patient?.assignedClinician || doctorsList[0]);
  const [selectedNurse, setSelectedNurse] = useState(patient?.assignedNurse || nursesList[0]);

  React.useEffect(() => {
    if (patient) {
      setSelectedBed(patient.bedNumber || 'BED-07');
      setSelectedUnit(patient.unitName || 'Medical ICU');
      setSelectedDoctor(patient.assignedClinician || doctorsList[0]);
      setSelectedNurse(patient.assignedNurse || nursesList[0]);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(
      assignBedAndStaff({
        patientId: patient.id,
        bedNumber: selectedBed,
        unitName: selectedUnit,
        doctorName: selectedDoctor,
        nurseName: selectedNurse
      })
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bed & Staff Assignment</h2>
              <p className="text-xs text-slate-300 font-mono">
                Patient: {patient.name} ({patient.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Bed & Unit Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-teal-600" />
              <span>ICU Bed Assignment</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block mb-1">Bed Number</span>
                <select
                  value={selectedBed}
                  onChange={(e) => setSelectedBed(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                >
                  {bedsList.map((b) => (
                    <option key={b.bed} value={b.bed}>
                      {b.bed} ({b.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-mono block mb-1">Unit Name</span>
                <input
                  type="text"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Doctor Assignment */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Attending Doctor Assignment</span>
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans"
            >
              {doctorsList.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Nurse Assignment */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>Assigned Bedside Nurse</span>
            </label>
            <select
              value={selectedNurse}
              onChange={(e) => setSelectedNurse(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans"
            >
              {nursesList.map((nurse) => (
                <option key={nurse} value={nurse}>
                  {nurse}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
