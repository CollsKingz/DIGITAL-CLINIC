import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { UserRole, MemberRegistration } from '../../types/schema';
import { Base45Logo } from '../brand/Base45Logo';
import {
  UserPlus,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  User,
  Search,
  Filter,
  AlertCircle,
  X
} from 'lucide-react';

const registrationValidationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: Yup.string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  phone: Yup.string()
    .trim()
    .matches(/^[+0-9\s-]*$/, 'Please enter a valid phone number format')
    .optional(),
  requestedRole: Yup.string()
    .required('Please select a requested member role'),
  department: Yup.string().when('requestedRole', {
    is: (role: string) => role !== 'patient',
    then: (schema) => schema.trim().required('Clinical department is required for staff roles'),
    otherwise: (schema) => schema.optional()
  }),
  idNumber: Yup.string().optional()
});

const INITIAL_REGISTRATIONS: MemberRegistration[] = [
  {
    id: 'reg-101',
    fullName: 'Thabo Mokoena',
    email: 'thabo.mokoena@gmail.com',
    phone: '+27 82 345 6789',
    requestedRole: 'patient',
    idNumber: '9204125890082',
    status: 'pending',
    authProvider: 'google',
    registeredAt: '2026-09-14 09:15'
  },
  {
    id: 'reg-102',
    fullName: 'Dr. Fatima Patel',
    email: 'dr.patel@base45clinic.org',
    phone: '+27 71 987 6543',
    requestedRole: 'doctor',
    department: 'General Pediatrics',
    idNumber: '8801235990081',
    status: 'approved',
    authProvider: 'email',
    registeredAt: '2026-09-13 14:20',
    approvedBy: 'Dr. Sarah Jenkins'
  },
  {
    id: 'reg-103',
    fullName: 'Sipho Ndlovu',
    email: 'sipho.pharmacist@gmail.com',
    phone: '+27 83 456 7890',
    requestedRole: 'pharmacist',
    department: 'Central Pharmacy Desk',
    status: 'pending',
    authProvider: 'google',
    registeredAt: '2026-09-14 10:30'
  }
];

export const MemberRegistrationPortal: React.FC<{
  onClose?: () => void;
  onOpenGoogleAuth?: () => void;
}> = ({ onClose, onOpenGoogleAuth }) => {
  const { user, sendAlert } = useAuth();
  const [registrations, setRegistrations] = useState<MemberRegistration[]>(INITIAL_REGISTRATIONS);
  const [activeTab, setActiveTab] = useState<'register' | 'approval' | 'directory'>('register');
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      requestedRole: 'patient' as UserRole,
      department: '',
      idNumber: ''
    },
    validationSchema: registrationValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const newReg: MemberRegistration = {
        id: `reg-${Date.now().toString().slice(-4)}`,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        requestedRole: values.requestedRole,
        department: values.department || undefined,
        idNumber: values.idNumber || undefined,
        status: values.requestedRole === 'patient' ? 'approved' : 'pending',
        authProvider: 'email',
        registeredAt: new Date().toLocaleString()
      };

      try {
        await ClinicService.createRegistration({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone || undefined,
          requestedRole: values.requestedRole,
          department: values.department || undefined,
          idNumber: values.idNumber || undefined,
          authProvider: 'email',
        });
      } catch (err) {
        console.warn("Firestore registration log warning", err);
      }

      setRegistrations(prev => [newReg, ...prev]);
      setSubmitted(true);
      await sendAlert(
        "New Member Registration",
        `${values.fullName} requested registration as ${values.requestedRole.toUpperCase()}.`
      );
      resetForm();
    }
  });

  const handleApprove = async (regId: string) => {
    setRegistrations(prev =>
      prev.map(r => r.id === regId ? { ...r, status: 'approved', approvedBy: user.fullName } : r)
    );
    await ClinicService.updateRegistrationStatus(regId, 'approved');
    await sendAlert("Registration Approved", `Member account #${regId} has been approved.`);
  };

  const handleReject = async (regId: string) => {
    setRegistrations(prev =>
      prev.map(r => r.id === regId ? { ...r, status: 'rejected' } : r)
    );
    await ClinicService.updateRegistrationStatus(regId, 'rejected');
    await sendAlert("Registration Rejected", `Member account #${regId} was declined.`);
  };

  const filteredRegistrations = registrations.filter(r =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requestedRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Member Registration & Access Portal</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                BASE 45 Identity
              </span>
            </div>
            <p className="text-xs text-slate-500">Register new clinic members, community patients, and manage staff credentials</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === 'approval' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Approval Queue</span>
            {registrations.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-bold">
                {registrations.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Member Directory
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: NEW MEMBER REGISTRATION FORM */}
      {activeTab === 'register' && (
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Continue with Google Fast Auth */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Instant One-Click Onboarding</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Register or Sign In with Google</h3>
              </div>
              <Base45Logo variant="badge" size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use your Google account to auto-fill member credentials securely via BASE 45 Identity SSO.
            </p>
            <button
              onClick={onOpenGoogleAuth}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              {/* Official Google G multicolor SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative flex items-center my-4">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Or Register Manually
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">Registration Submitted Successfully!</h3>
              <p className="text-xs text-emerald-700">
                Your account registration has been logged. {formik.values.requestedRole !== 'patient' ? 'Staff credentials are undergoing Admin review.' : 'You may now log in.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs cursor-pointer"
              >
                Register Another Member
              </button>
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. Dr. Jane Smith"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:outline-hidden ${
                      formik.touched.fullName && formik.errors.fullName
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formik.errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="name@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:outline-hidden ${
                      formik.touched.email && formik.errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formik.errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="+27 82 000 0000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:outline-hidden ${
                      formik.touched.phone && formik.errors.phone
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formik.errors.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Requested Member Role *
                  </label>
                  <select
                    name="requestedRole"
                    value={formik.values.requestedRole}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden font-semibold cursor-pointer"
                  >
                    <option value="patient">Patient / Community Member</option>
                    <option value="clerk">Intake Administration Clerk</option>
                    <option value="doctor">Doctor / Clinical Nurse</option>
                    <option value="pharmacist">Clinic Pharmacist</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              {formik.values.requestedRole !== 'patient' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Clinical Department / Speciality *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. Chronic Care / Emergency Desk"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:outline-hidden ${
                      formik.touched.department && formik.errors.department
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  {formik.touched.department && formik.errors.department && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formik.errors.department}</span>
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!formik.isValid}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                Complete Member Registration
              </button>
            </form>
          )}

        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pending Member Registrations ({registrations.filter(r => r.status === 'pending').length})
            </h3>
          </div>

          <div className="space-y-3">
            {registrations.filter(r => r.status === 'pending').length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No pending registrations waiting for approval.
              </div>
            ) : (
              registrations.filter(r => r.status === 'pending').map((reg) => (
                <div key={reg.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{reg.fullName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                        {reg.requestedRole}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {reg.email}</span>
                      {reg.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {reg.phone}</span>}
                    </div>
                    {reg.department && <p className="text-xs text-slate-500">Dept: {reg.department}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleReject(reg.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MEMBER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registered members by name, email, or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Member Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Auth Provider</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{reg.fullName}</td>
                    <td className="py-3 px-3 capitalize text-slate-700 font-medium">{reg.requestedRole}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{reg.email}</td>
                    <td className="py-3 px-3 capitalize text-slate-500">{reg.authProvider}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        reg.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
