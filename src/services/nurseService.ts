import { NurseNote, OrganAssessment } from '../types/icu';
import { MOCK_NURSE_NOTES } from '../data/mockData';
import { AuditService } from './auditService';

export class NurseService {
  private static nurseNotes: NurseNote[] = [...MOCK_NURSE_NOTES];

  static getNurseNotes(patientId: string): NurseNote[] {
    return this.nurseNotes
      .filter(n => n.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static addNurseCareRecord(
    patientId: string,
    nurseId: string,
    nurseName: string,
    nurseRole: string,
    observation: string,
    personalCare: string,
    positionChange: string,
    mobility: string,
    fluidMonitoring: string,
    generalNotes: string,
    organAssessment?: OrganAssessment
  ): NurseNote {
    const newNote: NurseNote = {
      id: `NN-${Date.now()}`,
      patientId,
      nurseId,
      nurseName,
      nurseRole,
      timestamp: new Date().toISOString(),
      observation,
      personalCare,
      positionChange,
      mobility,
      fluidMonitoring,
      generalNotes,
      organAssessment
    };

    // Append-only history - never overwrite old notes!
    this.nurseNotes.unshift(newNote);

    AuditService.logAction(
      nurseId,
      nurseName,
      nurseRole,
      `Recorded Nurse Care Note & Organ Assessment`,
      patientId,
      undefined,
      observation
    );

    return newNote;
  }
}
