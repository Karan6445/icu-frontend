import { useAppSelector } from '../store/hooks';
import { getRolePermissions, RolePermissions, AppRole } from '../config/rbacConfig';

export const useRBAC = () => {
  const { activeRole, currentUser, isAuthenticated } = useAppSelector(state => state.auth);
  const permissions: RolePermissions = getRolePermissions(activeRole);

  const can = (action: keyof RolePermissions): boolean => {
    return Boolean(permissions[action]);
  };

  const hasRole = (roles: AppRole[]): boolean => {
    return roles.includes(activeRole as AppRole);
  };

  const canAccessModule = (module: 'ICU' | 'E_CLINIC'): boolean => {
    return permissions.allowedModules.includes(module);
  };

  return {
    role: activeRole as AppRole,
    currentUser,
    isAuthenticated,
    permissions,
    can,
    hasRole,
    canAccessModule
  };
};
