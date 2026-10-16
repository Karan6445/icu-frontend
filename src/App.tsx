import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { DashboardLayout } from './layouts/DashboardLayout';

// Fast Loading Fallback Component
const PageLoader: React.FC = () => (
  <div className="w-full h-96 flex flex-col items-center justify-center space-y-4 p-8 animate-in fade-in duration-200">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-600 dark:border-t-teal-400 animate-spin" />
      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
      </div>
    </div>
    <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
      Loading Clinical View...
    </span>
  </div>
);

// Helper for dynamic lazy loading of both named and default export page components
const lazyLoad = (importFn: () => Promise<any>, exportName?: string) =>
  lazy(() =>
    importFn().then(module => {
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      if (module.default) {
        return { default: module.default };
      }
      const firstExport = Object.values(module).find(val => typeof val === 'function');
      return { default: firstExport || module };
    })
  );

// Public & Authentication Pages
const Landing = lazyLoad(() => import('./pages/Landing'), 'Landing');
const Login = lazyLoad(() => import('./pages/Login'), 'Login');

// Core Application Views
const DashboardOverviewPage = lazyLoad(() => import('./pages/DashboardOverviewPage'), 'DashboardOverviewPage');
const PatientsPage = lazyLoad(() => import('./pages/PatientsPage'), 'PatientsPage');
const ICUBedsPage = lazyLoad(() => import('./pages/ICUBedsPage'), 'ICUBedsPage');
const LiveMonitoringPage = lazyLoad(() => import('./pages/LiveMonitoringPage'), 'LiveMonitoringPage');
const DevicesPage = lazyLoad(() => import('./pages/DevicesPage'), 'DevicesPage');
const NursingPage = lazyLoad(() => import('./pages/NursingPage'), 'NursingPage');
const AlertCenterPage = lazyLoad(() => import('./pages/AlertCenterPage'), 'AlertCenterPage');
const IncidentsPage = lazyLoad(() => import('./pages/IncidentsPage'), 'IncidentsPage');
const RisksPage = lazyLoad(() => import('./pages/RisksPage'), 'RisksPage');
const AuditLogsPage = lazyLoad(() => import('./pages/AuditLogsPage'), 'AuditLogsPage');
const ActionsPage = lazyLoad(() => import('./pages/ActionsPage'), 'ActionsPage');
const DocumentsPage = lazyLoad(() => import('./pages/DocumentsPage'), 'DocumentsPage');
const AnalyticsPage = lazyLoad(() => import('./pages/AnalyticsPage'), 'AnalyticsPage');
const VirtualICUPage = lazyLoad(() => import('./pages/VirtualICUPage'), 'VirtualICUPage');
const Governance360Page = lazyLoad(() => import('./pages/Governance360Page'), 'Governance360Page');
const PatientDashboardPage = lazyLoad(() => import('./pages/PatientDashboard'), 'PatientDashboardPage');
const ShiftHandoverPage = lazyLoad(() => import('./pages/ShiftHandoverPage'), 'ShiftHandoverPage');

// 18 ICU PLATFORM SPECIFICATION CLINICAL SCREENS
const CommandCenterPage = lazyLoad(() => import('./pages/clinical/CommandCenterPage'), 'CommandCenterPage');
const WaveformsPage = lazyLoad(() => import('./pages/clinical/WaveformsPage'), 'WaveformsPage');
const LabsPage = lazyLoad(() => import('./pages/clinical/LabsPage'), 'LabsPage');
const ImagingPage = lazyLoad(() => import('./pages/clinical/ImagingPage'), 'ImagingPage');
const MedicationsPage = lazyLoad(() => import('./pages/clinical/MedicationsPage'), 'MedicationsPage');
const OrdersPage = lazyLoad(() => import('./pages/clinical/OrdersPage'), 'OrdersPage');
const CarePlanPage = lazyLoad(() => import('./pages/clinical/CarePlanPage'), 'CarePlanPage');
const AmbulancePage = lazyLoad(() => import('./pages/clinical/AmbulancePage'), 'AmbulancePage');
const VideoPage = lazyLoad(() => import('./pages/clinical/VideoPage'), 'VideoPage');
const MeetingsHubPage = lazyLoad(() => import('./pages/clinical/MeetingsHubPage'), 'MeetingsHubPage');

// HOSPITAL ADMIN COMMAND CENTER PAGES
const HospitalAdminDashboardPage = lazyLoad(() => import('./pages/admin/HospitalAdminDashboardPage'), 'HospitalAdminDashboardPage');
const DirectorViewPage = lazyLoad(() => import('./pages/admin/DirectorViewPage'), 'DirectorViewPage');
const HospitalAdminDoctorsPage = lazyLoad(() => import('./pages/admin/HospitalAdminDoctorsPage'), 'HospitalAdminDoctorsPage');
const HospitalAdminNursesPage = lazyLoad(() => import('./pages/admin/HospitalAdminNursesPage'), 'HospitalAdminNursesPage');
const HospitalAdminShiftsPage = lazyLoad(() => import('./pages/admin/HospitalAdminShiftsPage'), 'HospitalAdminShiftsPage');
const HospitalAdminICUPage = lazyLoad(() => import('./pages/admin/HospitalAdminICUPage'), 'HospitalAdminICUPage');
const HospitalAdminBedMapPage = lazyLoad(() => import('./pages/admin/HospitalAdminBedMapPage'), 'HospitalAdminBedMapPage');
const HospitalAdminPatientsPage = lazyLoad(() => import('./pages/admin/HospitalAdminPatientsPage'), 'HospitalAdminPatientsPage');
const HospitalAdminEncountersPage = lazyLoad(() => import('./pages/admin/HospitalAdminEncountersPage'), 'HospitalAdminEncountersPage');
const HospitalAdminRemarksPage = lazyLoad(() => import('./pages/admin/HospitalAdminRemarksPage'), 'HospitalAdminRemarksPage');
const HospitalAdminTimelinePage = lazyLoad(() => import('./pages/admin/HospitalAdminTimelinePage'), 'HospitalAdminTimelinePage');
const HospitalAdminCustomReportsPage = lazyLoad(() => import('./pages/admin/HospitalAdminCustomReportsPage'), 'HospitalAdminCustomReportsPage');
const HospitalAdminActivityLogsPage = lazyLoad(() => import('./pages/admin/HospitalAdminActivityLogsPage'), 'HospitalAdminActivityLogsPage');
const HospitalAdminStaffPage = lazyLoad(() => import('./pages/admin/HospitalAdminStaffPage'), 'HospitalAdminStaffPage');

// ADMIN WORKFLOW PAGES
const AdminRolesPage = lazyLoad(() => import('./pages/admin/AdminRolesPage'), 'AdminRolesPage');
const AdminExportPage = lazyLoad(() => import('./pages/admin/AdminExportPage'), 'AdminExportPage');
const AdminSettingsPage = lazyLoad(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage');

// DOCTOR WORKFLOW PAGES
const DoctorOverviewPage = lazyLoad(() => import('./pages/doctor/DoctorOverviewPage'), 'DoctorOverviewPage');
const DoctorAssignedPatientsPage = lazyLoad(() => import('./pages/doctor/DoctorAssignedPatientsPage'), 'DoctorAssignedPatientsPage');
const DoctorBedViewPage = lazyLoad(() => import('./pages/doctor/DoctorBedViewPage'), 'DoctorBedViewPage');
const DoctorClinicalNotesPage = lazyLoad(() => import('./pages/doctor/DoctorClinicalNotesPage'), 'DoctorClinicalNotesPage');
const DoctorPatientHistoryPage = lazyLoad(() => import('./pages/doctor/DoctorPatientHistoryPage'), 'DoctorPatientHistoryPage');
const DoctorProfilePage = lazyLoad(() => import('./pages/doctor/DoctorProfilePage'), 'DoctorProfilePage');
const DoctorReportsPage = lazyLoad(() => import('./pages/doctor/DoctorReportsPage'), 'DoctorReportsPage');
const DoctorMeetPage = lazyLoad(() => import('./pages/doctor/DoctorMeetPage'), 'DoctorMeetPage');

// NURSE WORKFLOW PAGES
const NurseOverviewPage = lazyLoad(() => import('./pages/nurse/NurseOverviewPage'), 'NurseOverviewPage');
const NurseAssignedPatientsPage = lazyLoad(() => import('./pages/nurse/NurseAssignedPatientsPage'), 'NurseAssignedPatientsPage');
const NurseBedMonitoringPage = lazyLoad(() => import('./pages/nurse/NurseBedMonitoringPage'), 'NurseBedMonitoringPage');
const NursePatientMonitoringPage = lazyLoad(() => import('./pages/nurse/NursePatientMonitoringPage'), 'NursePatientMonitoringPage');
const NurseNotesPage = lazyLoad(() => import('./pages/nurse/NurseNotesPage'), 'NurseNotesPage');
const NurseAddPatientPage = lazyLoad(() => import('./pages/nurse/NurseAddPatientPage'), 'NurseAddPatientPage');
const NurseProfilePage = lazyLoad(() => import('./pages/nurse/NurseProfilePage'), 'NurseProfilePage');

// OTHER WORKFLOW PAGES
const AdminHospitalsPage = lazyLoad(() => import('./pages/admin/AdminHospitalsPage'), 'AdminHospitalsPage');
const PatientTimelinePage = lazyLoad(() => import('./pages/PatientTimelinePage'), 'PatientTimelinePage');
const IcuOperationsPage = lazyLoad(() => import('./pages/IcuOperationsPage'), 'IcuOperationsPage');
const EmergencyCodeBluePage = lazyLoad(() => import('./pages/EmergencyCodeBluePage'), 'EmergencyCodeBluePage');

// SUPER ADMIN PAGES
const SuperAdminDashboardPage = lazyLoad(() => import('./pages/admin/SuperAdminDashboardPage'), 'SuperAdminDashboardPage');
const DistrictManagementPage = lazyLoad(() => import('./pages/admin/DistrictManagementPage'), 'DistrictManagementPage');
const HospitalDetailsPage = lazyLoad(() => import('./pages/admin/HospitalDetailsPage'), 'HospitalDetailsPage');
const ICUOverviewPage = lazyLoad(() => import('./pages/admin/ICUOverviewPage'), 'ICUOverviewPage');
const DoctorManagementPage = lazyLoad(() => import('./pages/admin/DoctorManagementPage'), 'DoctorManagementPage');
const NurseManagementPage = lazyLoad(() => import('./pages/admin/NurseManagementPage'), 'NurseManagementPage');
const PatientManagementPage = lazyLoad(() => import('./pages/admin/PatientManagementPage'), 'PatientManagementPage');
const HospitalReportsPage = lazyLoad(() => import('./pages/admin/HospitalReportsPage'), 'HospitalReportsPage');
const AuditLogsManagementPage = lazyLoad(() => import('./pages/admin/AuditLogsManagementPage'), 'AuditLogsManagementPage');
const UserManagementPage = lazyLoad(() => import('./pages/admin/UserManagementPage'), 'UserManagementPage');
const AdminDepartmentsPage = lazyLoad(() => import('./pages/admin/AdminDepartmentsPage'), 'AdminDepartmentsPage');
const StateManagementPage = lazyLoad(() => import('./pages/admin/StateManagementPage'), 'StateManagementPage');
const OrganizationManagementPage = lazyLoad(() => import('./pages/admin/OrganizationManagementPage'), 'OrganizationManagementPage');

import { RoleRouteGuard } from './components/common/RoleRouteGuard';

// E-CLINIC & SMART HEALTH ENTERPRISE HOME
const SmartHealthHomePage = lazyLoad(() => import('./pages/home/SmartHealthHomePage'), 'SmartHealthHomePage');
const EClinicDashboardPage = lazyLoad(() => import('./pages/eclinic/EClinicDashboardPage'), 'EClinicDashboardPage');
const EClinicPatientsPage = lazyLoad(() => import('./pages/eclinic/EClinicPatientsPage'), 'EClinicPatientsPage');
const EClinicPatientDetailPage = lazyLoad(() => import('./pages/eclinic/EClinicPatientDetailPage'), 'EClinicPatientDetailPage');
const EClinicQueuePage = lazyLoad(() => import('./pages/eclinic/EClinicQueuePage'), 'EClinicQueuePage');
const EClinicAppointmentsPage = lazyLoad(() => import('./pages/eclinic/EClinicAppointmentsPage'), 'EClinicAppointmentsPage');
const EClinicVitalsPage = lazyLoad(() => import('./pages/eclinic/EClinicVitalsPage'), 'EClinicVitalsPage');
const EClinicDoctorsPage = lazyLoad(() => import('./pages/eclinic/EClinicDoctorsPage'), 'EClinicDoctorsPage');
const EClinicDoctorWorkspacePage = lazyLoad(() => import('./pages/eclinic/EClinicDoctorWorkspacePage'), 'EClinicDoctorWorkspacePage');
const EClinicTelemedicinePage = lazyLoad(() => import('./pages/eclinic/EClinicTelemedicinePage'), 'EClinicTelemedicinePage');
const EClinicReportsPage = lazyLoad(() => import('./pages/eclinic/EClinicReportsPage'), 'EClinicReportsPage');

const RoleBasedRedirect: React.FC = () => {
  return <Navigate to="/dashboard/overview" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Landing & Authentication & Standalone Meet */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/select-icu" element={<Navigate to="/dashboard" replace />} />
          <Route path="/facility-select" element={<Navigate to="/dashboard" replace />} />
          <Route path="/meet" element={<DoctorMeetPage />} />
          <Route path="/doctor/meet" element={<DoctorMeetPage />} />

          {/* Authenticated Layout */}
          <Route element={<DashboardLayout />}>
            {/* Platform Enterprise Home */}
            <Route path="/home" element={<SmartHealthHomePage />} />

            {/* E-Clinic Digital OPD Module Routes (Guarded by RBAC) */}
            <Route
              path="/eclinic"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC">
                  <EClinicDashboardPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/patients"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC">
                  <EClinicPatientsPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/patients/detail"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC">
                  <EClinicPatientDetailPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/queue"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC">
                  <EClinicQueuePage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/appointments"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC">
                  <EClinicAppointmentsPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/vitals"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC" requiredPermission="canCaptureVitals">
                  <EClinicVitalsPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/doctors"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC">
                  <EClinicDoctorsPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/doctor-workspace"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC" requiredPermission="canStartConsultation">
                  <EClinicDoctorWorkspacePage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/telemedicine"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC" requiredPermission="canStartConsultation">
                  <EClinicTelemedicinePage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/eclinic/reports"
              element={
                <RoleRouteGuard requiredModule="E_CLINIC" requiredPermission="canViewAnalytics">
                  <EClinicReportsPage />
                </RoleRouteGuard>
              }
            />

            {/* Main Dashboard Fallback & General Clinical Routes */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            <Route path="/dashboard/overview" element={<DashboardOverviewPage />} />
            <Route path="/command-center" element={<CommandCenterPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/icu-beds" element={<ICUBedsPage />} />
            <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/waveforms" element={<WaveformsPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/imaging" element={<ImagingPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/nursing" element={<NursingPage />} />
            <Route path="/care-plan" element={<CarePlanPage />} />
            <Route path="/ambulance" element={<AmbulancePage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/meetings" element={<MeetingsHubPage />} />
            <Route path="/tele-icu" element={<MeetingsHubPage />} />
            <Route path="/tele-icu/meetings" element={<MeetingsHubPage />} />
            <Route path="/alerts" element={<AlertCenterPage />} />
            <Route path="/notifications" element={<AlertCenterPage />} />
            <Route path="/clinical/notifications" element={<AlertCenterPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/risks" element={<RisksPage />} />
            <Route path="/audits" element={<AuditLogsPage />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/virtual-icu" element={<VirtualICUPage />} />
            <Route path="/governance-360" element={<Governance360Page />} />
            <Route path="/patient/:patientId" element={<PatientDashboardPage />} />
            <Route path="/patient/timeline" element={<PatientTimelinePage />} />
            <Route path="/patient/:patientId/timeline" element={<PatientTimelinePage />} />
            <Route path="/handover" element={<ShiftHandoverPage />} />
            <Route path="/operations" element={<IcuOperationsPage />} />
            <Route path="/operations/rounds" element={<IcuOperationsPage />} />
            <Route path="/operations/handovers" element={<IcuOperationsPage />} />
            <Route path="/operations/nursing-actions" element={<IcuOperationsPage />} />
            <Route path="/emergency" element={<EmergencyCodeBluePage />} />
            <Route path="/emergency/code-blue" element={<EmergencyCodeBluePage />} />
            <Route path="/code-blue" element={<EmergencyCodeBluePage />} />

            {/* SUPER ADMIN WORKFLOW ROUTES */}
            <Route path="/admin/super-dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/admin/organizations" element={<OrganizationManagementPage />} />
            <Route path="/admin/states" element={<StateManagementPage />} />
            <Route path="/admin/state-hierarchy" element={<StateManagementPage />} />
            <Route path="/admin/districts" element={<DistrictManagementPage />} />
            <Route path="/admin/hospital-details" element={<HospitalDetailsPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/icu-overview" element={<ICUOverviewPage />} />
            <Route path="/admin/doctor-management" element={<DoctorManagementPage />} />
            <Route path="/admin/nurse-management" element={<NurseManagementPage />} />
            <Route path="/admin/patient-management" element={<PatientManagementPage />} />
            <Route path="/admin/hospital-reports" element={<HospitalReportsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsManagementPage />} />
            <Route path="/admin/audit" element={<AuditLogsManagementPage />} />
            <Route path="/admin/activity-logs" element={<AuditLogsManagementPage />} />
            <Route path="/audit-logs" element={<AuditLogsManagementPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/user-management" element={<UserManagementPage />} />

            {/* HOSPITAL ADMIN ROUTES */}
            <Route path="/admin" element={<Navigate to="/admin/hospital-overview" replace />} />
            <Route path="/admin/overview" element={<HospitalAdminDashboardPage />} />
            <Route path="/admin/dashboard" element={<HospitalAdminDashboardPage />} />
            <Route path="/admin/hospital-overview" element={<HospitalAdminDashboardPage />} />
            <Route path="/admin/director" element={<DirectorViewPage />} />
            <Route path="/admin/hospital-doctors" element={<HospitalAdminDoctorsPage />} />
            <Route path="/admin/doctors" element={<HospitalAdminDoctorsPage />} />
            <Route path="/admin/hospital-nurses" element={<HospitalAdminNursesPage />} />
            <Route path="/admin/nurses" element={<HospitalAdminNursesPage />} />
            <Route path="/admin/nurse-leads" element={<HospitalAdminNursesPage />} />
            <Route path="/admin/hospital-shifts" element={<HospitalAdminShiftsPage />} />
            <Route path="/admin/shifts" element={<HospitalAdminShiftsPage />} />
            <Route path="/admin/hospital-staff" element={<HospitalAdminStaffPage />} />
            <Route path="/admin/staff" element={<HospitalAdminStaffPage />} />
            <Route path="/admin/hospital-icus" element={<HospitalAdminICUPage />} />
            <Route path="/admin/icu-management" element={<HospitalAdminICUPage />} />
            <Route path="/admin/add-icu" element={<HospitalAdminICUPage />} />
            <Route path="/admin/beds" element={<HospitalAdminBedMapPage />} />
            <Route path="/admin/bed-map" element={<HospitalAdminBedMapPage />} />
            <Route path="/admin/hospital-patients" element={<HospitalAdminPatientsPage />} />
            <Route path="/admin/patients" element={<HospitalAdminPatientsPage />} />
            <Route path="/admin/encounters" element={<HospitalAdminEncountersPage />} />
            <Route path="/admin/remarks" element={<HospitalAdminRemarksPage />} />
            <Route path="/admin/doctor-remarks" element={<HospitalAdminRemarksPage />} />
            <Route path="/admin/nurse-remarks" element={<HospitalAdminRemarksPage />} />
            <Route path="/admin/timeline" element={<HospitalAdminTimelinePage />} />
            <Route path="/admin/patient-timeline" element={<HospitalAdminTimelinePage />} />
            <Route path="/admin/custom-reports" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/reports" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/reports/staff" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/reports/patients" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/reports/icu" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/reports/beds" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/reports/clinical" element={<HospitalAdminCustomReportsPage />} />
            <Route path="/admin/activity-logs" element={<HospitalAdminActivityLogsPage />} />
            <Route path="/admin/logs" element={<HospitalAdminActivityLogsPage />} />
            <Route path="/admin/roles" element={<AdminRolesPage />} />
            <Route path="/admin/rbac" element={<AdminRolesPage />} />
            <Route path="/rbac" element={<AdminRolesPage />} />
            <Route path="/admin/roles-permissions" element={<AdminRolesPage />} />
            <Route path="/admin/role-management" element={<AdminRolesPage />} />
            <Route path="/admin/permissions" element={<AdminRolesPage />} />
            <Route path="/permissions" element={<AdminRolesPage />} />
            <Route path="/admin/permissions/matrix" element={<AdminRolesPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/export" element={<AdminExportPage />} />
            <Route path="/admin/monitoring" element={<LiveMonitoringPage />} />
            <Route path="/admin/hospitals" element={<AdminHospitalsPage />} />

            {/* DOCTOR WORKFLOW ROUTES */}
            <Route path="/doctor" element={<DoctorOverviewPage />} />
            <Route path="/doctor/patients" element={<DoctorAssignedPatientsPage />} />
            <Route path="/doctor/bed-view" element={<DoctorBedViewPage />} />
            <Route path="/doctor/clinical-notes" element={<DoctorClinicalNotesPage />} />
            <Route path="/doctor/handover" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/doctor/history" element={<DoctorPatientHistoryPage />} />
            <Route path="/doctor/reports" element={<DoctorReportsPage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />

            {/* NURSE WORKFLOW ROUTES */}
            <Route path="/nurse" element={<NurseOverviewPage />} />
            <Route path="/nurse/patients" element={<NurseAssignedPatientsPage />} />
            <Route path="/nurse/beds" element={<NurseBedMonitoringPage />} />
            <Route path="/nurse/monitoring" element={<NursePatientMonitoringPage />} />
            <Route path="/nurse/notes" element={<NurseNotesPage />} />
            <Route path="/nurse/handover" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/nurse/add-patient" element={<NurseAddPatientPage />} />
            <Route path="/nurse/profile" element={<NurseProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
