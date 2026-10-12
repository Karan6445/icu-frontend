import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  login,
  logout,
  setActiveRole,
  fetchCurrentUserThunk,
  loginUserThunk,
  logoutUserThunk,
  SystemRole
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, currentUser, activeRole, isAuthenticated, loading, error, lastApiResponse } = useAppSelector(
    state => state.auth
  );

  const handleLogin = (role: SystemRole, email: string) => {
    dispatch(login({ role, email }));
  };

  const handleLogout = () => {
    dispatch(logoutUserThunk());
    dispatch(logout());
  };

  const handleRoleSwitch = (role: SystemRole) => {
    dispatch(setActiveRole(role));
  };

  const refreshUser = () => {
    return dispatch(fetchCurrentUserThunk());
  };

  const loginWithBackend = (credentials: { usernameOrEmail: string; password?: string; role?: string }) => {
    return dispatch(loginUserThunk(credentials));
  };

  return {
    user: user || currentUser,
    currentUser,
    activeRole: user?.role || activeRole,
    isAuthenticated,
    loading,
    error,
    lastApiResponse,
    login: handleLogin,
    loginWithBackend,
    logout: handleLogout,
    refreshUser,
    switchRole: handleRoleSwitch,
    isSuperAdmin: (user?.role || activeRole) === 'SUPER_ADMIN',
    isAdmin: (user?.role || activeRole) === 'ADMIN' || (user?.role || activeRole) === 'SUPER_ADMIN' || (user?.role || activeRole) === 'HOSPITAL_ADMIN',
    isDoctor: (user?.role || activeRole) === 'DOCTOR',
    isNurse: (user?.role || activeRole) === 'NURSE' || (user?.role || activeRole) === 'NURSE_LEAD',
  };
};

export default useAuth;
