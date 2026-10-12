import { useAppSelector } from '../store/hooks';
import { getRolePermissions, RolePermissions, AppRole } from '../config/rbacConfig';

export const useRBAC = () => {
  const { activeRole, currentUser, isAuthenticated } = useAppSelector(state => state.auth);
  const permissions: RolePermissions = getRolePermissions(activeRole);
  const userPermissions: string[] = currentUser?.permissions || [];
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';

  const can = (action: keyof RolePermissions): boolean => {
    return Boolean(permissions[action]);
  };

  const hasRole = (roles: AppRole[]): boolean => {
    return roles.includes(activeRole as AppRole);
  };

  const canAccessModule = (module: 'ICU' | 'E_CLINIC'): boolean => {
    return permissions.allowedModules.includes(module);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (isSuperAdmin) return true;
    const cleanCode = permissionCode.trim().toLowerCase();
    return userPermissions.some(p => p.toLowerCase() === cleanCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionCodes.some(code => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionCodes.every(code => hasPermission(code));
  };

  return {
    role: activeRole as AppRole,
    currentUser,
    isAuthenticated,
    isSuperAdmin,
    permissions,
    userPermissions,
    can,
    hasRole,
    canAccessModule,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};
