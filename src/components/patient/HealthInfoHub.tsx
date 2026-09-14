import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Info,
  Clock,
  PhoneCall,
  Sparkles,
  ShieldAlert,
  Heart,
  Pill,
  CheckCircle2
} from 'lucide-react';

export const HealthInfoHub: React.FC = () => {
  const { clinic } = useAuth();

  return (
    <div className="space-y-6">

      {/* Clinic Operating Info Banner */}
      <div className="bg-linear-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/30">
              Community Health Portal
            </span>
            <h2 className="text-xl font-bold mt-2 text-white">{clinic.name}</h2>
            <p className="text-xs text-slate-300 mt-1">{clinic.address}</p>
          </div>

          <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>{clinic.operatingHours}</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Emergency Hotline: {clinic.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health News & Service Updates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Saturday Vaccine Outreach</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Annual flu boosters and pediatric routine vaccines available without appointment every Saturday morning 08:00 - 12:00.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Fast Chronic Refill Lockers</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Registered chronic patients can now request batch pre-packing online and pick up 24/7 at Smart Locker Counter #04 using SMS code.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Hypertension Screening Drive</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Free blood pressure and blood glucose checks at Triage Station B. Reduce stroke and cardiovascular risk with early checks.
          </p>
        </div>

      </div>

    </div>
  );
};
