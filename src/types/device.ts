import { DataQuality } from './observation';

export type DeviceType = 'MONITOR' | 'VENTILATOR' | 'INFUSION_PUMP' | 'DIALYSIS' | 'LAB_GATEWAY';

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  bedId: string;
  bedNumber: string;
  gatewayId: string;
  ipAddress: string;
  protocol: string; // e.g., "HL7 v2.6", "IEEE 11073", "Modbus TCP"
  status: DataQuality;
  lastMessageTime: string;
  packetsPerMinute: number;
  errorRate: number; // percentage
}

export interface Gateway {
  id: string;
  name: string;
  unitId: string;
  ipAddress: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  uptimeSeconds: number;
  activeAdaptersCount: number;
  cpuUsage: number;
  memoryUsage: number;
  connectedDevicesCount: number;
}
