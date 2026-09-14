import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { Appointment, QueueItem, QueueStage } from '../../types/schema';
import {
  Clock,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Calendar,
  XCircle,
  Activity,
  ArrowRight
} from 'lucide-react';

export const MyAppointments: React.FC = () => {
  const { user, clinic } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    const unsubApt = ClinicService.subscribeAppointments(clinic.id, (items) => {
      setAppointments(items.filter(a => a.patientId === user.uid));
    });

    const unsubQueue = ClinicService.subscribeQueue(clinic.id, (items) => {
      setQueues(items.filter(q => q.patientId === user.uid));
    });

    return () => {
      unsubApt();
      unsubQueue();
    };
  }, [clinic.id, user.uid]);

  const activeQueue = queues.find(q => q.stage !== 'Completed');

  const STAGES: QueueStage[] = ['Checked In', 'At Vitals', 'At Consult', 'At Pharmacy', 'Completed'];

  const getStageIndex = (stage: QueueStage) => {
    const idx = STAGES.indexOf(stage);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6">

      {/* Active Live Queue Ticket Card */}
      {activeQueue ? (
        <div className="bg-linear-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Digital Ticket</span>
              </div>
              <h3 className="text-2xl font-black mt-1 text-white">Ticket #{activeQueue.ticketNumber}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeQueue.isProxy ? `Proxy Patient: ${activeQueue.proxyName}` : `Patient: ${activeQueue.patientName}`}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <Clock className="w-5 h-5 text-teal-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Wait</span>
                <span className="text-sm font-bold text-white">
                  {activeQueue.estimatedWaitMins > 0 ? `~${activeQueue.estimatedWaitMins} Minutes` : 'Call Immediate'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Queue Stage Tracker */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Live Progress Stage</span>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {STAGES.map((stg, i) => {
                const currentIdx = getStageIndex(activeQueue.stage);
                const isPassed = i <= currentIdx;
                const isCurrent = i === currentIdx;

                return (
                  <div key={stg} className="text-center">
                    <div className={`h-2 rounded-full mb-2 transition-all ${
                      isCurrent ? 'bg-teal-400 shadow-lg shadow-teal-400/50' : isPassed ? 'bg-emerald-500' : 'bg-slate-800'
                    }`} />
                    <span className={`text-[10px] sm:text-xs font-semibold block truncate ${
                      isCurrent ? 'text-teal-300 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {stg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Location or Room */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Station / Room</span>
              <span className="text-xs font-bold text-teal-300">
                {activeQueue.assignedRoom || 'Awaiting Station Assignment'}
              </span>
            </div>
            <button
              onClick={() => setShowQR(activeQueue.ticketNumber)}
              className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-medium flex items-center space-x-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Show QR Ticket</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-teal-50/60 rounded-3xl p-6 border border-teal-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">No Active Ticket in Live Queue</h4>
              <p className="text-[11px] text-slate-500">Book an appointment or check in to join today's clinic queue.</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal Preview */}
      {showQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Clinic Scanner Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">Present this code at the reception kiosk</p>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block mb-4">
              <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
              <span className="text-sm font-extrabold text-teal-600 mt-2 block tracking-widest">{showQR}</span>
            </div>

            <button
              onClick={() => setShowQR(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs cursor-pointer"
            >
              Close Ticket
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>My Booked Appointments ({appointments.length})</span>
          </h3>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            You have no appointments booked yet. Use the booking tab above to schedule one.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900">{apt.serviceType}</span>
                    {apt.isProxyBooking && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
                        Proxy: {apt.proxyName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{apt.reason}</p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                    <span>📅 {apt.scheduledDate}</span>
                    <span>⏰ {apt.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    apt.status === 'in_queue' ? 'bg-teal-100 text-teal-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
