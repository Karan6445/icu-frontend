import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShiftRosterItem {
  id: string;
  name: string;
  timeRange: string;
  unit: string;
  assignedDoctors: string[];
  assignedNurses: string[];
  activeStatus: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

interface ShiftState {
  shifts: ShiftRosterItem[];
  searchQuery: string;
  unitFilter: string;
}

const INITIAL_SHIFTS: ShiftRosterItem[] = [
  {
    id: 'SHIFT-01',
    name: 'Morning Shift',
    timeRange: '07:00 AM - 03:00 PM',
    unit: 'Medical ICU 01',
    assignedDoctors: ['Dr. Ananya Roy', 'Dr. Rahul Mehta'],
    assignedNurses: ['Nurse Priya Sharma', 'Nurse Vikram Singh'],
    activeStatus: 'ACTIVE'
  },
  {
    id: 'SHIFT-02',
    name: 'Evening Shift',
    timeRange: '03:00 PM - 11:00 PM',
    unit: 'Medical ICU 01',
    assignedDoctors: ['Dr. Rajesh Iyer'],
    assignedNurses: ['Nurse Deepa Nair'],
    activeStatus: 'UPCOMING'
  },
  {
    id: 'SHIFT-03',
    name: 'Night Shift',
    timeRange: '11:00 PM - 07:00 AM',
    unit: 'Medical ICU 01',
    assignedDoctors: ['Dr. Suresh Nair'],
    assignedNurses: ['Nurse Arjun Kulkarni'],
    activeStatus: 'UPCOMING'
  },
  {
    id: 'SHIFT-04',
    name: 'Morning Shift',
    timeRange: '07:00 AM - 03:00 PM',
    unit: 'Cardiac ICU 01',
    assignedDoctors: ['Dr. Kavita Deshmukh'],
    assignedNurses: ['Nurse Sneha Rao'],
    activeStatus: 'ACTIVE'
  }
];

const initialState: ShiftState = {
  shifts: INITIAL_SHIFTS,
  searchQuery: '',
  unitFilter: 'ALL'
};

export const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setUnitFilter: (state, action: PayloadAction<string>) => {
      state.unitFilter = action.payload;
    },
    addShift: (state, action: PayloadAction<Omit<ShiftRosterItem, 'id'>>) => {
      const newShift: ShiftRosterItem = {
        ...action.payload,
        id: `SHIFT-${Math.floor(10 + Math.random() * 90)}`
      };
      state.shifts.unshift(newShift);
    },
    updateShift: (state, action: PayloadAction<ShiftRosterItem>) => {
      const index = state.shifts.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.shifts[index] = action.payload;
      }
    },
    deleteShift: (state, action: PayloadAction<string>) => {
      state.shifts = state.shifts.filter(s => s.id !== action.payload);
    }
  }
});

export const { setSearchQuery, setUnitFilter, addShift, updateShift, deleteShift } = shiftSlice.actions;
export default shiftSlice.reducer;
