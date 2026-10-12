import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LogCategory = 'User Activity' | 'Login Log' | 'Action Log';

export interface SystemLogItem {
  id: string;
  timestamp: string;
  category: LogCategory;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

interface LogState {
  logs: SystemLogItem[];
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
}

const INITIAL_LOGS: SystemLogItem[] = [
  { id: 'LOG-8801', timestamp: '2026-09-19 11:25:10', category: 'Login Log', userName: 'Dr. Vikramaditya Sen', userRole: 'Admin', action: 'User Authenticated via SSO', module: 'Auth', ipAddress: '192.168.1.102', status: 'SUCCESS', details: 'Multi-factor authentication verified successfully.' },
  { id: 'LOG-8802', timestamp: '2026-09-19 11:20:45', category: 'Action Log', userName: 'Nurse Priya Sharma', userRole: 'Nurse', action: 'Patient Admitted (Multi-Step Form)', module: 'Patient Management', ipAddress: '192.168.1.144', status: 'SUCCESS', details: 'Registered Patient P-1029 with assigned bed BED-01 in SICU-01.' },
  { id: 'LOG-8803', timestamp: '2026-09-19 11:15:22', category: 'User Activity', userName: 'Dr. Ananya Roy', userRole: 'Doctor', action: 'Clinical Note Added', module: 'Clinical Notes', ipAddress: '192.168.1.115', status: 'SUCCESS', details: 'Added round observations & PEEP titrations for P-1024.' },
  { id: 'LOG-8804', timestamp: '2026-09-19 10:55:00', category: 'Action Log', userName: 'Dr. Vikramaditya Sen', userRole: 'Admin', action: 'Bed Maintenance Status Changed', module: 'ICU & Bed Management', ipAddress: '192.168.1.102', status: 'WARNING', details: 'Marked BED-05 in MICU-01 under calibration maintenance.' },
  { id: 'LOG-8805', timestamp: '2026-09-19 10:30:12', category: 'Login Log', userName: 'Nurse Arjun Kulkarni', userRole: 'Nurse', action: 'Login Attempt', module: 'Auth', ipAddress: '192.168.1.199', status: 'FAILED', details: 'Incorrect password attempt (1 of 3).' },
  { id: 'LOG-8806', timestamp: '2026-09-19 10:12:05', category: 'User Activity', userName: 'Dr. Rahul Mehta', userRole: 'Doctor', action: 'Doctor Assigned to Patient', module: 'Doctor Management', ipAddress: '192.168.1.118', status: 'SUCCESS', details: 'Assigned Dr. Suresh Nair to Patient P-1026.' },
  { id: 'LOG-8807', timestamp: '2026-09-19 09:45:30', category: 'Action Log', userName: 'System Automated Engine', userRole: 'System', action: 'Data Export Generated', module: 'Export Data', ipAddress: '127.0.0.1', status: 'SUCCESS', details: 'Generated PDF summary of ICU Patient Census Report.' }
];

const initialState: LogState = {
  logs: INITIAL_LOGS,
  searchQuery: '',
  categoryFilter: 'ALL',
  statusFilter: 'ALL'
};

export const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    addLogEntry: (state, action: PayloadAction<Omit<SystemLogItem, 'id' | 'timestamp'>>) => {
      const newLog: SystemLogItem = {
        ...action.payload,
        id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      state.logs.unshift(newLog);
    },
    clearLogs: (state) => {
      state.logs = [];
    }
  }
});

export const { setSearchQuery, setCategoryFilter, setStatusFilter, addLogEntry, addLogEntry: addAuditLog, clearLogs } = logSlice.actions;
export default logSlice.reducer;
