import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { ServiceType, PriorityLevel, HouseholdProxy } from '../../types/schema';
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react';

export const AppointmentBooking: React.FC<{ onBookingSuccess?: () => void }> = ({ onBookingSuccess }) => {
  const { user, clinic, sendAlert } = useAuth();
  const [proxies, setProxies] = useState<HouseholdProxy[]>([]);

  // Form fields
  const [bookingFor, setBookingFor] = useState<'self' | string>('self');
  const [serviceType, setServiceType] = useState<ServiceType>('General Consult');
  const [reason, setReason] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:30 AM');
  const [priority, setPriority] = useState<PriorityLevel>('standard');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ClinicService.subscribeProxies(user.uid, setProxies);
    return () => unsub();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      const selectedProxy = proxies.find(p => p.id === bookingFor);
      const isProxy = bookingFor !== 'self' && !!selectedProxy;

      const newApt = await ClinicService.createAppointment({
        clinicId: clinic.id,
        patientId: user.uid,
        patientName: isProxy ? selectedProxy.fullName : user.fullName,
        proxyId: isProxy ? selectedProxy.id : undefined,
        proxyName: isProxy ? `${selectedProxy.fullName} (${selectedProxy.relationship})` : undefined,
        isProxyBooking: isProxy,
        serviceType,
        reason,
        scheduledDate,
        timeSlot,
        status: 'scheduled',
        priority
      });

      // Automatically generate a check-in ticket if booking for today
      const isToday = scheduledDate === new Date().toISOString().split('T')[0];
      if (isToday) {
        const ticketNum = `${serviceType.slice(0,1).toUpperCase()}-${Math.floor(100 + Math.random() * 800)}`;
        await ClinicService.checkInPatient({
          ticketNumber: ticketNum,
          clinicId: clinic.id,
          appointmentId: newApt.id,
          patientId: user.uid,
          patientName: isProxy ? selectedProxy.fullName : user.fullName,
          isProxy,
          proxyName: isProxy ? selectedProxy.fullName : undefined,
          stage: 'Checked In',
          priority,
          estimatedWaitMins: priority === 'emergency' ? 0 : 20,
        });

        await sendAlert(
          `Checked In: Ticket #${ticketNum}`,
          `Appointment confirmed for ${isProxy ? selectedProxy.fullName : user.fullName}. Your ticket ${ticketNum} is active in queue.`,
          user.uid
        );
      }

      setSuccessMsg(`Appointment booked successfully! ${isToday ? 'You are checked into today\'s live queue.' : 'Reminder added.'}`);
      setReason('');
      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Book Clinic Visit or Service</h2>
          <p className="text-xs text-slate-500">Fast digital intake for yourself or elderly/vulnerable family members</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Booking Target (Self vs Household Proxy) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Who is this appointment for?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBookingFor('self')}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                bookingFor === 'self'
                  ? 'border-teal-500 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User className="w-5 h-5 text-teal-600" />
              <div>
                <span className="font-semibold text-xs block">{user.fullName} (Myself)</span>
                <span className="text-[10px] text-slate-500">Primary Registered Patient</span>
              </div>
            </button>

            {proxies.map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => setBookingFor(p.id)}
                className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  bookingFor === p.id
                    ? 'border-teal-500 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-semibold text-xs block">{p.fullName}</span>
                  <span className="text-[10px] text-slate-500">Proxy Dependent ({p.relationship})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Service Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Required Service / Reason category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              'General Consult',
              'Chronic Refill',
              'Vaccination',
              'Antenatal',
              'Vitals Check',
              'Emergency Triage'
            ].map(st => (
              <button
                type="button"
                key={st}
                onClick={() => setServiceType(st as ServiceType)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  serviceType === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden cursor-pointer bg-white"
            >
              {['08:00 AM', '09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Urgency / Priority Status
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'standard', label: 'Standard Visit', class: 'border-slate-200 text-slate-700 bg-white' },
              { id: 'urgent', label: 'Urgent Care (High Fever / Pain)', class: 'border-amber-200 text-amber-800 bg-amber-50' },
              { id: 'emergency', label: 'Emergency Priority', class: 'border-rose-200 text-rose-800 bg-rose-50' },
            ].map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => setPriority(p.id as PriorityLevel)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  priority === p.id ? 'ring-2 ring-teal-500/40 font-bold border-teal-500' : p.class
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visit Reason Details */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Symptoms / Purpose of Visit
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe symptoms, requested medication refills, or special assistance needed..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-normal focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !reason.trim()}
          className="w-full py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <span>Processing Digital Intake...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Confirm & Issue Queue Ticket</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
