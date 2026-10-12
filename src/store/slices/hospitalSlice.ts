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
  timezone?: string;
  country_code?: string;
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
  selectedHospitalDetails: Hospital | null;
  selectedHospitalHierarchy: HospitalHierarchyResponse | null;
  isLoading: boolean;
  isDetailsLoading: boolean;
  isHierarchyLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
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
    timezone: f.timezone || 'UTC',
    country_code: f.country_code || 'IND',
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

// 3. GET /api/v1/hospitals/{id} (Get Hospital Details)
export const fetchHospitalDetailsThunk = createAsyncThunk(
  'hospital/fetchHospitalDetails',
  async (id: string) => {
    const res = await hospitalApi.get(id);
    return facilityToHospital(res.data);
  }
);

// 4. PATCH /api/v1/hospitals/{id} (Update Hospital)
export const updateHospitalThunk = createAsyncThunk(
  'hospital/updateHospitalThunk',
  async ({ id, payload }: { id: string; payload: HospitalUpdatePayload }) => {
    const res = await hospitalApi.update(id, payload);
    return facilityToHospital(res.data);
  }
);

// 5. DELETE /api/v1/hospitals/{id} (Delete/Deactivate Hospital)
export const deleteHospitalThunk = createAsyncThunk(
  'hospital/deleteHospitalThunk',
  async (id: string) => {
    await hospitalApi.delete(id);
    return id;
  }
);

// 6. GET /api/v1/hospitals/{id}/hierarchy (Location Hierarchy)
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
  selectedHospitalDetails: null,
  selectedHospitalHierarchy: null,
  isLoading: false,
  isDetailsLoading: false,
  isHierarchyLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
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
    clearHospitalDetails: (state) => {
      state.selectedHospitalDetails = null;
    },
    clearHospitalError: (state) => {
      state.error = null;
    },
    clearHospitalSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchHospitalsThunk (GET /api/v1/hospitals)
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

    // 2. createHospitalThunk (POST /api/v1/hospitals)
    builder.addCase(createHospitalThunk.pending, (state) => {
      state.isActionLoading = true;
      state.error = null;
    });
    builder.addCase(createHospitalThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.hospitals.unshift(action.payload);
      state.selectedHospitalId = action.payload.id;
      state.successMessage = `Hospital "${action.payload.name}" registered successfully.`;
    });
    builder.addCase(createHospitalThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.error.message || 'Failed to register hospital facility';
    });

    // 3. fetchHospitalDetailsThunk (GET /api/v1/hospitals/{id})
    builder.addCase(fetchHospitalDetailsThunk.pending, (state) => {
      state.isDetailsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchHospitalDetailsThunk.fulfilled, (state, action) => {
      state.isDetailsLoading = false;
      state.selectedHospitalDetails = action.payload;
      const idx = state.hospitals.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) {
        state.hospitals[idx] = { ...state.hospitals[idx], ...action.payload };
      }
    });
    builder.addCase(fetchHospitalDetailsThunk.rejected, (state, action) => {
      state.isDetailsLoading = false;
      state.error = action.error.message || 'Failed to fetch hospital details';
    });

    // 4. updateHospitalThunk (PATCH /api/v1/hospitals/{id})
    builder.addCase(updateHospitalThunk.pending, (state) => {
      state.isActionLoading = true;
      state.error = null;
    });
    builder.addCase(updateHospitalThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      const idx = state.hospitals.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) {
        state.hospitals[idx] = { ...state.hospitals[idx], ...action.payload };
      }
      if (state.selectedHospitalDetails?.id === action.payload.id) {
        state.selectedHospitalDetails = action.payload;
      }
      state.successMessage = `Hospital "${action.payload.name}" updated successfully.`;
    });
    builder.addCase(updateHospitalThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.error.message || 'Failed to update hospital facility';
    });

    // 5. deleteHospitalThunk (DELETE /api/v1/hospitals/{id})
    builder.addCase(deleteHospitalThunk.pending, (state) => {
      state.isActionLoading = true;
      state.error = null;
    });
    builder.addCase(deleteHospitalThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.hospitals = state.hospitals.filter((h) => h.id !== action.payload);
      if (state.selectedHospitalId === action.payload) {
        state.selectedHospitalId = state.hospitals[0]?.id || null;
      }
      if (state.selectedHospitalDetails?.id === action.payload) {
        state.selectedHospitalDetails = null;
      }
      state.successMessage = 'Hospital facility deactivated successfully.';
    });
    builder.addCase(deleteHospitalThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.error.message || 'Failed to deactivate hospital facility';
    });

    // 6. fetchHospitalHierarchyThunk (GET /api/v1/hospitals/{id}/hierarchy)
    builder.addCase(fetchHospitalHierarchyThunk.pending, (state) => {
      state.isHierarchyLoading = true;
      state.error = null;
    });
    builder.addCase(fetchHospitalHierarchyThunk.fulfilled, (state, action) => {
      state.isHierarchyLoading = false;
      state.selectedHospitalHierarchy = action.payload;
    });
    builder.addCase(fetchHospitalHierarchyThunk.rejected, (state, action) => {
      state.isHierarchyLoading = false;
      state.error = action.error.message || 'Failed to load location hierarchy';
    });
  },
});

export const {
  createHospital,
  assignDirectorToHospital,
  addDirector,
  setSelectedHospital,
  clearHierarchy,
  clearHospitalDetails,
  clearHospitalError,
  clearHospitalSuccessMessage,
} = hospitalSlice.actions;

export default hospitalSlice.reducer;
