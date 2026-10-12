import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  hospitalApi,
  HospitalFacility,
  HospitalCreatePayload,
  HospitalUpdatePayload,
  HospitalHierarchyResponse,
} from '../../api/hospitalApi';

export interface Hospital {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  district?: string;
  district_id?: string | null;
  organization_id?: string | null;
  totalBeds: number;
  availableBeds?: number;
  directorId?: string;
  directorName?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  units: string[];
  createdDate: string;
  address?: any;
  contact_phone?: string | null;
  contact_email?: string | null;
  contactNumber?: string | null;
  is_command_center_enabled?: boolean;
}

export interface Director {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  assignedHospitalId?: string;
  assignedHospitalName?: string;
}

interface HospitalState {
  hospitals: Hospital[];
  directors: Director[];
  selectedHospitalId: string | null;
  selectedHospitalHierarchy: HospitalHierarchyResponse | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_DIRECTORS: Director[] = [
  {
    id: 'DIR-001',
    name: 'Dr. Rajesh Vardhan',
    email: 'rajesh.vardhan@aiimspatna.org',
    phone: '+91 98765 43210',
    specialty: 'Chief Medical Officer & ICU Director',
    assignedHospitalId: 'HOSP-01',
    assignedHospitalName: 'AIIMS Patna & Critical Care Center',
  },
  {
    id: 'DIR-002',
    name: 'Dr. Meenakshi Sundaram',
    email: 'm.sundaram@pmchpatna.org',
    phone: '+91 98221 11223',
    specialty: 'Medical Director - Pulmonology',
    assignedHospitalId: 'HOSP-02',
    assignedHospitalName: 'PMCH - Patna Medical College & Hospital',
  },
  {
    id: 'DIR-003',
    name: 'Dr. Suresh Nair',
    email: 'suresh.nair@igims.org',
    phone: '+91 99401 55667',
    specialty: 'Trauma & Critical Care Director',
    assignedHospitalId: 'HOSP-03',
    assignedHospitalName: 'IGIMS - Indira Gandhi Institute of Medical Sciences',
  },
];

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    name: 'Metro Central Smart Hospital',
    code: 'HOSP-METRO-001',
    city: 'New Delhi',
    state: 'Delhi',
    district: 'New Delhi',
    totalBeds: 120,
    availableBeds: 45,
    directorId: 'DIR-001',
    directorName: 'Dr. Rajesh Vardhan',
    status: 'ACTIVE',
    units: ['MICU-01', 'SICU-01', 'CICU-01', 'NICU-01'],
    createdDate: '2026-09-29',
    contact_phone: '+91-11-2658-8500',
    contactNumber: '+91-11-2658-8500',
    contact_email: 'admin@metrocentral.org',
    is_command_center_enabled: true,
  },
];

function facilityToHospital(f: HospitalFacility): Hospital {
  return {
    id: f.id,
    name: f.name,
    code: f.code,
    city: f.city || 'New Delhi',
    state: f.state || 'Delhi',
    district: f.district || f.city || '',
    district_id: f.district_id,
    organization_id: f.organization_id,
    totalBeds: f.totalBeds || 40,
    availableBeds: f.availableBeds || 14,
    directorId: f.directorId,
    directorName: f.directorName,
    status: f.status || 'ACTIVE',
    units: f.units || ['MICU-01', 'SICU-01'],
    createdDate: (f.created_at || new Date().toISOString()).slice(0, 10),
    address: f.address,
    contact_phone: f.contact_phone || f.contactNumber,
    contact_email: f.contact_email,
    contactNumber: f.contact_phone || f.contactNumber,
    is_command_center_enabled: f.is_command_center_enabled ?? true,
  };
}

// ----------------------------------------------------
// ASYNC THUNKS (Full Backend Integration)
// ----------------------------------------------------

// 1. GET /api/v1/hospitals (Public List)
export const fetchHospitalsThunk = createAsyncThunk(
  'hospital/fetchHospitals',
  async (params?: { organization_id?: string; district_id?: string }) => {
    const res = await hospitalApi.list(params);
    return res.data.map(facilityToHospital);
  }
);

// 2. POST /api/v1/hospitals (Register Hospital)
export const createHospitalThunk = createAsyncThunk(
  'hospital/createHospitalThunk',
  async (payload: HospitalCreatePayload) => {
    const res = await hospitalApi.create(payload);
    return facilityToHospital(res.data);
  }
);

// 3. PATCH /api/v1/hospitals/{id} (Update Hospital)
export const updateHospitalThunk = createAsyncThunk(
  'hospital/updateHospitalThunk',
  async ({ id, payload }: { id: string; payload: HospitalUpdatePayload }) => {
    const res = await hospitalApi.update(id, payload);
    return facilityToHospital(res.data);
  }
);

// 4. DELETE /api/v1/hospitals/{id} (Delete/Deactivate Hospital)
export const deleteHospitalThunk = createAsyncThunk(
  'hospital/deleteHospitalThunk',
  async (id: string) => {
    await hospitalApi.delete(id);
    return id;
  }
);

// 5. GET /api/v1/hospitals/{id}/hierarchy (Location Hierarchy)
export const fetchHospitalHierarchyThunk = createAsyncThunk(
  'hospital/fetchHierarchy',
  async (id: string) => {
    const res = await hospitalApi.hierarchy(id);
    return res.data;
  }
);

const initialState: HospitalState = {
  hospitals: INITIAL_HOSPITALS,
  directors: INITIAL_DIRECTORS,
  selectedHospitalId: INITIAL_HOSPITALS[0]?.id || null,
  selectedHospitalHierarchy: null,
  isLoading: false,
  error: null,
};

export const hospitalSlice = createSlice({
  name: 'hospital',
  initialState,
  reducers: {
    createHospital: (state, action: PayloadAction<Omit<Hospital, 'id' | 'createdDate'>>) => {
      const newHospital: Hospital = {
        ...action.payload,
        id: `HOSP-${Math.floor(10 + Math.random() * 90)}`,
        createdDate: new Date().toISOString().slice(0, 10),
      };
      state.hospitals.unshift(newHospital);
    },
    assignDirectorToHospital: (
      state,
      action: PayloadAction<{ hospitalId: string; directorId: string }>
    ) => {
      const hospital = state.hospitals.find((h) => h.id === action.payload.hospitalId);
      const director = state.directors.find((d) => d.id === action.payload.directorId);
      if (hospital && director) {
        hospital.directorId = director.id;
        hospital.directorName = director.name;
        director.assignedHospitalId = hospital.id;
        director.assignedHospitalName = hospital.name;
      }
    },
    addDirector: (state, action: PayloadAction<Omit<Director, 'id'>>) => {
      const newDir: Director = {
        ...action.payload,
        id: `DIR-${Math.floor(100 + Math.random() * 900)}`,
      };
      state.directors.push(newDir);
    },
    setSelectedHospital: (state, action: PayloadAction<string>) => {
      state.selectedHospitalId = action.payload;
    },
    clearHierarchy: (state) => {
      state.selectedHospitalHierarchy = null;
    },
  },
  extraReducers: (builder) => {
    // fetchHospitalsThunk
    builder.addCase(fetchHospitalsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchHospitalsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload && action.payload.length > 0) {
        state.hospitals = action.payload;
        if (!state.selectedHospitalId || !state.hospitals.find(h => h.id === state.selectedHospitalId)) {
          state.selectedHospitalId = action.payload[0].id;
        }
      }
    });
    builder.addCase(fetchHospitalsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load hospitals from backend';
    });

    // createHospitalThunk
    builder.addCase(createHospitalThunk.fulfilled, (state, action) => {
      state.hospitals.unshift(action.payload);
      state.selectedHospitalId = action.payload.id;
    });

    // updateHospitalThunk
    builder.addCase(updateHospitalThunk.fulfilled, (state, action) => {
      const idx = state.hospitals.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) {
        state.hospitals[idx] = { ...state.hospitals[idx], ...action.payload };
      }
    });

    // deleteHospitalThunk
    builder.addCase(deleteHospitalThunk.fulfilled, (state, action) => {
      state.hospitals = state.hospitals.filter((h) => h.id !== action.payload);
      if (state.selectedHospitalId === action.payload) {
        state.selectedHospitalId = state.hospitals[0]?.id || null;
      }
    });

    // fetchHospitalHierarchyThunk
    builder.addCase(fetchHospitalHierarchyThunk.fulfilled, (state, action) => {
      state.selectedHospitalHierarchy = action.payload;
    });
  },
});

export const {
  createHospital,
  assignDirectorToHospital,
  addDirector,
  setSelectedHospital,
  clearHierarchy,
} = hospitalSlice.actions;

export default hospitalSlice.reducer;
