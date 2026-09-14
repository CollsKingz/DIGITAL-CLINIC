import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AppointmentBooking } from './components/patient/AppointmentBooking';
import { MyAppointments } from './components/patient/MyAppointments';
import { HouseholdProxyManager } from './components/patient/HouseholdProxyManager';
import { HealthInfoHub } from './components/patient/HealthInfoHub';
import { QueueManager } from './components/clerk/QueueManager';
import { IntakeSchedule } from './components/clerk/IntakeSchedule';
import { ManualEntryFallbackModal } from './components/clerk/ManualEntryFallbackModal';
import { PatientConsultQueue } from './components/doctor/PatientConsultQueue';
import { BatchMedicationPrep } from './components/pharmacist/BatchMedicationPrep';
import { RxCollectionList } from './components/pharmacist/RxCollectionList';
import { VercelConnectModal } from './components/integration/VercelConnectModal';
import { PCAuthorizationManager } from './components/security/PCAuthorizationManager';
import { MemberRegistrationPortal } from './components/auth/MemberRegistrationPortal';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { Base45Logo } from './components/brand/Base45Logo';
import { HouseholdProxy } from './types/schema';
import {
  Activity,
  Calendar,
  Users,
  Info,
  ClipboardList,
  Stethoscope,
  Pill,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Globe,
  Monitor,
  UserPlus,
  LogIn
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { role, user, clinic } = useAuth();

  // Patient Tab State
  const [patientTab, setPatientTab] = useState<'queue' | 'book' | 'proxies' | 'info'>('queue');

  // Clerk Tab State
  const [clerkTab, setClerkTab] = useState<'queue' | 'intake'>('queue');
  const [showFallbackModal, setShowFallbackModal] = useState(false);

  // Pharmacist Tab State
  const [pharmacistTab, setPharmacistTab] = useState<'batch' | 'collection'>('batch');

  // Modals State for requested features
  const [showVercelModal, setShowVercelModal] = useState(false);
  const [showPcAuthModal, setShowPcAuthModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white flex flex-col">

      {/* Header Navigation Bar with Persona Switcher & Feature Launchers */}
      <Navbar
        onOpenVercel={() => setShowVercelModal(true)}
        onOpenPcAuth={() => setShowPcAuthModal(true)}
        onOpenMembers={() => setShowMembersModal(true)}
        onOpenGoogleAuth={() => setShowGoogleAuthModal(true)}
      />

      {/* Quick Launch Banner for BASE 45 Innovation Group Features */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-extrabold text-slate-200">BASE 45 INNOVATION GROUP</span>
            <span className="text-slate-400">| Digital Health Ecosystem v2.4</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300 font-medium">
            <button
              onClick={() => setShowVercelModal(true)}
              className="hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Connect with Vercel</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowPcAuthModal(true)}
              className="hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>Authorize PCs</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowMembersModal(true)}
              className="hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-400" />
              <span>Members' Registrations</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowGoogleAuthModal(true)}
              className="hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ROLE 1: PATIENT / COMMUNITY MEMBER WORKFLOW */}
        {role === 'patient' && (
          <div className="space-y-6">
            {/* Patient Header Banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Welcome, {user.fullName}</h1>
                <p className="text-xs text-slate-500 mt-0.5">Primary Health Portal — {clinic.name}</p>
              </div>

              {/* Patient Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setPatientTab('queue')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    patientTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Appointments & Queue
                </button>
                <button
                  onClick={() => setPatientTab('book')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    patientTab === 'book' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Book Visit
                </button>
                <button
                  onClick={() => setPatientTab('proxies')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    patientTab === 'proxies' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Elderly & Household Proxies
                </button>
                <button
                  onClick={() => setPatientTab('info')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    patientTab === 'info' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Health Info Hub
                </button>
              </div>
            </div>

            {patientTab === 'queue' && <MyAppointments />}
            {patientTab === 'book' && <AppointmentBooking onBookingSuccess={() => setPatientTab('queue')} />}
            {patientTab === 'proxies' && (
              <HouseholdProxyManager
                onBookProxy={(proxy: HouseholdProxy) => {
                  setPatientTab('book');
                }}
              />
            )}
            {patientTab === 'info' && <HealthInfoHub />}
          </div>
        )}

        {/* ROLE 2: CLINIC ADMINISTRATION CLERK WORKFLOW */}
        {role === 'clerk' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Intake Reception Dashboard</h1>
                <p className="text-xs text-slate-500 mt-0.5">Clerk Workspace — {user.fullName}</p>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setClerkTab('queue')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    clerkTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Queue Board
                </button>
                <button
                  onClick={() => setClerkTab('intake')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    clerkTab === 'intake' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today's Scheduled Intake
                </button>
              </div>
            </div>

            {clerkTab === 'queue' && <QueueManager onOpenFallbackModal={() => setShowFallbackModal(true)} />}
            {clerkTab === 'intake' && <IntakeSchedule />}

            {showFallbackModal && <ManualEntryFallbackModal onClose={() => setShowFallbackModal(false)} />}
          </div>
        )}

        {/* ROLE 3: NURSES & DOCTORS WORKFLOW */}
        {role === 'doctor' && (
          <div className="space-y-6">
            <PatientConsultQueue />
          </div>
        )}

        {/* ROLE 4: PHARMACIST WORKFLOW */}
        {role === 'pharmacist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Pharmacy & Dispensing Portal</h1>
                <p className="text-xs text-slate-500 mt-0.5">Pharmacist: {user.fullName}</p>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setPharmacistTab('batch')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacistTab === 'batch' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chronic Refill Batch Prep
                </button>
                <button
                  onClick={() => setPharmacistTab('collection')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacistTab === 'collection' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rx Collection & Handover Desk
                </button>
              </div>
            </div>

            {pharmacistTab === 'batch' && <BatchMedicationPrep />}
            {pharmacistTab === 'collection' && <RxCollectionList />}
          </div>
        )}

        {/* ROLE 5: SYSTEM ADMINISTRATOR */}
        {role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-white">System Administrator Console</h1>
                    <p className="text-xs text-slate-400">Governance, Security Rules, PC Authorizations & Vercel Sync</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowVercelModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>Vercel Deploy Hub</span>
                  </button>

                  <button
                    onClick={() => setShowPcAuthModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>PC Authorization Manager</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-purple-400">RBAC Enforcement</span>
                  <p className="text-sm font-bold text-white mt-1">Firestore Rules v2 Active</p>
                  <p className="text-xs text-slate-400 mt-0.5">Strict role validation enabled</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-teal-400">Active Facilities</span>
                  <p className="text-sm font-bold text-white mt-1">2 Health Centers Online</p>
                  <p className="text-xs text-slate-400 mt-0.5">CPHC-01 & WMCC-02</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-indigo-400">Authorized Workstations</span>
                  <p className="text-sm font-bold text-white mt-1">4 Clinical PCs Active</p>
                  <p className="text-xs text-slate-400 mt-0.5">Hardware IP Encrypted</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Vercel Production</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">● Ready & Synced</p>
                  <p className="text-xs text-slate-400 mt-0.5">base45-digital-clinic.vercel.app</p>
                </div>
              </div>
            </div>

            {/* Embed Member Registration & PC Authorization inside Admin view */}
            <PCAuthorizationManager />
            <MemberRegistrationPortal onOpenGoogleAuth={() => setShowGoogleAuthModal(true)} />

            {/* Quick Staff Workflow Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QueueManager onOpenFallbackModal={() => setShowFallbackModal(true)} />
              <PatientConsultQueue />
            </div>

            {showFallbackModal && <ManualEntryFallbackModal onClose={() => setShowFallbackModal(false)} />}
          </div>
        )}

      </main>

      {/* POPUP MODALS */}
      {showVercelModal && <VercelConnectModal onClose={() => setShowVercelModal(false)} />}

      {showPcAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl animate-in zoom-in-95 duration-150">
            <PCAuthorizationManager onClose={() => setShowPcAuthModal(false)} />
          </div>
        </div>
      )}

      {showMembersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl animate-in zoom-in-95 duration-150">
            <MemberRegistrationPortal
              onClose={() => setShowMembersModal(false)}
              onOpenGoogleAuth={() => {
                setShowMembersModal(false);
                setShowGoogleAuthModal(true);
              }}
            />
          </div>
        </div>
      )}

      {showGoogleAuthModal && <GoogleAuthModal onClose={() => setShowGoogleAuthModal(false)} />}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Base45Logo variant="horizontal" size="sm" />
        </div>
        <p>BASE 45 INNOVATION GROUP — Production Full-Stack Healthcare Platform Architecture</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Vercel Production Target • Firebase Real-Time Firestore • Workstation PC Authorization • Google OAuth 2.0 Single Sign-On
        </p>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
