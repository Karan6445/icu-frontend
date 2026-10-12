import { AlertItem } from '../types/icu';
import { MOCK_ALERTS } from '../data/mockData';
import { AuditService } from './auditService';

export class AlertService {
  private static alerts: AlertItem[] = [...MOCK_ALERTS];

  static getAllAlerts(): AlertItem[] {
    return this.alerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  static getActiveAlerts(): AlertItem[] {
    return this.alerts.filter(a => a.status === 'ACTIVE');
  }

  static getAlertsForUserRole(role: string): AlertItem[] {
    return this.alerts.filter(
      a => a.recipients.includes(role) || a.recipients.includes('ALL') || role === 'SYSTEM_ADMIN'
    );
  }

  static getAlertsByPatient(patientId: string): AlertItem[] {
    return this.alerts.filter(a => a.patientId === patientId);
  }

  static acknowledgeAlert(
    alertId: string,
    staffId: string,
    staffName: string,
    staffRole: string,
    note?: string
  ): AlertItem | undefined {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return undefined;

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = staffName;
    alert.acknowledgedAt = new Date().toISOString();
    if (note) alert.ackNote = note;

    AuditService.logAction(
      staffId,
      staffName,
      staffRole,
      `Acknowledged Alert: ${alert.message}`,
      alert.patientId,
      'ACTIVE',
      'ACKNOWLEDGED'
    );

    return alert;
  }
}
