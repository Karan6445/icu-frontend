import { TimelineItem, ChangeItem } from '../types/icu';
import { MOCK_TIMELINE_EVENTS, MOCK_CHANGES } from '../data/mockData';
import { ApiService } from './api';

export class TimelineService {
  static async getTimelineEvents(patientId: string): Promise<TimelineItem[]> {
    const res = await ApiService.get(`/api/timeline/${patientId}`, MOCK_TIMELINE_EVENTS);
    return res.data;
  }

  static async getChangeItems(patientId: string): Promise<ChangeItem[]> {
    const res = await ApiService.get(`/api/changes/${patientId}`, MOCK_CHANGES);
    return res.data;
  }
}
