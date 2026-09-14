/**
 * Digital Clinic App - Core Domain Types & Schemas
 */

export type UserRole = 'patient' | 'clerk' | 'pharmacist' | 'doctor' | 'admin';

export type QueueStage =
  | 'Checked In'
  | 'At Vitals'
  | 'At Consult'
  | 'At Pharmacy'
  | 'Completed'
  | 'Transferred';

export type PriorityLevel = 'low' | 'standard' | 'urgent' | 'emergency';

export type ServiceType =
  | 'General Consult'
  | 'Chronic Refill'
  | 'Vaccination'
  | 'Antenatal'
  | 'Vitals Check'
  | 'Emergency Triage';

export type AppointmentStatus =
  | 'scheduled'
  | 'checked_in'
  | 'in_queue'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type MedicationStatus =
  | 'requested'
  | 'preparing'
  | 'ready_for_pickup'
  | 'collected'
  | 'expired'
  | 'cancelled';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  clinicId?: string;
  idNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HouseholdProxy {
  id: string;
  primaryUserId: string;
  fullName: string;
  relationship: 'parent' | 'grandparent' | 'child' | 'spouse' | 'other';
  idNumber?: string;
  dateOfBirth?: string;
  chronicConditions?: string;
  allergies?: string;
  notes?: string;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  operatingHours: string;
  currentQueueCount: number;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  proxyId?: string;
  proxyName?: string;
  isProxyBooking?: boolean;
  serviceType: ServiceType;
  reason: string;
  scheduledDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  priority: PriorityLevel;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientVitals {
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  heartRatePulse?: number;
  temperatureC?: number;
  oxygenSatSpO2?: number;
  weightKg?: number;
  bloodGlucoseMmoll?: number;
  recordedBy?: string;
  recordedAt?: string;
  notes?: string;
}

export interface QueueItem {
  id: string;
  ticketNumber: string;
  clinicId: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  isProxy?: boolean;
  proxyName?: string;
  stage: QueueStage;
  assignedRoom?: string;
  assignedStaff?: string;
  vitals?: PatientVitals;
  doctorNotes?: string;
  diagnosis?: string;
  priority: PriorityLevel;
  estimatedWaitMins: number;
  checkInTime: string;
  updatedAt: string;
  paperworkFallbackNote?: string;
}

export interface MedicationItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions?: string;
}

export interface MedicationRequest {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  prescribedBy: string;
  medications: MedicationItem[];
  isBatchPrepared: boolean;
  status: MedicationStatus;
  collectionLockerOrCounter?: string;
  requestDate: string;
  readyByDate?: string;
  collectedAt?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'queue_update' | 'appointment_reminder' | 'medication_ready' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: UserRole;
  action: string;
  entityType: 'queue' | 'appointment' | 'medication' | 'user';
  entityId: string;
  timestamp: string;
  details?: string;
}

export interface AuthorizedPC {
  id: string;
  machineName: string;
  ipAddress: string;
  macHostHash: string;
  clinicId: string;
  roomOrDepartment: string;
  status: 'authorized' | 'pending' | 'revoked';
  authorizedBy?: string;
  authorizedAt?: string;
  lastActiveAt: string;
  authToken?: string;
}

export interface MemberRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestedRole: UserRole;
  department?: string;
  idNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  authProvider: 'google' | 'email';
  registeredAt: string;
  approvedBy?: string;
}

export interface VercelConfig {
  projectId: string;
  projectName: string;
  deploymentUrl: string;
  environment: 'production' | 'preview';
  status: 'connected' | 'deploying' | 'disconnected';
  lastDeployedAt?: string;
  autoSyncEnv: boolean;
}
