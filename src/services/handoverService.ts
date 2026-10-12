import { HandoverRecord } from '../types/icu';
import { MOCK_HANDOVERS } from '../data/mockData';
import { AuditService } from './auditService';

export class HandoverService {
  private static handovers: HandoverRecord[] = [...MOCK_HANDOVERS];

  static getHandoversForPatient(patientId: string): HandoverRecord[] {
    return this.handovers
      .filter(h => h.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static createShiftHandover(
    patientId: string,
    previousDoctorId: string,
    previousDoctorName: string,
    previousNurseId: string,
    previousNurseName: string,
    newDoctorId: string,
    newDoctorName: string,
    newNurseId: string,
    newNurseName: string,
    shiftStart: string,
    shiftEnd: string,
    handoverSummary: string,
    recentVitalsSummary: string,
    recentDoctorNotesSummary: string,
    recentNurseNotesSummary: string,
    medicineSummary: string,
    activeAlertsCount: number
  ): HandoverRecord {
    const record: HandoverRecord = {
      id: `HND-${Date.now()}`,
      patientId,
      previousDoctorId,
      previousDoctorName,
      previousNurseId,
      previousNurseName,
      newDoctorId,
      newDoctorName,
      newNurseId,
      newNurseName,
      shiftStart,
      shiftEnd,
      handoverSummary,
      recentVitalsSummary,
      recentDoctorNotesSummary,
      recentNurseNotesSummary,
      medicineSummary,
      activeAlertsCount,
      createdAt: new Date().toISOString()
    };

    this.handovers.unshift(record);

    AuditService.logAction(
      previousDoctorId,
      previousDoctorName,
      'DOCTOR',
      `Created Shift Handover for Patient ${patientId} to Doctor ${newDoctorName} & Nurse ${newNurseName}`,
      patientId,
      `${previousDoctorName} / ${previousNurseName}`,
      `${newDoctorName} / ${newNurseName}`
    );

    return record;
  }
}
