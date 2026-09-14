import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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

const appointmentValidationSchema = Yup.object({
  bookingFor: Yup.string().required('Please select who this appointment is for'),
  serviceType: Yup.string().required('Please select a service type'),
  scheduledDate: Yup.string()
    .required('Target date is required')
    .test('not-past-date', 'Date cannot be in the past', (value) => {
      if (!value) return false;
      const today = new Date().toISOString().split('T')[0];
      return value >= today;
    }),
  timeSlot: Yup.string().required('Preferred time slot is required'),
  priority: Yup.string().required('Priority level is required'),
  reason: Yup.string()
    .trim()
    .required('Symptoms or purpose of visit is required')
    .min(5, 'Please provide at least 5 characters describing your symptoms or visit reason')
});

export const AppointmentBooking: React.FC<{ onBookingSuccess?: () => void }> = ({ onBookingSuccess }) => {
  const { user, clinic, sendAlert } = useAuth();
  const [proxies, setProxies] = useState<HouseholdProxy[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ClinicService.subscribeProxies(user.uid, setProxies);
    return () => unsub();
  }, [user.uid]);

  const formik = useFormik({
    initialValues: {
      bookingFor: 'self',
      serviceType: 'General Consult' as ServiceType,
      scheduledDate: new Date().toISOString().split('T')[0],
      timeSlot: '09:30 AM',
      priority: 'standard' as PriorityLevel,
      reason: ''
    },
    validationSchema: appointmentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      setSuccessMsg(null);
      try {
        const selectedProxy = proxies.find(p => p.id === values.bookingFor);
        const isProxy = values.bookingFor !== 'self' && !!selectedProxy;

        const newApt = await ClinicService.createAppointment({
          clinicId: clinic.id,
          patientId: user.uid,
          patientName: isProxy ? selectedProxy.fullName : user.fullName,
          proxyId: isProxy ? selectedProxy.id : undefined,
          proxyName: isProxy ? `${selectedProxy.fullName} (${selectedProxy.relationship})` : undefined,
          isProxyBooking: isProxy,
          serviceType: values.serviceType,
          reason: values.reason,
          scheduledDate: values.scheduledDate,
          timeSlot: values.timeSlot,
          status: 'scheduled',
          priority: values.priority
        });

        // Automatically generate a check-in ticket if booking for today
        const isToday = values.scheduledDate === new Date().toISOString().split('T')[0];
        if (isToday) {
          const ticketNum = `${values.serviceType.slice(0,1).toUpperCase()}-${Math.floor(100 + Math.random() * 800)}`;
          await ClinicService.checkInPatient({
            ticketNumber: ticketNum,
            clinicId: clinic.id,
            appointmentId: newApt.id,
            patientId: user.uid,
            patientName: isProxy ? selectedProxy.fullName : user.fullName,
            isProxy,
            proxyName: isProxy ? selectedProxy.fullName : undefined,
            stage: 'Checked In',
            priority: values.priority,
            estimatedWaitMins: values.priority === 'emergency' ? 0 : 20,
          });

          await sendAlert(
            `Checked In: Ticket #${ticketNum}`,
            `Appointment confirmed for ${isProxy ? selectedProxy.fullName : user.fullName}. Your ticket ${ticketNum} is active in queue.`,
            user.uid
          );
        }

        setSuccessMsg(`Appointment booked successfully! ${isToday ? 'You are checked into today\'s live queue.' : 'Reminder added.'}`);
        resetForm();
        if (onBookingSuccess) onBookingSuccess();
      } catch (err) {
        console.error("Booking failed", err);
      } finally {
        setSubmitting(false);
      }
    }
  });

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

      <form onSubmit={formik.handleSubmit} className="space-y-6">

        {/* Booking Target (Self vs Household Proxy) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Who is this appointment for?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => formik.setFieldValue('bookingFor', 'self')}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                formik.values.bookingFor === 'self'
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
                onClick={() => formik.setFieldValue('bookingFor', p.id)}
                className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  formik.values.bookingFor === p.id
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
          {formik.touched.bookingFor && formik.errors.bookingFor && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{formik.errors.bookingFor}</span>
            </p>
          )}
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
                onClick={() => formik.setFieldValue('serviceType', st as ServiceType)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  formik.values.serviceType === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          {formik.touched.serviceType && formik.errors.serviceType && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{formik.errors.serviceType}</span>
            </p>
          )}
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
                name="scheduledDate"
                value={formik.values.scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:outline-hidden ${
                  formik.touched.scheduledDate && formik.errors.scheduledDate
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 text-slate-800 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
            </div>
            {formik.touched.scheduledDate && formik.errors.scheduledDate && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{formik.errors.scheduledDate}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Slot
            </label>
            <select
              name="timeSlot"
              value={formik.values.timeSlot}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:outline-hidden cursor-pointer bg-white ${
                formik.touched.timeSlot && formik.errors.timeSlot
                  ? 'border-rose-400 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 text-slate-800 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            >
              {['08:00 AM', '09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {formik.touched.timeSlot && formik.errors.timeSlot && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{formik.errors.timeSlot}</span>
              </p>
            )}
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
                onClick={() => formik.setFieldValue('priority', p.id as PriorityLevel)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  formik.values.priority === p.id ? 'ring-2 ring-teal-500/40 font-bold border-teal-500' : p.class
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
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Describe symptoms, requested medication refills, or special assistance needed..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:outline-hidden resize-none ${
              formik.touched.reason && formik.errors.reason
                ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 text-slate-800 focus:ring-teal-500/20 focus:border-teal-500'
            }`}
          />
          {formik.touched.reason && formik.errors.reason && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{formik.errors.reason}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !formik.isValid}
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
