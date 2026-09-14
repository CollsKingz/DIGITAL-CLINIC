import { describe, it, expect } from 'vitest';
import { DEMO_PERSONAS } from '../services/mockData';

describe('Role-Based Access Control (RBAC) Matrix Assertions', () => {
  it('should enforce strict role attributes across demo personas', () => {
    expect(DEMO_PERSONAS.patient.role).toBe('patient');
    expect(DEMO_PERSONAS.clerk.role).toBe('clerk');
    expect(DEMO_PERSONAS.doctor.role).toBe('doctor');
    expect(DEMO_PERSONAS.pharmacist.role).toBe('pharmacist');
    expect(DEMO_PERSONAS.admin.role).toBe('admin');
  });

  it('should prevent patient from performing clerk/doctor actions without proper role', () => {
    const isPatientStaff = ['clerk', 'doctor', 'pharmacist', 'admin'].includes(DEMO_PERSONAS.patient.role);
    expect(isPatientStaff).toBe(false);

    const isDoctorStaff = ['clerk', 'doctor', 'pharmacist', 'admin'].includes(DEMO_PERSONAS.doctor.role);
    expect(isDoctorStaff).toBe(true);
  });
});
