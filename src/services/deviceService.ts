import { DeviceItem } from '../types/icu';
import { MOCK_DEVICES } from '../data/mockData';
import { ApiService } from './api';

export interface GatewayHealth {
  id: string;
  unit: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  ipAddress: string;
  connectedDevices: number;
  packetsPerSec: number;
  latencyMs: number;
}

export class DeviceService {
  static async getDevices(): Promise<DeviceItem[]> {
    const res = await ApiService.get('/api/devices', MOCK_DEVICES);
    return res.data;
  }

  static getDevicesSync(): DeviceItem[] {
    return MOCK_DEVICES;
  }

  static getGateways(): GatewayHealth[] {
    return [
      {
        id: 'GW-MICU-01',
        unit: 'MICU-01',
        status: 'ONLINE',
        ipAddress: '10.140.4.1',
        connectedDevices: 36,
        packetsPerSec: 240,
        latencyMs: 12
      },
      {
        id: 'GW-SICU-01',
        unit: 'SICU-01',
        status: 'ONLINE',
        ipAddress: '10.140.5.1',
        connectedDevices: 28,
        packetsPerSec: 180,
        latencyMs: 15
      }
    ];
  }
}
