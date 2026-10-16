import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  HospitalDirectorRecord,
  HospitalAdminDoctorRecord,
  HospitalAdminNurseRecord,
  HospitalAdminShiftRecord,
  HospitalAdminICURecord,
  HospitalAdminBedRecord,
  PatientEncounterRecord,
  PatientClinicalRemarkRecord,
  PatientTimelineEventRecord,
  ReportDateFilter,
  HospitalAdminActivityLog,
  BedStatus,
  ShiftStatus
} from '../../types/hospitalAdmin';
import {
  ASSIGNED_HOSPITAL_ID,
  ASSIGNED_HOSPITAL_NAME,
  ASSIGNED_HOSPITAL_CODE,
  initialDirectorData,
  initialDoctorsData,
  initialNursesData,
  initialICUsData,
  initialBedsData,
  initialShiftsData,
  initialEncountersData,
  initialRemarksData,
  initialTimelineData,
  initialActivityLogsData
} from '../../data/hospitalAdminData';

export interface HospitalAdminState {
  assignedHospitalId: string;
  hospitalName: string;
  hospitalCode: string;
  director: HospitalDirectorRecord;
  doctors: HospitalAdminDoctorRecord[];
  nurses: HospitalAdminNurseRecord[];
  shifts: HospitalAdminShiftRecord[];
  icus: HospitalAdminICURecord[];
  beds: HospitalAdminBedRecord[];
  encounters: PatientEncounterRecord[];
  remarks: PatientClinicalRemarkRecord[];
  timelineEvents: PatientTimelineEventRecord[];
  dateFilter: ReportDateFilter;
  activityLogs: HospitalAdminActivityLog[];
}

const initialState: HospitalAdminState = {
  assignedHospitalId: ASSIGNED_HOSPITAL_ID,
  hospitalName: ASSIGNED_HOSPITAL_NAME,
  hospitalCode: ASSIGNED_HOSPITAL_CODE,
  director: initialDirectorData,
  doctors: initialDoctorsData,
  nurses: initialNursesData,
  shifts: initialShiftsData,
  icus: initialICUsData,
  beds: initialBedsData,
  encounters: initialEncountersData,
  remarks: initialRemarksData,
  timelineEvents: initialTimelineData,
  dateFilter: {
    fromDate: '2026-09-01',
    toDate: '2026-09-22',
    icuFilter: 'ALL',
    staffFilter: 'ALL',
    searchQuery: ''
  },
  activityLogs: initialActivityLogsData
};

export const hospitalAdminSlice = createSlice({
  name: 'hospitalAdmin',
  initialState,
  reducers: {
    addDoctor: (
      state,
      action: PayloadAction<Omit<HospitalAdminDoctorRecord, 'id' | 'hospitalId' | 'activePatientsCount' | 'workload' | 'joinedDate'>>
    ) => {
      const newId = `DOC-${100 + state.doctors.length + 1}`;
      const newDoctor: HospitalAdminDoctorRecord = {
        ...action.payload,
        id: newId,
        hospitalId: state.assignedHospitalId,
        activePatientsCount: 0,
        workload: '0 Active Patients',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      state.doctors.unshift(newDoctor);

      // Auto Log Action
      const logItem: HospitalAdminActivityLog = {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Hospital Administrator (AIIMS Patna)',
        role: 'ADMIN',
        action: 'DOCTOR_REGISTRATION',
        entity: `${newDoctor.name} (${newDoctor.employeeId})`,
        details: `Registered ${newDoctor.specialization} to ${newDoctor.assignedICU}`,
        hospitalId: state.assignedHospitalId,
        ipAddress: '10.240.12.88'
      };
      state.activityLogs.unshift(logItem);
    },

    addNurse: (
      state,
      action: PayloadAction<Omit<HospitalAdminNurseRecord, 'id' | 'hospitalId' | 'joinedDate'>>
    ) => {
      const newId = `NUR-${6000 + state.nurses.length + 1}`;
      const newNurse: HospitalAdminNurseRecord = {
        ...action.payload,
        id: newId,
        hospitalId: state.assignedHospitalId,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      state.nurses.unshift(newNurse);

      // Auto Log Action
      const logItem: HospitalAdminActivityLog = {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Hospital Administrator (AIIMS Patna)',
        role: 'ADMIN',
        action: 'NURSE_REGISTRATION',
        entity: `${newNurse.name} (${newNurse.employeeId})`,
        details: `Registered ${newNurse.rank === 'NURSE_LEAD' ? 'Nurse Lead' : 'ICU Nurse'} to ${newNurse.assignedICU}`,
        hospitalId: state.assignedHospitalId,
        ipAddress: '10.240.12.88'
      };
      state.activityLogs.unshift(logItem);
    },

    addICU: (
      state,
      action: PayloadAction<Omit<HospitalAdminICURecord, 'id' | 'hospitalId' | 'occupiedBeds' | 'availableBeds' | 'reservedBeds' | 'maintenanceBeds' | 'offlineBeds'>>
    ) => {
      const code = action.payload.code.toUpperCase().trim();
      const newId = `ICU-${code}`;
      const newICU: HospitalAdminICURecord = {
        ...action.payload,
        id: newId,
        hospitalId: state.assignedHospitalId,
        occupiedBeds: 0,
        availableBeds: action.payload.totalBeds,
        reservedBeds: 0,
        maintenanceBeds: 0,
        offlineBeds: 0
      };
      state.icus.push(newICU);

      // Auto Log Action
      const logItem: HospitalAdminActivityLog = {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Hospital Administrator (AIIMS Patna)',
        role: 'ADMIN',
        action: 'ICU_CREATION',
        entity: `${newICU.name} (${newICU.code})`,
        details: `Created Intensive Care Unit (${newICU.code}) with capacity of ${newICU.totalBeds} beds on ${newICU.floorLocation}`,
        hospitalId: state.assignedHospitalId,
        ipAddress: '10.240.12.88'
      };
      state.activityLogs.unshift(logItem);
    },

    setICUs: (state, action: PayloadAction<HospitalAdminICURecord[]>) => {
      state.icus = action.payload;
    },

    updateBedStatus: (
      state,
      action: PayloadAction<{ bedId: string; status: BedStatus; reason?: string }>
    ) => {
      const bed = state.beds.find(b => b.id === action.payload.bedId);
      if (bed) {
        const oldStatus = bed.status;
        bed.status = action.payload.status;

        // Recalculate ICU bed status counts
        const targetIcu = state.icus.find(i => i.id === bed.icuId);
        if (targetIcu) {
          const icuBeds = state.beds.filter(b => b.icuId === targetIcu.id);
          targetIcu.occupiedBeds = icuBeds.filter(b => b.status === 'OCCUPIED').length;
          targetIcu.availableBeds = icuBeds.filter(b => b.status === 'AVAILABLE').length;
          targetIcu.reservedBeds = icuBeds.filter(b => b.status === 'RESERVED').length;
          targetIcu.maintenanceBeds = icuBeds.filter(b => b.status === 'MAINTENANCE').length;
          targetIcu.offlineBeds = icuBeds.filter(b => b.status === 'OFFLINE').length;
        }

        // Auto Log Action
        const logItem: HospitalAdminActivityLog = {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: 'Hospital Administrator (AIIMS Patna)',
          role: 'ADMIN',
          action: 'BED_STATUS_UPDATE',
          entity: bed.bedNumber,
          details: `Updated bed status from ${oldStatus} to ${action.payload.status}${action.payload.reason ? ` (${action.payload.reason})` : ''}`,
          hospitalId: state.assignedHospitalId,
          ipAddress: '10.240.12.88'
        };
        state.activityLogs.unshift(logItem);
      }
    },

    setBeds: (state, action: PayloadAction<HospitalAdminBedRecord[]>) => {
      state.beds = action.payload;
    },

    addBed: (
      state,
      action: PayloadAction<Partial<HospitalAdminBedRecord> & {
        bedNumber: string;
        icuId: string;
      }>
    ) => {
      const targetIcu = state.icus.find(i => i.id === action.payload.icuId || i.code === action.payload.icuId);
      const isIso = Boolean(action.payload.is_isolation ?? action.payload.isIsolation ?? false);
      const hasDial = Boolean(action.payload.has_dialysis_port ?? action.payload.hasDialysisPort ?? false);
      const newBed: HospitalAdminBedRecord = {
        id: action.payload.id || `BED-${Date.now()}`,
        hospitalId: action.payload.hospitalId || state.assignedHospitalId,
        bedNumber: action.payload.bedNumber,
        icuId: action.payload.icuId,
        icuName: action.payload.icuName || (targetIcu ? targetIcu.name : 'Intensive Care Unit'),
        status: action.payload.status || 'AVAILABLE',
        patientId: action.payload.patientId,
        patientName: action.payload.patientName,
        patientAge: action.payload.patientAge,
        patientGender: action.payload.patientGender,
        assignedDoctor: action.payload.assignedDoctor || 'Dr. Vikram Sethi',
        assignedNurse: action.payload.assignedNurse || 'Nurse Sunita Rao',
        telemetryStatus: action.payload.telemetryStatus || 'ONLINE',
        equipmentConnected: action.payload.equipmentConnected || [
          'ECG Telemetry Monitor',
          isIso ? 'Negative Pressure Filter' : 'Infusion Pump',
          ...(hasDial ? ['Hemodialysis / CRRT Port'] : []),
        ],
        is_isolation: isIso,
        isIsolation: isIso,
        has_dialysis_port: hasDial,
        hasDialysisPort: hasDial,
        current_admission_id: action.payload.current_admission_id || action.payload.currentAdmissionId || null,
        currentAdmissionId: action.payload.current_admission_id || action.payload.currentAdmissionId || null,
        last_cleaned_at: action.payload.last_cleaned_at || action.payload.lastCleanedAt || new Date().toISOString(),
        lastCleanedAt: action.payload.last_cleaned_at || action.payload.lastCleanedAt || new Date().toISOString(),
      };
      state.beds.unshift(newBed);

      if (targetIcu) {
        targetIcu.totalBeds += 1;
        targetIcu.availableBeds += 1;
      }

      // Auto Log Action
      const logItem: HospitalAdminActivityLog = {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Hospital Administrator',
        role: 'ADMIN',
        action: 'BED_COMMISSIONING',
        entity: newBed.bedNumber,
        details: `Commissioned new telemetry bed ${newBed.bedNumber} in ${newBed.icuName}`,
        hospitalId: state.assignedHospitalId,
        ipAddress: '10.240.12.88'
      };
      state.activityLogs.unshift(logItem);
    },

    updateShiftSchedule: (
      state,
      action: PayloadAction<{ shiftId: string; status: ShiftStatus }>
    ) => {
      const shift = state.shifts.find(s => s.id === action.payload.shiftId);
      if (shift) {
        const oldStatus = shift.status;
        shift.status = action.payload.status;

        // Auto Log Action
        const logItem: HospitalAdminActivityLog = {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: 'Hospital Administrator (AIIMS Patna)',
          role: 'ADMIN',
          action: 'SHIFT_SCHEDULE_UPDATE',
          entity: `Shift ${shift.id} (${shift.staffName})`,
          details: `Updated shift status from ${oldStatus} to ${action.payload.status}`,
          hospitalId: state.assignedHospitalId,
          ipAddress: '10.240.12.88'
        };
        state.activityLogs.unshift(logItem);
      }
    },

    setDateRangeFilter: (
      state,
      action: PayloadAction<Partial<ReportDateFilter>>
    ) => {
      state.dateFilter = {
        ...state.dateFilter,
        ...action.payload
      };
    },

    logActivity: (
      state,
      action: PayloadAction<{ action: string; entity: string; details: string }>
    ) => {
      const logItem: HospitalAdminActivityLog = {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Hospital Administrator (AIIMS Patna)',
        role: 'ADMIN',
        action: action.payload.action,
        entity: action.payload.entity,
        details: action.payload.details,
        hospitalId: state.assignedHospitalId,
        ipAddress: '10.240.12.88'
      };
      state.activityLogs.unshift(logItem);
    }
  }
});

export const {
  addDoctor,
  addNurse,
  addICU,
  setICUs,
  addBed,
  setBeds,
  updateBedStatus,
  updateShiftSchedule,
  setDateRangeFilter,
  logActivity
} = hospitalAdminSlice.actions;

export default hospitalAdminSlice.reducer;
