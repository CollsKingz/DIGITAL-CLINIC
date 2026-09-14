import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { Appointment } from '../../types/schema';
import { Calendar, UserCheck, Clock, CheckCircle2 } from 'lucide-react';

export const IntakeSchedule: React.FC = () => {
  const { clinic, sendAlert } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const unsub = ClinicService.subscribeAppointments(clinic.id, (items) => {
      setAppointments(items);
    });
    return () => unsub();
  }, [clinic.id]);

  const handleCheckInScheduled = async (apt: Appointment) => {
    const ticketNum = `${apt.serviceType.slice(0, 1).toUpperCase()}-${Math.floor(100 + Math.random() * 800)}`;
    await ClinicService.checkInPatient({
      ticketNumber: ticketNum,
      clinicId: clinic.id,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      isProxy: apt.isProxyBooking,
      proxyName: apt.proxyName,
      stage: 'Checked In',
      priority: apt.priority,
      estimatedWaitMins: 15,
      assignedRoom: 'Waiting Lounge'
    });

    await sendAlert(
      `Checked In at Clinic Reception`,
      `Your scheduled appointment for ${apt.patientName} has been checked in. Active Ticket #${ticketNum}.`,
      apt.patientId
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Today's Intake Roster</h2>
          <p className="text-xs text-slate-500">Scheduled appointments awaiting reception check-in</p>
        </div>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            No scheduled appointments found for today.
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{apt.patientName}</span>
                  {apt.isProxyBooking && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      Proxy: {apt.proxyName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{apt.serviceType} — {apt.reason}</p>
                <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-400">
                  <span>⏰ {apt.timeSlot}</span>
                  <span>📅 {apt.scheduledDate}</span>
                </div>
              </div>

              <div>
                {apt.status === 'scheduled' ? (
                  <button
                    onClick={() => handleCheckInScheduled(apt)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Check In & Issue Ticket</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Checked In
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
