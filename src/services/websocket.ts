type Listener<T> = (data: T) => void;

export interface RealtimeVitalUpdate {
  patientId: string;
  hr: number;
  spo2: number;
  bpSystolic: number;
  bpDiastolic: number;
  map: number;
  rr: number;
  temp: number;
  quality: 'LIVE' | 'DELAYED' | 'STALE' | 'DISCONNECTED';
  timestamp: string;
}

export class WebSocketService {
  private static listeners: Set<Listener<RealtimeVitalUpdate>> = new Set();
  private static intervalId: any = null;
  private static isConnected: boolean = true;

  static subscribe(listener: Listener<RealtimeVitalUpdate>): () => void {
    this.listeners.add(listener);
    if (!this.intervalId) {
      this.startSimulator();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopSimulator();
      }
    };
  }

  static getIsConnected(): boolean {
    return this.isConnected;
  }

  static toggleConnection(): boolean {
    this.isConnected = !this.isConnected;
    return this.isConnected;
  }

  private static startSimulator() {
    this.intervalId = setInterval(() => {
      if (!this.isConnected) return;

      // Small natural micro-variations
      const hrFluctuation = Math.floor(Math.random() * 3) - 1;
      const spo2Fluctuation = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const rrFluctuation = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;

      const now = new Date();
      const timestampString = now.toTimeString().split(' ')[0];

      const update: RealtimeVitalUpdate = {
        patientId: 'P-1024',
        hr: Math.max(90, Math.min(115, 104 + hrFluctuation)),
        spo2: Math.max(88, Math.min(96, 91 + spo2Fluctuation)),
        bpSystolic: 108 + Math.floor(Math.random() * 3) - 1,
        bpDiastolic: 64 + Math.floor(Math.random() * 3) - 1,
        map: 78,
        rr: Math.max(22, Math.min(32, 27 + rrFluctuation)),
        temp: 38.2,
        quality: 'LIVE',
        timestamp: timestampString
      };

      this.listeners.forEach(listener => listener(update));
    }, 2000);
  }

  private static stopSimulator() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
