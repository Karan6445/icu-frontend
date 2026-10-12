import { AuditLog } from '../types/icu';
import { MOCK_AUDIT_LOGS } from '../data/mockData';

export class AuditService {
  private static logs: AuditLog[] = [...MOCK_AUDIT_LOGS];

  static getAllLogs(): AuditLog[] {
    return this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static getLogsByPatient(patientId: string): AuditLog[] {
    return this.logs.filter(l => l.patientId === patientId);
  }

  static logAction(
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    patientId?: string,
    previousValue?: string,
    newValue?: string
  ): AuditLog {
    const log: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole,
      patientId,
      action,
      previousValue,
      newValue
    };

    // Append-only history!
    this.logs.unshift(log);
    return log;
  }
}
