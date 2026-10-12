import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NurseMember {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Night Shift';
  unitAssigned: string;
  email: string;
  phone: string;
  status: 'On Duty' | 'Off Duty' | 'On Break';
  assignedBedsCount: number;
}

interface NurseState {
  nurses: NurseMember[];
  searchQuery: string;
  shiftFilter: string;
  unitFilter: string;
}

const INITIAL_NURSES: NurseMember[] = [
  { id: 'NURSE-201', name: 'Nurse Priya Sharma', qualification: 'B.Sc Nursing, Critical Care Cert', experience: '8 Years', shift: 'Morning Shift', unitAssigned: 'Medical ICU 01', email: 'priya.sharma@hospital.in', phone: '+91 97100 11223', status: 'On Duty', assignedBedsCount: 3 },
  { id: 'NURSE-202', name: 'Nurse Vikram Singh', qualification: 'GNM Nursing, ACLS Certified', experience: '6 Years', shift: 'Morning Shift', unitAssigned: 'Medical ICU 01', email: 'vikram.singh@hospital.in', phone: '+91 97100 22334', status: 'On Duty', assignedBedsCount: 3 },
  { id: 'NURSE-203', name: 'Nurse Sneha Rao', qualification: 'M.Sc Critical Care Nursing', experience: '10 Years', shift: 'Evening Shift', unitAssigned: 'Cardiac ICU 01', email: 'sneha.rao@hospital.in', phone: '+91 97100 33445', status: 'On Duty', assignedBedsCount: 2 },
  { id: 'NURSE-204', name: 'Nurse Arjun Kulkarni', qualification: 'B.Sc Nursing', experience: '4 Years', shift: 'Night Shift', unitAssigned: 'Surgical ICU 01', email: 'arjun.kulkarni@hospital.in', phone: '+91 97100 44556', status: 'Off Duty', assignedBedsCount: 2 },
  { id: 'NURSE-205', name: 'Nurse Deepa Nair', qualification: 'PB B.Sc Nursing', experience: '7 Years', shift: 'Evening Shift', unitAssigned: 'Neuro ICU 01', email: 'deepa.nair@hospital.in', phone: '+91 97100 55667', status: 'On Duty', assignedBedsCount: 2 }
];

const initialState: NurseState = {
  nurses: INITIAL_NURSES,
  searchQuery: '',
  shiftFilter: 'ALL',
  unitFilter: 'ALL'
};

export const nurseSlice = createSlice({
  name: 'nurse',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setShiftFilter: (state, action: PayloadAction<string>) => {
      state.shiftFilter = action.payload;
    },
    setUnitFilter: (state, action: PayloadAction<string>) => {
      state.unitFilter = action.payload;
    },
    addNurse: (state, action: PayloadAction<Omit<NurseMember, 'id' | 'assignedBedsCount'>>) => {
      const newNurse: NurseMember = {
        ...action.payload,
        id: `NURSE-${Math.floor(200 + Math.random() * 800)}`,
        assignedBedsCount: 0
      };
      state.nurses.unshift(newNurse);
    },
    updateNurse: (state, action: PayloadAction<NurseMember>) => {
      const index = state.nurses.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.nurses[index] = action.payload;
      }
    },
    deleteNurse: (state, action: PayloadAction<string>) => {
      state.nurses = state.nurses.filter(n => n.id !== action.payload);
    },
    assignNurseShift: (state, action: PayloadAction<{ nurseId: string; shift: NurseMember['shift'] }>) => {
      const nurse = state.nurses.find(n => n.id === action.payload.nurseId);
      if (nurse) {
        nurse.shift = action.payload.shift;
      }
    }
  }
});

export const {
  setSearchQuery,
  setShiftFilter,
  setUnitFilter,
  addNurse,
  updateNurse,
  deleteNurse,
  assignNurseShift
} = nurseSlice.actions;

export default nurseSlice.reducer;
