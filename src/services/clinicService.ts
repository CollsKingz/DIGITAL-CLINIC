import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Appointment,
  QueueItem,
  MedicationRequest,
  HouseholdProxy,
  AppNotification,
  QueueStage
} from '../types/schema';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUES,
  INITIAL_MEDICATIONS,
  INITIAL_PROXIES,
  INITIAL_NOTIFICATIONS
} from './mockData';

// LOCAL STORAGE FALLBACK AGGREGATOR FOR INSTANT PREVIEW & FAULT-TOLERANCE
const STORAGE_KEYS = {
  APPOINTMENTS: 'dclinic_appointments',
  QUEUES: 'dclinic_queues',
  MEDICATIONS: 'dclinic_medications',
  PROXIES: 'dclinic_proxies',
  NOTIFICATIONS: 'dclinic_notifications'
};

function getLocalData<T>(key: string, initial: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`LocalStorage read failed for ${key}`, err);
    return initial;
  }
}

function setLocalData<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('dclinic_state_change'));
  } catch (err) {
    console.warn(`LocalStorage write failed for ${key}`, err);
  }
}

export class ClinicService {
  // --- APPOINTMENTS ---
  static async getAppointments(clinicId: string): Promise<Appointment[]> {
    const path = 'appointments';
    try {
      const q = query(collection(db, path), where('clinicId', '==', clinicId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
      }
    } catch (err) {
      console.warn("Firestore getAppointments error, using local state", err);
    }
    return getLocalData(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  static subscribeAppointments(clinicId: string, callback: (apts: Appointment[]) => void) {
    const path = 'appointments';
    try {
      const q = query(collection(db, path), where('clinicId', '==', clinicId));
      return onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
        callback(items);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      });
    } catch {
      // Fallback local listener
      const handler = () => {
        callback(getLocalData(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS));
      };
      window.addEventListener('dclinic_state_change', handler);
      handler();
      return () => window.removeEventListener('dclinic_state_change', handler);
    }
  }

  static async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const newId = `apt-${Date.now().toString().slice(-6)}`;
    const fullApt: Appointment = {
      ...appointment,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const path = `appointments/${newId}`;
    try {
      await setDoc(doc(db, 'appointments', newId), fullApt);
    } catch (err) {
      console.warn("Firestore createAppointment write fallback", err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }

    // Always keep local reactive state in sync
    const current = getLocalData<Appointment>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    setLocalData(STORAGE_KEYS.APPOINTMENTS, [fullApt, ...current]);
    return fullApt;
  }

  // --- QUEUES ---
  static subscribeQueue(clinicId: string, callback: (queue: QueueItem[]) => void) {
    const path = 'queues';
    try {
      const q = query(collection(db, path), where('clinicId', '==', clinicId));
      return onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueItem));
        callback(items);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      });
    } catch {
      const handler = () => {
        callback(getLocalData(STORAGE_KEYS.QUEUES, INITIAL_QUEUES));
      };
      window.addEventListener('dclinic_state_change', handler);
      handler();
      return () => window.removeEventListener('dclinic_state_change', handler);
    }
  }

  static async updateQueueStage(
    queueId: string,
    nextStage: QueueStage,
    updates: Partial<QueueItem> = {}
  ): Promise<void> {
    const path = `queues/${queueId}`;
    const payload = {
      stage: nextStage,
      updatedAt: new Date().toISOString(),
      ...updates
    };

    try {
      await updateDoc(doc(db, 'queues', queueId), payload);
    } catch (err) {
      console.warn("Firestore updateQueueStage error, syncing local store", err);
    }

    const items = getLocalData<QueueItem>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    const updated = items.map(q => q.id === queueId ? { ...q, ...payload } : q);
    setLocalData(STORAGE_KEYS.QUEUES, updated);
  }

  static async checkInPatient(queueData: Omit<QueueItem, 'id' | 'checkInTime' | 'updatedAt'>): Promise<QueueItem> {
    const newId = `q-${Date.now().toString().slice(-6)}`;
    const fullQueue: QueueItem = {
      ...queueData,
      id: newId,
      checkInTime: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'queues', newId), fullQueue);
    } catch (err) {
      console.warn("Firestore checkInPatient fallback", err);
    }

    const current = getLocalData<QueueItem>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    setLocalData(STORAGE_KEYS.QUEUES, [fullQueue, ...current]);
    return fullQueue;
  }

  // --- MEDICATION REQUESTS ---
  static subscribeMedications(clinicId: string, callback: (meds: MedicationRequest[]) => void) {
    const path = 'medication_requests';
    try {
      const q = query(collection(db, path), where('clinicId', '==', clinicId));
      return onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicationRequest));
        callback(items);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      });
    } catch {
      const handler = () => {
        callback(getLocalData(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS));
      };
      window.addEventListener('dclinic_state_change', handler);
      handler();
      return () => window.removeEventListener('dclinic_state_change', handler);
    }
  }

  static async updateMedicationStatus(
    requestId: string,
    status: MedicationRequest['status'],
    extras: Partial<MedicationRequest> = {}
  ): Promise<void> {
    const path = `medication_requests/${requestId}`;
    const payload = {
      status,
      ...extras
    };

    try {
      await updateDoc(doc(db, 'medication_requests', requestId), payload);
    } catch (err) {
      console.warn("Firestore updateMedicationStatus fallback", err);
    }

    const items = getLocalData<MedicationRequest>(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
    const updated = items.map(m => m.id === requestId ? { ...m, ...payload } : m);
    setLocalData(STORAGE_KEYS.MEDICATIONS, updated);
  }

  // --- HOUSEHOLD PROXIES ---
  static subscribeProxies(primaryUserId: string, callback: (proxies: HouseholdProxy[]) => void) {
    const handler = () => {
      const all = getLocalData<HouseholdProxy>(STORAGE_KEYS.PROXIES, INITIAL_PROXIES);
      callback(all.filter(p => p.primaryUserId === primaryUserId));
    };
    window.addEventListener('dclinic_state_change', handler);
    handler();
    return () => window.removeEventListener('dclinic_state_change', handler);
  }

  static async addProxy(proxy: Omit<HouseholdProxy, 'id' | 'createdAt'>): Promise<HouseholdProxy> {
    const newId = `proxy-${Date.now().toString().slice(-6)}`;
    const fullProxy: HouseholdProxy = {
      ...proxy,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const current = getLocalData<HouseholdProxy>(STORAGE_KEYS.PROXIES, INITIAL_PROXIES);
    setLocalData(STORAGE_KEYS.PROXIES, [fullProxy, ...current]);
    return fullProxy;
  }

  static async deleteProxy(proxyId: string): Promise<void> {
    const current = getLocalData<HouseholdProxy>(STORAGE_KEYS.PROXIES, INITIAL_PROXIES);
    setLocalData(STORAGE_KEYS.PROXIES, current.filter(p => p.id !== proxyId));
  }

  // --- NOTIFICATIONS ---
  static subscribeNotifications(userId: string, callback: (notifs: AppNotification[]) => void) {
    const handler = () => {
      const all = getLocalData<AppNotification>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      callback(all.filter(n => n.userId === userId));
    };
    window.addEventListener('dclinic_state_change', handler);
    handler();
    return () => window.removeEventListener('dclinic_state_change', handler);
  }

  static async sendNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now().toString().slice(-6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const current = getLocalData<AppNotification>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...current]);
  }

  static async markNotificationRead(id: string): Promise<void> {
    const current = getLocalData<AppNotification>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, updated);
  }
}
