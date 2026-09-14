import {
  UserProfile,
  HouseholdProxy,
  Clinic,
  Appointment,
  QueueItem,
  MedicationRequest,
  AppNotification
} from '../types/schema';

export const INITIAL_CLINICS: Clinic[] = [
  {
    id: 'clinic-central',
    name: 'Central Public Community Health Clinic',
    code: 'CPHC-01',
    address: '104 Healthcare Boulevard, District 4',
    phone: '+1 (555) 234-5678',
    operatingHours: 'Mon - Fri: 07:00 - 17:00 | Sat: 08:00 - 13:00',
    currentQueueCount: 14,
  },
  {
    id: 'clinic-westside',
    name: 'Westside Maternal & Chronic Care Clinic',
    code: 'WMCC-02',
    address: '89 Westside Avenue, Sector 7',
    phone: '+1 (555) 876-5432',
    operatingHours: 'Mon - Fri: 08:00 - 16:30',
    currentQueueCount: 6,
  }
];

export const DEMO_PERSONAS: Record<string, UserProfile> = {
  patient: {
    uid: 'user-patient-1',
    fullName: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '+1 (555) 912-3456',
    role: 'patient',
    clinicId: 'clinic-central',
    idNumber: 'ID-880412-5091-081',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00Z',
  },
  clerk: {
    uid: 'user-clerk-1',
    fullName: 'David Miller (Intake Clerk)',
    email: 'clerk.david@clinic.gov',
    phone: '+1 (555) 444-1122',
    role: 'clerk',
    clinicId: 'clinic-central',
    idNumber: 'EMP-CLK-042',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-05-15T08:00:00Z',
  },
  doctor: {
    uid: 'user-doctor-1',
    fullName: 'Dr. Elena Vance, MD',
    email: 'dr.vance@clinic.gov',
    phone: '+1 (555) 333-8899',
    role: 'doctor',
    clinicId: 'clinic-central',
    idNumber: 'MED-LIC-9902',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-03-20T08:00:00Z',
  },
  pharmacist: {
    uid: 'user-pharmacist-1',
    fullName: 'Pharm. Marcus Ray',
    email: 'marcus.pharmacy@clinic.gov',
    phone: '+1 (555) 222-7766',
    role: 'pharmacist',
    clinicId: 'clinic-central',
    idNumber: 'PHARM-LIC-3312',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-08-11T08:00:00Z',
  },
  admin: {
    uid: 'user-admin-1',
    fullName: 'Alex Morgan (Clinic Admin)',
    email: 'madihlabatc77@gmail.com',
    phone: '+1 (555) 999-0000',
    role: 'admin',
    clinicId: 'clinic-central',
    idNumber: 'ADM-SYS-001',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T08:00:00Z',
  }
};

export const INITIAL_PROXIES: HouseholdProxy[] = [
  {
    id: 'proxy-martha-1',
    primaryUserId: 'user-patient-1',
    fullName: 'Martha Jenkins (Mother)',
    relationship: 'parent',
    idNumber: 'ID-480911-0021-084',
    dateOfBirth: '1948-09-11',
    chronicConditions: 'Hypertension, Type 2 Diabetes, Osteoarthritis',
    allergies: 'Penicillin, Sulfa drugs',
    notes: 'Requires wheelchair assistance or bench seating near entrance.',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'proxy-leo-2',
    primaryUserId: 'user-patient-1',
    fullName: 'Leo Jenkins (Son)',
    relationship: 'child',
    idNumber: 'ID-180315-9921-088',
    dateOfBirth: '2018-03-15',
    chronicConditions: 'Pediatric Asthma',
    allergies: 'Peanuts',
    notes: 'Annual booster & inhaler checkup required.',
    createdAt: '2026-02-15T11:00:00Z',
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    clinicId: 'clinic-central',
    patientId: 'user-patient-1',
    patientName: 'Sarah Jenkins',
    serviceType: 'General Consult',
    reason: 'Persistent seasonal cough and mild chest tight tightness.',
    scheduledDate: '2026-09-14',
    timeSlot: '09:00 AM',
    status: 'in_queue',
    priority: 'standard',
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'apt-102',
    clinicId: 'clinic-central',
    patientId: 'user-patient-1',
    proxyId: 'proxy-martha-1',
    proxyName: 'Martha Jenkins (Mother)',
    isProxyBooking: true,
    patientName: 'Martha Jenkins (via Sarah)',
    serviceType: 'Chronic Refill',
    reason: 'Monthly Refill for Amlodipine & Metformin, BP blood pressure review.',
    scheduledDate: '2026-09-14',
    timeSlot: '10:30 AM',
    status: 'checked_in',
    priority: 'urgent',
    createdAt: '2026-09-11T14:20:00Z',
  },
  {
    id: 'apt-103',
    clinicId: 'clinic-central',
    patientId: 'user-patient-2',
    patientName: 'Robert Vance',
    serviceType: 'Vaccination',
    reason: 'Flu booster and tetanus shot renewal.',
    scheduledDate: '2026-09-15',
    timeSlot: '08:30 AM',
    status: 'scheduled',
    priority: 'low',
    createdAt: '2026-09-13T09:00:00Z',
  }
];

export const INITIAL_QUEUES: QueueItem[] = [
  {
    id: 'q-001',
    ticketNumber: 'A-101',
    clinicId: 'clinic-central',
    appointmentId: 'apt-101',
    patientId: 'user-patient-1',
    patientName: 'Sarah Jenkins',
    stage: 'At Consult',
    assignedRoom: 'Consultation Room 3',
    assignedStaff: 'Dr. Elena Vance, MD',
    vitals: {
      bloodPressureSys: 122,
      bloodPressureDia: 78,
      heartRatePulse: 74,
      temperatureC: 36.8,
      oxygenSatSpO2: 98,
      weightKg: 64.5,
      recordedBy: 'Nurse Clara',
      recordedAt: '08:45 AM'
    },
    doctorNotes: 'Lungs clear to auscultation. mild bronchospasm. Prescribed inhaler renewal.',
    priority: 'standard',
    estimatedWaitMins: 5,
    checkInTime: '2026-09-14T08:30:00Z',
    updatedAt: '2026-09-14T08:50:00Z'
  },
  {
    id: 'q-002',
    ticketNumber: 'A-102',
    clinicId: 'clinic-central',
    appointmentId: 'apt-102',
    patientId: 'user-patient-1',
    isProxy: true,
    proxyName: 'Martha Jenkins (Mother)',
    patientName: 'Martha Jenkins',
    stage: 'At Vitals',
    assignedRoom: 'Triage Station B',
    assignedStaff: 'Nurse Clara',
    vitals: {
      bloodPressureSys: 148,
      bloodPressureDia: 92,
      heartRatePulse: 82,
      temperatureC: 36.6,
      oxygenSatSpO2: 96,
      weightKg: 72.0,
      bloodGlucoseMmoll: 7.4,
      recordedBy: 'Nurse Clara',
      recordedAt: '09:10 AM'
    },
    priority: 'urgent',
    estimatedWaitMins: 12,
    checkInTime: '2026-09-14T09:00:00Z',
    updatedAt: '2026-09-14T09:10:00Z'
  },
  {
    id: 'q-003',
    ticketNumber: 'B-205',
    clinicId: 'clinic-central',
    patientId: 'user-patient-3',
    patientName: 'Evelyn Carter',
    stage: 'Checked In',
    assignedRoom: 'Waiting Lounge A',
    priority: 'standard',
    estimatedWaitMins: 25,
    checkInTime: '2026-09-14T09:15:00Z',
    updatedAt: '2026-09-14T09:15:00Z'
  },
  {
    id: 'q-004',
    ticketNumber: 'C-301',
    clinicId: 'clinic-central',
    patientId: 'user-patient-4',
    patientName: 'Michael Chang',
    stage: 'At Pharmacy',
    assignedRoom: 'Pharmacy Window 2',
    assignedStaff: 'Pharm. Marcus Ray',
    priority: 'standard',
    estimatedWaitMins: 8,
    checkInTime: '2026-09-14T08:00:00Z',
    updatedAt: '2026-09-14T09:05:00Z'
  },
  {
    id: 'q-005',
    ticketNumber: 'E-001',
    clinicId: 'clinic-central',
    patientId: 'user-patient-5',
    patientName: 'Samuel Dlamini',
    stage: 'Checked In',
    assignedRoom: 'Emergency Assessment Bay',
    priority: 'emergency',
    estimatedWaitMins: 0,
    checkInTime: '2026-09-14T09:25:00Z',
    updatedAt: '2026-09-14T09:25:00Z',
    paperworkFallbackNote: 'Manual paper card intake #9012 - Severe abdominal pain'
  }
];

export const INITIAL_MEDICATIONS: MedicationRequest[] = [
  {
    id: 'rx-501',
    clinicId: 'clinic-central',
    patientId: 'user-patient-1',
    patientName: 'Martha Jenkins (Proxy)',
    prescribedBy: 'Dr. Elena Vance, MD',
    medications: [
      {
        medicationName: 'Amlodipine Besylate',
        dosage: '10 mg',
        frequency: 'Once daily (Morning)',
        durationDays: 30,
        quantity: 30,
        instructions: 'Take with full glass of water after food.'
      },
      {
        medicationName: 'Metformin HCl',
        dosage: '850 mg',
        frequency: 'Twice daily',
        durationDays: 30,
        quantity: 60,
        instructions: 'Take with breakfast and dinner.'
      }
    ],
    isBatchPrepared: true,
    status: 'ready_for_pickup',
    collectionLockerOrCounter: 'Smart Locker #04 (Code: 8821)',
    requestDate: '2026-09-10',
    readyByDate: '2026-09-14',
    createdAt: '2026-09-10T11:00:00Z'
  },
  {
    id: 'rx-502',
    clinicId: 'clinic-central',
    patientId: 'user-patient-4',
    patientName: 'Michael Chang',
    prescribedBy: 'Dr. Elena Vance, MD',
    medications: [
      {
        medicationName: 'Amoxicillin Trihydrate',
        dosage: '500 mg',
        frequency: 'Three times daily',
        durationDays: 7,
        quantity: 21,
        instructions: 'Complete full 7-day course.'
      }
    ],
    isBatchPrepared: false,
    status: 'preparing',
    collectionLockerOrCounter: 'Pharmacy Counter #2',
    requestDate: '2026-09-14',
    readyByDate: '2026-09-14',
    createdAt: '2026-09-14T09:05:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-patient-1',
    title: 'Ticket Moved to Consult',
    body: 'Your ticket A-101 is now called into Consultation Room 3 with Dr. Elena Vance.',
    type: 'queue_update',
    read: false,
    createdAt: '2026-09-14T08:50:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-patient-1',
    title: 'Chronic Refill Ready for Pickup!',
    body: 'Medication request rx-501 for Martha Jenkins is ready at Smart Locker #04 (Code: 8821).',
    type: 'medication_ready',
    read: false,
    createdAt: '2026-09-14T09:12:00Z'
  }
];

export const INITIAL_PCS = [
  {
    id: 'pc-001',
    machineName: 'RECEPTION-DESK-PC-01',
    ipAddress: '192.168.10.42',
    macHostHash: 'B4-9821-PC-01',
    clinicId: 'clinic-central',
    roomOrDepartment: 'Main Reception & Intake',
    status: 'authorized' as const,
    authorizedBy: 'Alex Morgan (Admin)',
    authorizedAt: '2026-09-01T08:00:00Z',
    lastActiveAt: new Date().toISOString()
  },
  {
    id: 'pc-002',
    machineName: 'PHARMACY-DISPENSE-PC-02',
    ipAddress: '192.168.10.88',
    macHostHash: 'B4-9821-PC-02',
    clinicId: 'clinic-central',
    roomOrDepartment: 'Pharmacy Counter 2',
    status: 'authorized' as const,
    authorizedBy: 'Alex Morgan (Admin)',
    authorizedAt: '2026-09-02T09:15:00Z',
    lastActiveAt: new Date().toISOString()
  }
];

export const INITIAL_REGISTRATIONS = [
  {
    id: 'reg-001',
    fullName: 'Dr. Thabo Mbeki',
    email: 'thabo.mbeki@clinic.gov',
    phone: '+27 83 111 2233',
    requestedRole: 'doctor' as const,
    department: 'General Pediatrics',
    idNumber: '7804125091081',
    status: 'pending' as const,
    authProvider: 'google' as const,
    registeredAt: '2026-09-14T08:30:00Z'
  },
  {
    id: 'reg-002',
    fullName: 'Nomvula Zulu (Pharmacist Assistant)',
    email: 'nomvula.zulu@clinic.gov',
    phone: '+27 72 444 5566',
    requestedRole: 'pharmacist' as const,
    department: 'Chronic Batch Prep',
    idNumber: '8910120033089',
    status: 'approved' as const,
    authProvider: 'google' as const,
    registeredAt: '2026-09-13T14:10:00Z',
    approvedBy: 'Alex Morgan (Admin)'
  }
];
