import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types/icu';
import { Badge } from './ui/Badge';
import { Activity, UserCheck, Stethoscope, AlertTriangle } from 'lucide-react';

interface BedCardProps {
  patient: Patient;
  onSelect?: (patient: Patient) => void;
}

export const BedCard: React.FC<BedCardProps> = ({ patient, onSelect }) => {
  const navigate = useNavigate();

  const statusVariant =
    patient.status === 'CRITICAL' ? 'critical' : patient.status === 'WARNING' ? 'warning' : 'stable';

  const handleClick = () => {
    if (onSelect) {
      onSelect(patient);
    } else {
      navigate(`/patient/${patient.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border transition-all duration-150 cursor-pointer hover:shadow-md p-4 flex flex-col justify-between ${patient.status === 'CRITICAL'
          ? 'border-red-300 ring-1 ring-red-200 hover:border-red-400'
          : patient.status === 'WARNING'
            ? 'border-amber-300 hover:border-amber-400'
            : 'border-slate-200 hover:border-blue-300'
        }`}
    >
      <div>
        {/* Header: Bed Number & Status */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {patient.bedNumber}
            </span>
            <Badge variant={statusVariant} pulse={patient.status === 'CRITICAL'}>
              {patient.status}
            </Badge>
          </div>
          <Badge variant={patient.vitals.spo2.quality === 'LIVE' ? 'live' : 'stale'} pulse={patient.vitals.spo2.quality === 'LIVE'}>
            {patient.vitals.spo2.quality}
          </Badge>
        </div>

        {/* Patient Info */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{patient.name}</h4>
          <p className="text-xs text-slate-500 font-medium">
            {patient.age} yrs • {patient.gender} • MRN: <span className="font-mono text-slate-700">{patient.mrn.split('-')[1]}</span>
          </p>
          <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 italic">{patient.admittingDiagnosis}</p>
        </div>

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded border border-slate-100 text-center mb-3">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">HR</span>
            <span className={`text-xs font-bold ${Number(patient.vitals.hr.value) > 100 ? 'text-red-700' : 'text-slate-900'}`}>
              {patient.vitals.hr.value}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">BP (MAP)</span>
            <span className={`text-xs font-bold ${Number(patient.vitals.map.value) < 70 ? 'text-red-700' : 'text-slate-900'}`}>
              {patient.vitals.map.value}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">SpO2</span>
            <span className={`text-xs font-bold ${Number(patient.vitals.spo2.value) < 90 ? 'text-red-700 font-extrabold' : 'text-slate-900'}`}>
              {patient.vitals.spo2.value}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">RR</span>
            <span className="text-xs font-bold text-slate-900">{patient.vitals.rr.value}</span>
          </div>
        </div>
      </div>

      {/* Footer: Assigned Staff */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <Stethoscope className="w-3 h-3 text-blue-700 shrink-0" />
          <span className="truncate max-w-[100px]">{patient.assignedClinician.replace('Dr. ', '')}</span>
        </div>
        <div className="flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-emerald-700 shrink-0" />
          <span className="truncate max-w-[90px]">{patient.assignedNurse}</span>
        </div>
      </div>
    </div>
  );
};
