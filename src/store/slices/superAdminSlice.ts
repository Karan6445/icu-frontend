import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DistrictData,
  HospitalRecord,
  SuperAdminDoctorRecord,
  SuperAdminNurseRecord,
  SuperAdminICUBedRecord,
  SuperAdminPatientRecord,
  SuperAdminAuditItem,
  RemarkHistoryRecord
} from '../../types/superAdmin';
import {
  MOCK_DISTRICTS,
  MOCK_SUPER_HOSPITALS,
  MOCK_SUPER_DOCTORS,
  MOCK_SUPER_NURSES,
  MOCK_SUPER_ICU_BEDS,
  MOCK_SUPER_PATIENTS,
  MOCK_SUPER_AUDIT_LOGS
} from '../../data/superAdminData';

interface SuperAdminState {
  districts: DistrictData[];
  hospitals: HospitalRecord[];
  doctors: SuperAdminDoctorRecord[];
  nurses: SuperAdminNurseRecord[];
  icuBeds: SuperAdminICUBedRecord[];
  patients: SuperAdminPatientRecord[];
  auditLogs: SuperAdminAuditItem[];
  selectedDistrict: string;
  selectedHospitalId: string | null;
  searchQuery: string;
  statusFilter: string;
}

const initialState: SuperAdminState = {
  districts: MOCK_DISTRICTS,
  hospitals: MOCK_SUPER_HOSPITALS,
  doctors: MOCK_SUPER_DOCTORS,
  nurses: MOCK_SUPER_NURSES,
  icuBeds: MOCK_SUPER_ICU_BEDS,
  patients: MOCK_SUPER_PATIENTS,
  auditLogs: MOCK_SUPER_AUDIT_LOGS,
  selectedDistrict: 'ALL',
  selectedHospitalId: null,
  searchQuery: '',
  statusFilter: 'ALL'
};

export const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {
    setSelectedDistrict: (state, action: PayloadAction<string>) => {
      state.selectedDistrict = action.payload;
    },
    setSelectedHospitalId: (state, action: PayloadAction<string | null>) => {
      state.selectedHospitalId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },

    // --- HOSPITAL REDUCERS ---
    addHospital: (state, action: PayloadAction<Omit<HospitalRecord, 'id' | 'lastUpdated'>>) => {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newHosp: HospitalRecord = {
        ...action.payload,
        id: `HOSP-${Math.floor(10 + Math.random() * 90)}`,
        lastUpdated: nowStr
      };
      state.hospitals.unshift(newHosp);

      // Auto Audit Log
      state.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: nowStr,
        user: 'Dr. Vikramaditya Sen',
        userRole: 'SUPER_ADMIN',
        action: 'HOSPITAL_ADDED',
        module: 'Hospital Management',
        hospital: newHosp.name,
        district: newHosp.district,
        recordId: newHosp.id,
        newValue: `Added Hospital ${newHosp.name} (${newHosp.code})`,
        ipAddress: '192.168.1.100',
        status: 'SUCCESS'
      });
    },
    updateHospital: (state, action: PayloadAction<Partial<HospitalRecord> & { id: string }>) => {
      const idx = state.hospitals.findIndex(h => h.id === action.payload.id);
      if (idx !== -1) {
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const oldHosp = state.hospitals[idx];
        state.hospitals[idx] = { ...oldHosp, ...action.payload, lastUpdated: nowStr };

        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Dr. Vikramaditya Sen',
          userRole: 'SUPER_ADMIN',
          action: 'HOSPITAL_UPDATED',
          module: 'Hospital Management',
          hospital: oldHosp.name,
          district: oldHosp.district,
          recordId: oldHosp.id,
          oldValue: `Beds: ${oldHosp.totalBeds}, Status: ${oldHosp.status}`,
          newValue: `Beds: ${action.payload.totalBeds || oldHosp.totalBeds}, Status: ${action.payload.status || oldHosp.status}`,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },
    deleteHospital: (state, action: PayloadAction<string>) => {
      const hosp = state.hospitals.find(h => h.id === action.payload);
      state.hospitals = state.hospitals.filter(h => h.id !== action.payload);
      if (hosp) {
        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          user: 'Dr. Vikramaditya Sen',
          userRole: 'SUPER_ADMIN',
          action: 'HOSPITAL_DELETED',
          module: 'Hospital Management',
          hospital: hosp.name,
          district: hosp.district,
          recordId: hosp.id,
          newValue: `Deleted / Deactivated Hospital ${hosp.name}`,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },
    setHospitalsFromBackend: (state, action: PayloadAction<HospitalRecord[]>) => {
      state.hospitals = action.payload;
    },

    // --- DOCTOR REDUCERS & REMARKS ---
    addDoctor: (state, action: PayloadAction<Omit<SuperAdminDoctorRecord, 'id' | 'assignedPatientsCount' | 'remarkHistory'>>) => {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newDoc: SuperAdminDoctorRecord = {
        ...action.payload,
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedPatientsCount: 0,
        remarkHistory: action.payload.remarks ? [
          {
            id: `REM-DOC-${Date.now()}`,
            previousRemark: 'Initial Doctor Record Created',
            updatedRemark: action.payload.remarks,
            updatedBy: 'Dr. Vikramaditya Sen',
            updatedByRole: 'SUPER_ADMIN',
            timestamp: nowStr
          }
        ] : []
      };
      state.doctors.unshift(newDoc);

      state.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: nowStr,
        user: 'Dr. Vikramaditya Sen',
        userRole: 'SUPER_ADMIN',
        action: 'DOCTOR_ADDED',
        module: 'Doctor Management',
        hospital: newDoc.hospitalName,
        district: newDoc.district,
        recordId: newDoc.doctorId,
        newValue: `Added Doctor ${newDoc.name} (${newDoc.specialization})`,
        ipAddress: '192.168.1.100',
        status: 'SUCCESS'
      });
    },
    updateDoctor: (state, action: PayloadAction<SuperAdminDoctorRecord>) => {
      const idx = state.doctors.findIndex(d => d.id === action.payload.id);
      if (idx !== -1) {
        state.doctors[idx] = action.payload;
      }
    },
    toggleDoctorStatus: (state, action: PayloadAction<{ doctorId: string; status: SuperAdminDoctorRecord['status'] }>) => {
      const doc = state.doctors.find(d => d.id === action.payload.doctorId || d.doctorId === action.payload.doctorId);
      if (doc) {
        const oldStatus = doc.status;
        doc.status = action.payload.status;
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Dr. Vikramaditya Sen',
          userRole: 'SUPER_ADMIN',
          action: 'DOCTOR_STATUS_TOGGLED',
          module: 'Doctor Management',
          hospital: doc.hospitalName,
          district: doc.district,
          recordId: doc.doctorId,
          oldValue: oldStatus,
          newValue: action.payload.status,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },
    updateDoctorRemark: (state, action: PayloadAction<{ doctorId: string; updatedRemark: string; updatedBy: string }>) => {
      const doc = state.doctors.find(d => d.id === action.payload.doctorId || d.doctorId === action.payload.doctorId);
      if (doc) {
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const prevRemark = doc.remarks || 'No previous remarks.';

        if (!doc.remarkHistory) doc.remarkHistory = [];
        const histRecord: RemarkHistoryRecord = {
          id: `REM-DOC-H-${Date.now()}`,
          previousRemark: prevRemark,
          updatedRemark: action.payload.updatedRemark,
          updatedBy: action.payload.updatedBy,
          updatedByRole: 'SUPER_ADMIN',
          timestamp: nowStr
        };

        doc.remarkHistory.unshift(histRecord);
        doc.remarks = action.payload.updatedRemark;

        // Auto Log
        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: action.payload.updatedBy,
          userRole: 'SUPER_ADMIN',
          action: 'DOCTOR_REMARK_UPDATED',
          module: 'Doctor Management',
          hospital: doc.hospitalName,
          district: doc.district,
          recordId: doc.doctorId,
          oldValue: prevRemark,
          newValue: action.payload.updatedRemark,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },

    // --- NURSE REDUCERS & REMARKS ---
    addNurse: (state, action: PayloadAction<Omit<SuperAdminNurseRecord, 'id' | 'assignedBedsCount' | 'remarkHistory'>>) => {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newNurse: SuperAdminNurseRecord = {
        ...action.payload,
        id: `NURSE-${Math.floor(2000 + Math.random() * 8000)}`,
        assignedBedsCount: 0,
        remarkHistory: action.payload.remarks ? [
          {
            id: `REM-NUR-${Date.now()}`,
            previousRemark: 'Initial Nurse Record Created',
            updatedRemark: action.payload.remarks,
            updatedBy: 'Dr. Vikramaditya Sen',
            updatedByRole: 'SUPER_ADMIN',
            timestamp: nowStr
          }
        ] : []
      };
      state.nurses.unshift(newNurse);

      state.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: nowStr,
        user: 'Dr. Vikramaditya Sen',
        userRole: 'SUPER_ADMIN',
        action: 'NURSE_ADDED',
        module: 'Nurse Management',
        hospital: newNurse.hospitalName,
        district: newNurse.district,
        recordId: newNurse.nurseId,
        newValue: `Added Nurse ${newNurse.name} (${newNurse.department})`,
        ipAddress: '192.168.1.100',
        status: 'SUCCESS'
      });
    },
    updateNurse: (state, action: PayloadAction<SuperAdminNurseRecord>) => {
      const idx = state.nurses.findIndex(n => n.id === action.payload.id);
      if (idx !== -1) {
        state.nurses[idx] = action.payload;
      }
    },
    toggleNurseStatus: (state, action: PayloadAction<{ nurseId: string; status: SuperAdminNurseRecord['status'] }>) => {
      const nurse = state.nurses.find(n => n.id === action.payload.nurseId || n.nurseId === action.payload.nurseId);
      if (nurse) {
        const oldStatus = nurse.status;
        nurse.status = action.payload.status;
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Dr. Vikramaditya Sen',
          userRole: 'SUPER_ADMIN',
          action: 'NURSE_STATUS_TOGGLED',
          module: 'Nurse Management',
          hospital: nurse.hospitalName,
          district: nurse.district,
          recordId: nurse.nurseId,
          oldValue: oldStatus,
          newValue: action.payload.status,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },
    updateNurseRemark: (state, action: PayloadAction<{ nurseId: string; updatedRemark: string; updatedBy: string }>) => {
      const nurse = state.nurses.find(n => n.id === action.payload.nurseId || n.nurseId === action.payload.nurseId);
      if (nurse) {
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const prevRemark = nurse.remarks || 'No previous remarks.';

        if (!nurse.remarkHistory) nurse.remarkHistory = [];
        const histRecord: RemarkHistoryRecord = {
          id: `REM-NUR-H-${Date.now()}`,
          previousRemark: prevRemark,
          updatedRemark: action.payload.updatedRemark,
          updatedBy: action.payload.updatedBy,
          updatedByRole: 'SUPER_ADMIN',
          timestamp: nowStr
        };

        nurse.remarkHistory.unshift(histRecord);
        nurse.remarks = action.payload.updatedRemark;

        // Auto Log
        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: action.payload.updatedBy,
          userRole: 'SUPER_ADMIN',
          action: 'NURSE_REMARK_UPDATED',
          module: 'Nurse Management',
          hospital: nurse.hospitalName,
          district: nurse.district,
          recordId: nurse.nurseId,
          oldValue: prevRemark,
          newValue: action.payload.updatedRemark,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },

    // --- ICU BED REDUCERS ---
    addICUBed: (state, action: PayloadAction<Omit<SuperAdminICUBedRecord, 'id' | 'lastUpdated'>>) => {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newBed: SuperAdminICUBedRecord = {
        ...action.payload,
        id: `BED-${Math.floor(100 + Math.random() * 900)}`,
        lastUpdated: nowStr
      };
      state.icuBeds.unshift(newBed);

      state.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: nowStr,
        user: 'Dr. Vikramaditya Sen',
        userRole: 'SUPER_ADMIN',
        action: 'ICU_BED_ADDED',
        module: 'ICU Management',
        hospital: newBed.hospitalName,
        district: newBed.district,
        recordId: newBed.bedNumber,
        newValue: `Added ICU Bed ${newBed.bedNumber} (${newBed.status})`,
        ipAddress: '192.168.1.100',
        status: 'SUCCESS'
      });
    },
    updateICUBed: (state, action: PayloadAction<SuperAdminICUBedRecord>) => {
      const idx = state.icuBeds.findIndex(b => b.id === action.payload.id || b.bedNumber === action.payload.bedNumber);
      if (idx !== -1) {
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const oldBed = state.icuBeds[idx];
        state.icuBeds[idx] = { ...action.payload, lastUpdated: nowStr };

        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Dr. Vikramaditya Sen',
          userRole: 'SUPER_ADMIN',
          action: 'ICU_BED_UPDATED',
          module: 'ICU Management',
          hospital: oldBed.hospitalName,
          district: oldBed.district,
          recordId: oldBed.bedNumber,
          oldValue: `Status: ${oldBed.status}, Patient: ${oldBed.patientName || 'None'}`,
          newValue: `Status: ${action.payload.status}, Patient: ${action.payload.patientName || 'None'}`,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    },

    // --- PATIENT REDUCERS ---
    updatePatientStatus: (state, action: PayloadAction<{ patientId: string; status: SuperAdminPatientRecord['patientStatus'] }>) => {
      const pat = state.patients.find(p => p.id === action.payload.patientId || p.patientId === action.payload.patientId);
      if (pat) {
        const oldStatus = pat.patientStatus;
        pat.patientStatus = action.payload.status;
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

        state.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Dr. Vikramaditya Sen',
          userRole: 'SUPER_ADMIN',
          action: 'PATIENT_STATUS_UPDATED',
          module: 'Patient Management',
          hospital: pat.hospitalName,
          district: pat.district,
          recordId: pat.patientId,
          oldValue: oldStatus,
          newValue: action.payload.status,
          ipAddress: '192.168.1.100',
          status: 'SUCCESS'
        });
      }
    }
  }
});

export const {
  setSelectedDistrict,
  setSelectedHospitalId,
  setSearchQuery,
  setStatusFilter,
  addHospital,
  updateHospital,
  deleteHospital,
  setHospitalsFromBackend,
  addDoctor,
  updateDoctor,
  toggleDoctorStatus,
  updateDoctorRemark,
  addNurse,
  updateNurse,
  toggleNurseStatus,
  updateNurseRemark,
  addICUBed,
  updateICUBed,
  updatePatientStatus
} = superAdminSlice.actions;

export default superAdminSlice.reducer;
