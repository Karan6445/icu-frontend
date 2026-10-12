import { describe, it, expect } from 'vitest';
import superAdminReducer, {
  addHospital,
  updateDoctorRemark,
  updateNurseRemark
} from './superAdminSlice';

describe('SuperAdminSlice Reducer and Hospital Management', () => {
  const initialState = superAdminReducer(undefined, { type: '@@INIT' });

  it('initializes with default mock hospitals, doctors, and nurses', () => {
    expect(initialState.hospitals.length).toBeGreaterThan(0);
    expect(initialState.doctors.length).toBeGreaterThan(0);
    expect(initialState.nurses.length).toBeGreaterThan(0);
  });

  it('correctly adds a new hospital network node', () => {
    const prevHospitalCount = initialState.hospitals.length;
    const newState = superAdminReducer(
      initialState,
      addHospital({
        name: 'AIIMS Test Hospital',
        code: 'TEST-HOSP-01',
        district: 'Patna',
        state: 'Bihar',
        type: 'Super Specialty Center',
        address: 'Healthcare Hub',
        contactNumber: '+91 98765 43210',
        email: 'contact@test.gov.in',
        totalBeds: 150,
        occupiedBeds: 90,
        availableBeds: 60,
        totalICUBeds: 30,
        availableICUBeds: 12,
        occupiedICUBeds: 18,
        reservedICUBeds: 2,
        maintenanceICUBeds: 1,
        doctorsCount: 15,
        nursesCount: 40,
        patientsCount: 18,
        status: 'Active'
      })
    );

    expect(newState.hospitals.length).toBe(prevHospitalCount + 1);
    const added = newState.hospitals[0];
    expect(added.name).toBe('AIIMS Test Hospital');
    expect(added.code).toBe('TEST-HOSP-01');
    expect(added.totalBeds).toBe(150);
    expect(added.totalICUBeds).toBe(30);
  });

  it('logs remark history when updating doctor remarks', () => {
    const firstDoctor = initialState.doctors[0];
    const newState = superAdminReducer(
      initialState,
      updateDoctorRemark({
        doctorId: firstDoctor.id,
        updatedRemark: 'Commended for excellent telemetry shift management.',
        updatedBy: 'Dr. Vikramaditya Sen'
      })
    );

    const updatedDoc = newState.doctors.find(d => d.id === firstDoctor.id);
    expect(updatedDoc?.remarks).toBe('Commended for excellent telemetry shift management.');
    expect(updatedDoc?.remarkHistory.length).toBeGreaterThan(0);
    expect(updatedDoc?.remarkHistory[0].updatedBy).toBe('Dr. Vikramaditya Sen');
  });

  it('logs remark history when updating nurse remarks', () => {
    const firstNurse = initialState.nurses[0];
    const newState = superAdminReducer(
      initialState,
      updateNurseRemark({
        nurseId: firstNurse.id,
        updatedRemark: 'Zero CLABSI rate acknowledged by directorate.',
        updatedBy: 'Dr. Vikramaditya Sen'
      })
    );

    const updatedNurse = newState.nurses.find(n => n.id === firstNurse.id);
    expect(updatedNurse?.remarks).toBe('Zero CLABSI rate acknowledged by directorate.');
    expect(updatedNurse?.remarkHistory.length).toBeGreaterThan(0);
    expect(updatedNurse?.remarkHistory[0].updatedBy).toBe('Dr. Vikramaditya Sen');
  });
});
