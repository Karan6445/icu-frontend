import { DoctorNote, ClinicalStatus } from '../types/icu';
import { MOCK_DOCTOR_NOTES } from '../data/mockData';
import { AuditService } from './auditService';

export class DoctorService {
  private static doctorNotes: DoctorNote[] = [...MOCK_DOCTOR_NOTES];

  static getDoctorNotes(patientId: string): DoctorNote[] {
    return this.doctorNotes
      .filter(n => n.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static addDoctorCheckup(
    patientId: string,
    doctorId: string,
    doctorName: string,
    checkupType: 'Morning Round' | 'Evening Round' | 'Emergency Checkup' | 'Routine Checkup',
    generalObservation: string,
    clinicalNotes: string,
    condition: ClinicalStatus,
    doctorRemark: string
  ): DoctorNote {
    const newNote: DoctorNote = {
      id: `DN-${Date.now()}`,
      patientId,
      doctorId,
      doctorName,
      timestamp: new Date().toISOString(),
      checkupType,
      generalObservation,
      clinicalNotes,
      condition,
      doctorRemark
    };

    // Append-only history - never overwrite old notes!
    this.doctorNotes.unshift(newNote);

    AuditService.logAction(
      doctorId,
      doctorName,
      'DOCTOR',
      `Recorded Patient Checkup (${checkupType}) & Doctor Remark`,
      patientId,
      undefined,
      doctorRemark
    );

    return newNote;
  }
}
