import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  userApi,
  UserResponse,
  UserCreatePayload,
  UserUpdatePayload,
  UserHierarchyResponse,
  UserListParams,
  FALLBACK_USERS,
} from '../../api/userApi';

interface UserState {
  users: UserResponse[];
  selectedUser: UserResponse | null;
  userHierarchy: UserHierarchyResponse | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  users: FALLBACK_USERS,
  selectedUser: null,
  userHierarchy: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// Async Thunks
// ------------------------------------------------------------------

export const fetchUsersThunk = createAsyncThunk(
  'user/fetchUsers',
  async (params: UserListParams | undefined, { rejectWithValue }) => {
    try {
      const response = await userApi.listUsers(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch users list');
    }
  }
);

export const fetchUserByIdThunk = createAsyncThunk(
  'user/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch user ${id}`);
    }
  }
);

export const provisionUserThunk = createAsyncThunk(
  'user/provisionUser',
  async (payload: UserCreatePayload, { rejectWithValue }) => {
    try {
      const response = await userApi.provisionUser(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to provision new user account');
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  'user/updateUser',
  async ({ id, payload }: { id: string; payload: UserUpdatePayload }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(id, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to update user ${id}`);
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'user/deleteUser',
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(id, reason);
      return { id, reason: reason || 'Soft-deleted' };
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to delete user ${id}`);
    }
  }
);

export const restoreUserThunk = createAsyncThunk(
  'user/restoreUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userApi.restoreUser(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to restore user ${id}`);
    }
  }
);

export const fetchUserHierarchyThunk = createAsyncThunk(
  'user/fetchUserHierarchy',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserHierarchy(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch hierarchy for user ${id}`);
    }
  }
);

// ------------------------------------------------------------------
// User Slice
// ------------------------------------------------------------------

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<UserResponse | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserHierarchy: (state) => {
      state.userHierarchy = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch users';
      })

      // Fetch User By ID
      .addCase(fetchUserByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch user details';
      })

      // Provision User
      .addCase(provisionUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(provisionUserThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.users.unshift(action.payload);
        state.successMessage = `Account for ${action.payload.full_name} (${action.payload.email}) successfully provisioned.`;
      })
      .addCase(provisionUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to provision user';
      })

      // Update User
      .addCase(updateUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.successMessage = `User profile for ${action.payload.full_name} updated successfully.`;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to update user';
      })

      // Delete User (Soft Delete)
      .addCase(deleteUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const { id, reason } = action.payload;
        const idx = state.users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          state.users[idx] = {
            ...state.users[idx],
            is_deleted: true,
            status: 'INACTIVE',
            deleted_at: new Date().toISOString(),
            deletion_reason: reason,
          };
        }
        state.successMessage = `User account has been soft-deleted.`;
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to delete user';
      })

      // Restore User
      .addCase(restoreUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(restoreUserThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        } else {
          state.users.unshift(action.payload);
        }
        state.successMessage = `User account for ${action.payload.full_name} has been restored successfully.`;
      })
      .addCase(restoreUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to restore user';
      })

      // Fetch User Hierarchy
      .addCase(fetchUserHierarchyThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserHierarchyThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userHierarchy = action.payload;
      })
      .addCase(fetchUserHierarchyThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch user hierarchy';
      });
  },
});

export const {
  setSelectedUser,
  clearUserHierarchy,
  clearUserError,
  clearUserSuccessMessage,
} = userSlice.actions;

export default userSlice.reducer;
