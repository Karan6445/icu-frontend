import { useState, useEffect } from 'react';
import { WebSocketService, RealtimeVitalUpdate } from '../services/websocket';
import { VitalSet } from '../types/observation';

export function useRealtimeObservations(patientId: string, initialVitals?: VitalSet) {
  const [vitals, setVitals] = useState<VitalSet>(initialVitals || {
    hr: 104,
    spo2: 91,
    bpSystolic: 108,
    bpDiastolic: 64,
    map: 78,
    rr: 27,
    temp: 38.2,
    quality: 'LIVE',
    timestamp: '12:41:34'
  });

  const [lastUpdate, setLastUpdate] = useState<string>(vitals.timestamp);

  useEffect(() => {
    const unsubscribe = WebSocketService.subscribe((update: RealtimeVitalUpdate) => {
      if (update.patientId === patientId || patientId === 'P-1024') {
        setVitals(prev => ({
          ...prev,
          hr: update.hr,
          spo2: update.spo2,
          bpSystolic: update.bpSystolic,
          bpDiastolic: update.bpDiastolic,
          rr: update.rr,
          quality: update.quality,
          timestamp: update.timestamp
        }));
        setLastUpdate(update.timestamp);
      }
    });

    return () => unsubscribe();
  }, [patientId]);

  return { vitals, lastUpdate };
}
