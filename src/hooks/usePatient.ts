import { useState, useEffect } from 'react';
import { Patient } from '../types/icu';
import { PatientService } from '../services/patientService';

export function usePatient(patientId: string | undefined) {
  const [patient, setPatient] = useState<Patient | undefined>(() => 
    patientId ? PatientService.getPatientById(patientId) : undefined
  );
  const [loading, setLoading] = useState<boolean>(!patient);

  useEffect(() => {
    if (patientId) {
      const found = PatientService.getPatientById(patientId);
      setPatient(found);
      setLoading(false);
    }
  }, [patientId]);

  return { patient, loading };
}
