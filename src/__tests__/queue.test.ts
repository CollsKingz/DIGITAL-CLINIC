import { describe, it, expect, beforeEach } from 'vitest';
import { ClinicService } from '../services/clinicService';
import { INITIAL_QUEUES } from '../services/mockData';

describe('Clinic Queue Service Machine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize and retrieve queue items', async () => {
    let items: any[] = [];
    ClinicService.subscribeQueue('clinic-central', (q) => {
      items = q;
    });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].ticketNumber).toBeDefined();
  });

  it('should advance patient queue stage through valid progression', async () => {
    const queueId = INITIAL_QUEUES[0].id;
    await ClinicService.updateQueueStage(queueId, 'At Consult', {
      assignedRoom: 'Consultation Room 3'
    });

    let items: any[] = [];
    ClinicService.subscribeQueue('clinic-central', (q) => {
      items = q;
    });

    const updated = items.find(i => i.id === queueId);
    expect(updated?.stage).toBe('At Consult');
    expect(updated?.assignedRoom).toBe('Consultation Room 3');
  });

  it('should successfully check in a new walk-in patient ticket', async () => {
    const newTicket = await ClinicService.checkInPatient({
      ticketNumber: 'A-999',
      clinicId: 'clinic-central',
      patientId: 'user-test-patient',
      patientName: 'Test Patient Walkin',
      stage: 'Checked In',
      priority: 'standard',
      estimatedWaitMins: 15
    });

    expect(newTicket.ticketNumber).toBe('A-999');
    expect(newTicket.stage).toBe('Checked In');
  });
});
