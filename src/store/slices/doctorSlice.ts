import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DoctorMember {
  id: string;
  name: string;
  department: string;
  qualification: string;
  experience: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Night Shift';
  email: string;
  phone: string;
  availability: 'Available' | 'On Round' | 'In Surgery' | 'On Leave';
  assignedPatientsCount: number;
  avatarUrl?: string;
}

interface DoctorState {
  doctors: DoctorMember[];
  searchQuery: string;
  departmentFilter: string;
  availabilityFilter: string;
}

const INITIAL_DOCTORS: DoctorMember[] = [
  {
    id: 'DOC-101',
    name: 'Dr. Ananya Roy',
    department: 'Medical ICU',
    qualification: 'MD, DM (Critical Care)',
    experience: '14 Years',
    shift: 'Morning Shift',
    email: 'ananya.roy@hospital.in',
    phone: '+91 98200 12345',
    availability: 'Available',
    assignedPatientsCount: 5
  },
  {
    id: 'DOC-102',
    name: 'Dr. Rahul Mehta',
    department: 'Surgical ICU',
    qualification: 'MS, MCh (Trauma Surgery)',
    experience: '12 Years',
    shift: 'Morning Shift',
    email: 'rahul.mehta@hospital.in',
    phone: '+91 98200 23456',
    availability: 'On Round',
    assignedPatientsCount: 4
  },
  {
    id: 'DOC-103',
    name: 'Dr. Kavita Deshmukh',
    department: 'Cardiac ICU',
    qualification: 'MD, DM (Cardiology)',
    experience: '16 Years',
    shift: 'Evening Shift',
    email: 'kavita.deshmukh@hospital.in',
    phone: '+91 98200 34567',
    availability: 'In Surgery',
    assignedPatientsCount: 3
  },
  {
    id: 'DOC-104',
    name: 'Dr. Suresh Nair',
    department: 'Neuro ICU',
    qualification: 'MD, MCh (Neurosurgery)',
    experience: '18 Years',
    shift: 'Night Shift',
    email: 'suresh.nair@hospital.in',
    phone: '+91 98200 45678',
    availability: 'Available',
    assignedPatientsCount: 3
  },
  {
    id: 'DOC-105',
    name: 'Dr. Rajesh Iyer',
    department: 'Medical ICU',
    qualification: 'MD (Internal Medicine), FNB',
    experience: '8 Years',
    shift: 'Evening Shift',
    email: 'rajesh.iyer@hospital.in',
    phone: '+91 98200 56789',
    availability: 'Available',
    assignedPatientsCount: 4
  }
];

const initialState: DoctorState = {
  doctors: INITIAL_DOCTORS,
  searchQuery: '',
  departmentFilter: 'ALL',
  availabilityFilter: 'ALL'
};

export const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setDepartmentFilter: (state, action: PayloadAction<string>) => {
      state.departmentFilter = action.payload;
    },
    setAvailabilityFilter: (state, action: PayloadAction<string>) => {
      state.availabilityFilter = action.payload;
    },
    addDoctor: (state, action: PayloadAction<Omit<DoctorMember, 'id' | 'assignedPatientsCount'>>) => {
      const newDoctor: DoctorMember = {
        ...action.payload,
        id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        assignedPatientsCount: 0
      };
      state.doctors.unshift(newDoctor);
    },
    updateDoctor: (state, action: PayloadAction<DoctorMember>) => {
      const index = state.doctors.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
    },
    deleteDoctor: (state, action: PayloadAction<string>) => {
      state.doctors = state.doctors.filter(d => d.id !== action.payload);
    },
    toggleAvailability: (state, action: PayloadAction<{ doctorId: string; availability: DoctorMember['availability'] }>) => {
      const doctor = state.doctors.find(d => d.id === action.payload.doctorId);
      if (doctor) {
        doctor.availability = action.payload.availability;
      }
    }
  }
});

export const {
  setSearchQuery,
  setDepartmentFilter,
  setAvailabilityFilter,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  toggleAvailability
} = doctorSlice.actions;

export default doctorSlice.reducer;
