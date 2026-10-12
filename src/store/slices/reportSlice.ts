import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReportCategory = 'Patient Reports' | 'Doctor Reports' | 'Nurse Reports' | 'ICU Reports' | 'Shift Reports';

export interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  generatedDate: string;
  generatedBy: string;
  recordCount: number;
  status: 'Ready' | 'Processing';
  fileSize: string;
}

interface ReportState {
  activeTab: ReportCategory;
  dateRangeFilter: string;
  unitFilter: string;
  searchQuery: string;
  exportModalOpen: boolean;
  selectedReportForExport?: ReportItem;
  exportFormat: 'Excel' | 'CSV' | 'PDF';
  reports: ReportItem[];
}

const INITIAL_REPORTS: ReportItem[] = [
  { id: 'REP-101', title: 'Monthly ICU Patient Admission & Discharge Summary', category: 'Patient Reports', generatedDate: '2026-09-19', generatedBy: 'Dr. Vikramaditya Sen', recordCount: 148, status: 'Ready', fileSize: '2.4 MB' },
  { id: 'REP-102', title: 'SOFA Organ Dysfunction & Clinical Trajectory Report', category: 'Patient Reports', generatedDate: '2026-09-18', generatedBy: 'Dr. Ananya Roy', recordCount: 64, status: 'Ready', fileSize: '1.8 MB' },
  { id: 'REP-201', title: 'Doctor Round Attendance & Patient Review Audit', category: 'Doctor Reports', generatedDate: '2026-09-19', generatedBy: 'Dr. Vikramaditya Sen', recordCount: 18, status: 'Ready', fileSize: '850 KB' },
  { id: 'REP-301', title: 'Nursing Vitals Documentation & Shift Handover Compliance', category: 'Nurse Reports', generatedDate: '2026-09-19', generatedBy: 'Nurse Priya Sharma', recordCount: 32, status: 'Ready', fileSize: '1.2 MB' },
  { id: 'REP-401', title: 'ICU Bed Occupancy & Telemetry Alarm Frequency Log', category: 'ICU Reports', generatedDate: '2026-09-18', generatedBy: 'System Auto', recordCount: 520, status: 'Ready', fileSize: '4.6 MB' },
  { id: 'REP-501', title: 'Weekly Staff Shift Allocation & Overtime Audit', category: 'Shift Reports', generatedDate: '2026-09-15', generatedBy: 'Dr. Vikramaditya Sen', recordCount: 42, status: 'Ready', fileSize: '980 KB' }
];

const initialState: ReportState = {
  activeTab: 'Patient Reports',
  dateRangeFilter: 'THIS_MONTH',
  unitFilter: 'ALL',
  searchQuery: '',
  exportModalOpen: false,
  exportFormat: 'PDF',
  reports: INITIAL_REPORTS
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<ReportCategory>) => {
      state.activeTab = action.payload;
    },
    setDateRangeFilter: (state, action: PayloadAction<string>) => {
      state.dateRangeFilter = action.payload;
    },
    setUnitFilter: (state, action: PayloadAction<string>) => {
      state.unitFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setExportFormat: (state, action: PayloadAction<'Excel' | 'CSV' | 'PDF'>) => {
      state.exportFormat = action.payload;
    },
    openExportModal: (state, action: PayloadAction<ReportItem | undefined>) => {
      state.exportModalOpen = true;
      state.selectedReportForExport = action.payload;
    },
    closeExportModal: (state) => {
      state.exportModalOpen = false;
      state.selectedReportForExport = undefined;
    }
  }
});

export const {
  setActiveTab,
  setDateRangeFilter,
  setUnitFilter,
  setSearchQuery,
  setExportFormat,
  openExportModal,
  closeExportModal
} = reportSlice.actions;

export default reportSlice.reducer;
