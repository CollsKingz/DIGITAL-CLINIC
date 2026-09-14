import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/schema';
import { INITIAL_CLINICS } from '../services/mockData';
import { Base45Logo } from './brand/Base45Logo';
import { VercelConnectModal } from './integration/VercelConnectModal';
import { PCAuthorizationManager } from './security/PCAuthorizationManager';
import { MemberRegistrationPortal } from './auth/MemberRegistrationPortal';
import { GoogleAuthModal } from './auth/GoogleAuthModal';
import { ErrorButton } from './ErrorButton';
import {
  Activity,
  UserCheck,
  Building2,
  Bell,
  Check,
  Stethoscope,
  Pill,
  ClipboardList,
  ShieldCheck,
  User,
  Globe,
  Monitor,
  UserPlus,
  LogIn
} from 'lucide-react';

export const Navbar: React.FC<{
  onOpenVercel?: () => void;
  onOpenPcAuth?: () => void;
  onOpenMembers?: () => void;
  onOpenGoogleAuth?: () => void;
}> = ({ onOpenVercel, onOpenPcAuth, onOpenMembers, onOpenGoogleAuth }) => {
  const {
    user,
    role,
    clinic,
    setClinic,
    switchPersona,
    notifications,
    unreadCount,
    markNotificationRead
  } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleLabels: Record<UserRole, { title: string; icon: React.ReactNode; color: string }> = {
    patient: { title: 'Patient / Community Member', icon: <User className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    clerk: { title: 'Intake Administration Clerk', icon: <ClipboardList className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    doctor: { title: 'Doctor / Clinical Nurse', icon: <Stethoscope className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    pharmacist: { title: 'Clinic Pharmacist', icon: <Pill className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    admin: { title: 'System Administrator', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-purple-50 text-purple-700 border-purple-200' }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* App Title & BASE 45 Innovation Group Logo */}
          <div className="flex items-center space-x-3">
            <Base45Logo variant="horizontal" size="md" />
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs text-slate-800 tracking-tight">Digital Health Clinic</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  Live Flow
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Nurses & Doctors on Your Phone</p>
            </div>
          </div>

          {/* Center: Quick Feature Launchers (Vercel, Authorize PCs, Members, Google Auth) */}
          <div className="hidden xl:flex items-center space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={onOpenVercel}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              title="Connect with Vercel Cloud"
            >
              <Globe className="w-3.5 h-3.5 text-slate-900" />
              <span>Vercel</span>
            </button>

            <button
              onClick={onOpenPcAuth}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              title="Authorize Workstation PCs"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              <span>Authorize PCs</span>
            </button>

            <button
              onClick={onOpenMembers}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              title="Members' Registration Portal"
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-600" />
              <span>Members</span>
            </button>

            <button
              onClick={onOpenGoogleAuth}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              title="Continue with Google SSO"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-600" />
              <span>Google Sign-In</span>
            </button>

            <ErrorButton />
          </div>

          {/* Center-Right: Clinic Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={clinic.id}
              onChange={(e) => {
                const found = INITIAL_CLINICS.find(c => c.id === e.target.value);
                if (found) setClinic(found);
              }}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden pr-2 cursor-pointer"
            >
              {INITIAL_CLINICS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right Controls: Persona Switcher & Notifications */}
          <div className="flex items-center space-x-2.5">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Queue & Service Alerts</span>
                    <span className="text-xs text-slate-500">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No alerts right now. You are up to date!
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-teal-50/40' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-xs text-slate-900">{n.title}</span>
                            {!n.read && (
                              <button
                                onClick={() => markNotificationRead(n.id)}
                                className="text-[10px] text-teal-600 hover:text-teal-800 flex items-center gap-1 bg-teal-100/60 px-1.5 py-0.5 rounded-sm"
                              >
                                <Check className="w-3 h-3" /> Dismiss
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona / Role Selector Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${roleLabels[role].color}`}
              >
                {roleLabels[role].icon}
                <span className="hidden sm:inline">{user.fullName.split(' ')[0]} ({role.toUpperCase()})</span>
                <span className="sm:hidden">{role.toUpperCase()}</span>
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Persona / Test RBAC</p>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">Click any role to test workflow</p>
                  </div>

                  {/* Mobile Quick Action Buttons in Dropdown */}
                  <div className="p-2 border-b border-slate-100 grid grid-cols-2 gap-1.5 text-xs font-medium xl:hidden">
                    <button
                      onClick={() => { setShowRoleMenu(false); onOpenVercel?.(); }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center space-x-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Vercel</span>
                    </button>

                    <button
                      onClick={() => { setShowRoleMenu(false); onOpenPcAuth?.(); }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center space-x-1"
                    >
                      <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                      <span>PCs</span>
                    </button>

                    <button
                      onClick={() => { setShowRoleMenu(false); onOpenMembers?.(); }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                      <span>Members</span>
                    </button>

                    <button
                      onClick={() => { setShowRoleMenu(false); onOpenGoogleAuth?.(); }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center space-x-1"
                    >
                      <LogIn className="w-3.5 h-3.5 text-sky-600" />
                      <span>Google</span>
                    </button>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {(['patient', 'clerk', 'doctor', 'pharmacist', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchPersona(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          role === r ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {roleLabels[r].icon}
                          <span>{roleLabels[r].title}</span>
                        </div>
                        {role === r && <UserCheck className="w-4 h-4 text-teal-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

