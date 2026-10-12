// API Layer Barrel Exporters
export * from './axios.config';
export * from './endpoints';
export * from './authApi';
export * from './patientApi';
export * from './adminApi';
export * from './deviceApi';
export * from './hospitalApi';
export * from './userApi';
export * from './roleApi';
export * from './stateApi';
export * from './districtApi';
export * from './organizationApi';
export * from './tenantApi';
export * from './departmentApi';
export {
  permissionApi,
  FALLBACK_PERMISSIONS_LIST,
  FALLBACK_PERMISSIONS_MATRIX,
  extractData as extractPermissionData,
} from './permissionApi';
export type { PermissionListParams } from './permissionApi';
