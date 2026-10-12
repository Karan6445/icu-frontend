import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  roleApi,
  RoleResponse,
  RoleCreatePayload,
  RoleUpdatePayload,
  RoleListParams,
  PermissionResponse,
  ResourcePermissionsSummary,
  FALLBACK_ROLES,
  FALLBACK_PERMISSIONS,
  normalizePermissionCode,
} from '../../api/roleApi';

export type PermissionCategory = 'Patients' | 'Beds' | 'Doctors' | 'Nurses' | 'Reports' | 'Settings';
export type PermissionAction = 'View' | 'Create' | 'Edit' | 'Delete' | 'Export';

// Backward compatible interface for components that reference CustomRole
export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystemDefault: boolean;
  permissions: Record<PermissionCategory, PermissionAction[]>;
  userCount: number;
}

interface RolePermissionState {
  roles: RoleResponse[];
  permissions: PermissionResponse[];
  permissionsMatrix: ResourcePermissionsSummary[];
  selectedRole: RoleResponse | null;
  searchQuery: string;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RolePermissionState = {
  roles: FALLBACK_ROLES,
  permissions: FALLBACK_PERMISSIONS,
  permissionsMatrix: [],
  selectedRole: null,
  searchQuery: '',
  isLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// Async Thunks
// ------------------------------------------------------------------

export const fetchRolesThunk = createAsyncThunk(
  'rolePermission/fetchRoles',
  async (params: RoleListParams | undefined, { rejectWithValue }) => {
    try {
      const res = await roleApi.listRoles(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch roles');
    }
  }
);

export const fetchRoleByIdThunk = createAsyncThunk(
  'rolePermission/fetchRoleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await roleApi.getRoleById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch role ${id}`);
    }
  }
);

export const createRoleThunk = createAsyncThunk(
  'rolePermission/createRole',
  async (payload: RoleCreatePayload, { rejectWithValue }) => {
    try {
      const res = await roleApi.createRole(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create role');
    }
  }
);

export const updateRoleThunk = createAsyncThunk(
  'rolePermission/updateRole',
  async ({ id, payload }: { id: string; payload: RoleUpdatePayload }, { rejectWithValue }) => {
    try {
      const res = await roleApi.updateUserRole(id, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to update role ${id}`);
    }
  }
);

export const deleteRoleThunk = createAsyncThunk(
  'rolePermission/deleteRole',
  async (id: string, { rejectWithValue }) => {
    try {
      await roleApi.deleteRole(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to delete role ${id}`);
    }
  }
);

export const assignRolePermissionsThunk = createAsyncThunk(
  'rolePermission/assignRolePermissions',
  async ({ id, permission_codes }: { id: string; permission_codes: string[] }, { rejectWithValue }) => {
    try {
      const res = await roleApi.assignRolePermissions(id, permission_codes);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to assign role permissions');
    }
  }
);

export const bulkRevokeRolePermissionsThunk = createAsyncThunk(
  'rolePermission/bulkRevokeRolePermissions',
  async ({ id, permission_codes }: { id: string; permission_codes: string[] }, { rejectWithValue }) => {
    try {
      const res = await roleApi.bulkRevokeRolePermissions(id, permission_codes);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to revoke permissions');
    }
  }
);

export const revokeSingleRolePermissionThunk = createAsyncThunk(
  'rolePermission/revokeSingleRolePermission',
  async ({ id, permission_code }: { id: string; permission_code: string }, { rejectWithValue }) => {
    try {
      const res = await roleApi.revokeSingleRolePermission(id, permission_code);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to revoke permission ${permission_code}`);
    }
  }
);

export const fetchPermissionsThunk = createAsyncThunk(
  'rolePermission/fetchPermissions',
  async (module: string | undefined, { rejectWithValue }) => {
    try {
      const res = await roleApi.listPermissions(module);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch permissions');
    }
  }
);

export const fetchPermissionsMatrixThunk = createAsyncThunk(
  'rolePermission/fetchPermissionsMatrix',
  async (_, { rejectWithValue }) => {
    try {
      const res = await roleApi.getPermissionsMatrix();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch permissions matrix');
    }
  }
);

// ------------------------------------------------------------------
// Role & Permission Slice
// ------------------------------------------------------------------

export const rolePermissionSlice = createSlice({
  name: 'rolePermission',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedRole: (state, action: PayloadAction<RoleResponse | null>) => {
      state.selectedRole = action.payload;
    },
    clearRoleError: (state) => {
      state.error = null;
    },
    clearRoleSuccessMessage: (state) => {
      state.successMessage = null;
    },
    // Backward compatibility helper
    addCustomRole: (state, action: PayloadAction<any>) => {
      const newRole: RoleResponse = {
        id: `role-${Date.now()}`,
        code: `ROLE_${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description || '',
        is_system_role: false,
        permissions: [],
      };
      state.roles.unshift(newRole);
    },
    updateCustomRole: (state, action: PayloadAction<any>) => {
      const idx = state.roles.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) {
        state.roles[idx] = {
          ...state.roles[idx],
          name: action.payload.name,
          description: action.payload.description,
        };
      }
    },
    deleteCustomRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter(r => r.id !== action.payload && !r.is_system_role);
    },
    togglePermission: (state, action: PayloadAction<{ roleId: string; category: PermissionCategory; action: PermissionAction }>) => {
      // Local toggle helper
      const role = state.roles.find(r => r.id === action.payload.roleId);
      if (role) {
        const rawCode = `${action.payload.category.toLowerCase()}:${action.payload.action.toLowerCase()}`;
        const permCode = normalizePermissionCode(rawCode);
        const exists = role.permissions.some(p => normalizePermissionCode(p.code) === permCode);
        if (exists) {
          role.permissions = role.permissions.filter(p => normalizePermissionCode(p.code) !== permCode);
        } else {
          role.permissions.push({
            id: `p-${Date.now()}`,
            code: permCode,
            module: action.payload.category,
            action: action.payload.action,
            description: `${action.payload.action} ${action.payload.category}`,
          });
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRolesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch roles';
      })

      // Fetch Role By ID
      .addCase(fetchRoleByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoleByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRoleByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch role details';
      })

      // Create Role
      .addCase(createRoleThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.roles.unshift(action.payload);
        state.successMessage = `Role "${action.payload.name}" successfully created.`;
      })
      .addCase(createRoleThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to create role';
      })

      // Update Role
      .addCase(updateRoleThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateRoleThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const idx = state.roles.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) {
          state.roles[idx] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
        state.successMessage = `Role "${action.payload.name}" updated successfully.`;
      })
      .addCase(updateRoleThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to update role';
      })

      // Delete Role
      .addCase(deleteRoleThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteRoleThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.roles = state.roles.filter(r => r.id !== action.payload);
        state.successMessage = `Custom role successfully deleted.`;
      })
      .addCase(deleteRoleThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to delete role';
      })

      // Assign Permissions
      .addCase(assignRolePermissionsThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(assignRolePermissionsThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const idx = state.roles.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) {
          state.roles[idx] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
        state.successMessage = 'Permissions assigned to role successfully.';
      })
      .addCase(assignRolePermissionsThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to assign permissions';
      })

      // Bulk Revoke Permissions
      .addCase(bulkRevokeRolePermissionsThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(bulkRevokeRolePermissionsThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const idx = state.roles.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) {
          state.roles[idx] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
        state.successMessage = 'Permissions revoked from role successfully.';
      })
      .addCase(bulkRevokeRolePermissionsThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to revoke permissions';
      })

      // Revoke Single Permission
      .addCase(revokeSingleRolePermissionThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(revokeSingleRolePermissionThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const idx = state.roles.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) {
          state.roles[idx] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
        state.successMessage = 'Permission removed from role.';
      })
      .addCase(revokeSingleRolePermissionThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to revoke permission';
      })

      // Fetch Permissions
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })

      // Fetch Permissions Matrix
      .addCase(fetchPermissionsMatrixThunk.fulfilled, (state, action) => {
        state.permissionsMatrix = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setSelectedRole,
  clearRoleError,
  clearRoleSuccessMessage,
  addCustomRole,
  updateCustomRole,
  deleteCustomRole,
  togglePermission,
} = rolePermissionSlice.actions;

export default rolePermissionSlice.reducer;
