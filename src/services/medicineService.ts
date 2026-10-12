import { MedicationItem, MedicationStatus } from '../types/icu';
import { MOCK_MEDICATIONS } from '../data/mockData';
import { AuditService } from './auditService';

export class MedicineService {
  private static medications: MedicationItem[] = [...MOCK_MEDICATIONS];

  static getMedications(patientId: string): MedicationItem[] {
    return this.medications.filter(m => m.patientId === patientId);
  }

  static updateMedicationStatus(
    medicationId: string,
    newStatus: MedicationStatus,
    staffId: string,
    staffName: string,
    staffRole: string,
    note?: string
  ): MedicationItem | undefined {
    const med = this.medications.find(m => m.id === medicationId);
    if (!med) return undefined;

    const prevStatus = med.status;
    med.status = newStatus;
    if (newStatus === 'ADMINISTERED' || newStatus === 'DELAYED') {
      med.administeredBy = staffName;
      med.administeredById = staffId;
      med.administeredByRole = staffRole;
      med.administeredAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (note) med.note = note;

    AuditService.logAction(
      staffId,
      staffName,
      staffRole,
      `Medication Status Change: ${med.medicineName} (${newStatus})`,
      med.patientId,
      prevStatus,
      newStatus
    );

    return med;
  }
}
