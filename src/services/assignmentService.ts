import { Assignment } from '../types/icu';
import { MOCK_ASSIGNMENTS } from '../data/mockData';
import { PatientService } from './patientService';
import { AuditService } from './auditService';

export class AssignmentService {
  private static assignments: Assignment[] = [...MOCK_ASSIGNMENTS];

  static getAllAssignments(): Assignment[] {
    return this.assignments;
  }

  static getActiveAssignments(): Assignment[] {
    return this.assignments.filter(a => a.status === 'ACTIVE');
  }

  static assignPatient(
    patientId: string,
    bedNumber: string,
    doctorId: string,
    doctorName: string,
    nurseId: string,
    nurseName: string,
    nurseRole: string,
    adminId: string,
    adminName: string
  ): Assignment {
    // Deactivate previous active assignment for this patient
    const prev = this.assignments.find(a => a.patientId === patientId && a.status === 'ACTIVE');
    if (prev) {
      prev.status = 'TRANSFERRED';
    }

    const newAssignment: Assignment = {
      id: `ASG-${Date.now()}`,
      patientId,
      bedNumber,
      doctorId,
      doctorName,
      nurseId,
      nurseName,
      nurseRole,
      assignedAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    this.assignments.unshift(newAssignment);

    // Update patient object
    const patient = PatientService.getPatientById(patientId);
    if (patient) {
      patient.bedNumber = bedNumber;
      patient.assignedClinicianId = doctorId;
      patient.assignedClinician = doctorName;
      patient.assignedNurseId = nurseId;
      patient.assignedNurse = nurseName;
      patient.assignedNurseRole = nurseRole;
    }

    AuditService.logAction(
      adminId,
      adminName,
      'SYSTEM_ADMIN',
      `Assigned Patient ${patientId} to Bed ${bedNumber}, Doctor ${doctorName}, Nurse ${nurseName}`,
      patientId,
      prev ? `${prev.doctorName} / ${prev.nurseName}` : 'Unassigned',
      `${doctorName} / ${nurseName}`
    );

    return newAssignment;
  }
}
