import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface IcuBed {
  id: string;
  bedNumber: string;
  icuId: string;
  icuName: string;
  status: BedStatus;
  assignedPatientId?: string;
  assignedPatientName?: string;
  ventilatorAttached: boolean;
  infusionPumpAttached: boolean;
  monitorModel: string;
  lastSanitized: string;
  maintenanceNotes?: string;
}

export interface IcuUnit {
  id: string;
  name: string;
  code: string;
  floor: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
  headDoctor: string;
}

interface IcuBedState {
  units: IcuUnit[];
  beds: IcuBed[];
  viewMode: 'grid' | 'table';
  selectedIcuFilter: string;
  selectedStatusFilter: string;
  searchQuery: string;
}

import { ALL_ICUS_18 } from '../../data/icuData';

const INITIAL_UNITS: IcuUnit[] = ALL_ICUS_18.map((unit, idx) => ({
  id: unit.id,
  name: unit.fullName,
  code: unit.code,
  floor: unit.floor,
  totalBeds: unit.totalBeds,
  availableBeds: Math.max(1, Math.floor(unit.totalBeds * 0.25)),
  occupiedBeds: Math.floor(unit.totalBeds * 0.65),
  reservedBeds: 1,
  maintenanceBeds: idx % 4 === 0 ? 1 : 0,
  headDoctor: unit.headDoctor || 'Dr. Vikramaditya Sen'
}));

const INITIAL_BEDS: IcuBed[] = [
  { id: 'B-101', bedNumber: 'BED-01', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Available', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'Mindray BeneVision N22', lastSanitized: '2026-09-19 07:00' },
  { id: 'B-102', bedNumber: 'BED-02', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Occupied', assignedPatientId: 'P-1027', assignedPatientName: 'Pooja Verma', ventilatorAttached: false, infusionPumpAttached: true, monitorModel: 'Philips Intellivue MX800', lastSanitized: '2026-09-16 10:30' },
  { id: 'B-103', bedNumber: 'BED-03', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Occupied', assignedPatientId: 'P-1025', assignedPatientName: 'Sunita Patel', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'GE Carescape B850', lastSanitized: '2026-09-17 14:00' },
  { id: 'B-104', bedNumber: 'BED-04', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Reserved', ventilatorAttached: true, infusionPumpAttached: false, monitorModel: 'Dräger Infinity C700', lastSanitized: '2026-09-19 09:15' },
  { id: 'B-105', bedNumber: 'BED-05', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Maintenance', maintenanceNotes: 'Oxygen sensor calibration pending', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'Mindray BeneVision N22', lastSanitized: '2026-09-18 16:00' },
  { id: 'B-106', bedNumber: 'BED-06', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Available', ventilatorAttached: false, infusionPumpAttached: true, monitorModel: 'Philips Intellivue MX800', lastSanitized: '2026-09-19 06:45' },
  { id: 'B-107', bedNumber: 'BED-07', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Occupied', assignedPatientId: 'P-1024', assignedPatientName: 'Rajesh Sharma', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'Philips Intellivue MX800', lastSanitized: '2026-09-15 08:00' },
  { id: 'B-108', bedNumber: 'BED-08', icuId: 'MICU-01', icuName: 'Medical ICU 01', status: 'Occupied', assignedPatientId: 'P-1028', assignedPatientName: 'Vikram Joshi', ventilatorAttached: false, infusionPumpAttached: true, monitorModel: 'GE Carescape B850', lastSanitized: '2026-09-18 11:20' },
  { id: 'B-201', bedNumber: 'BED-01', icuId: 'SICU-01', icuName: 'Surgical ICU 01', status: 'Available', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'Dräger Infinity C700', lastSanitized: '2026-09-19 08:30' },
  { id: 'B-202', bedNumber: 'BED-02', icuId: 'SICU-01', icuName: 'Surgical ICU 01', status: 'Occupied', assignedPatientId: 'P-1029', assignedPatientName: 'Ramesh Gupta', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'Philips Intellivue MX800', lastSanitized: '2026-09-17 19:40' },
  { id: 'B-301', bedNumber: 'BED-01', icuId: 'CICU-01', icuName: 'Cardiac ICU 01', status: 'Occupied', assignedPatientId: 'P-1026', assignedPatientName: 'Amitabh Sen', ventilatorAttached: false, infusionPumpAttached: true, monitorModel: 'Mindray BeneVision N22', lastSanitized: '2026-09-18 20:00' },
  { id: 'B-302', bedNumber: 'BED-02', icuId: 'CICU-01', icuName: 'Cardiac ICU 01', status: 'Available', ventilatorAttached: true, infusionPumpAttached: true, monitorModel: 'GE Carescape B850', lastSanitized: '2026-09-19 09:00' }
];

const initialState: IcuBedState = {
  units: INITIAL_UNITS,
  beds: INITIAL_BEDS,
  viewMode: 'table',
  selectedIcuFilter: 'ALL',
  selectedStatusFilter: 'ALL',
  searchQuery: ''
};

export const icuBedSlice = createSlice({
  name: 'icuBed',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<'grid' | 'table'>) => {
      state.viewMode = action.payload;
    },
    setSelectedIcuFilter: (state, action: PayloadAction<string>) => {
      state.selectedIcuFilter = action.payload;
    },
    setSelectedStatusFilter: (state, action: PayloadAction<string>) => {
      state.selectedStatusFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    updateBedStatus: (state, action: PayloadAction<{ bedId: string; status: BedStatus; notes?: string }>) => {
      const bed = state.beds.find(b => b.id === action.payload.bedId);
      if (bed) {
        bed.status = action.payload.status;
        if (action.payload.notes) bed.maintenanceNotes = action.payload.notes;
        if (action.payload.status === 'Available') {
          bed.assignedPatientId = undefined;
          bed.assignedPatientName = undefined;
        }
      }
    },
    addBed: (state, action: PayloadAction<Omit<IcuBed, 'id'>>) => {
      const newBed: IcuBed = {
        ...action.payload,
        id: `B-${Date.now()}`
      };
      state.beds.unshift(newBed);
    },
    addIcuUnit: (state, action: PayloadAction<Omit<IcuUnit, 'id'>>) => {
      const newUnit: IcuUnit = {
        ...action.payload,
        id: `${action.payload.code}`
      };
      state.units.push(newUnit);
    }
  }
});

export const {
  setViewMode,
  setSelectedIcuFilter,
  setSelectedStatusFilter,
  setSearchQuery,
  updateBedStatus,
  addBed,
  addIcuUnit
} = icuBedSlice.actions;

export default icuBedSlice.reducer;
