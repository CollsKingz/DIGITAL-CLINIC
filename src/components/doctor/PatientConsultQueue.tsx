import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { QueueItem } from '../../types/schema';
import { VitalsAndConsultModal } from './VitalsAndConsultModal';
import {
  Stethoscope,
  Activity,
  HeartPulse,
  UserCheck,
  FileText,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const PatientConsultQueue: React.FC = () => {
  const { clinic, user } = useAuth();
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [activeConsultItem, setActiveConsultItem] = useState<QueueItem | null>(null);

  useEffect(() => {
    const unsub = ClinicService.subscribeQueue(clinic.id, (items) => {
      setQueues(items);
    });
    return () => unsub();
  }, [clinic.id]);

  // Patients at Vitals or Consult stage
  const clinicalQueue = queues.filter(q => q.stage === 'At Vitals' || q.stage === 'At Consult');

  return (
    <div className="space-y-6">

      {/* Header Metric */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Doctor & Clinical Nurse Workspace</h2>
            <p className="text-xs text-slate-500">Record vitals, clinical consultation notes, prescriptions, and stage progression</p>
          </div>
        </div>

        <div className="bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-900">
          {clinicalQueue.length} Patients Active in Worklist
        </div>
      </div>

      {/* Patient Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clinicalQueue.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No patients currently queued for Vitals or Consultation. Check back shortly.
          </div>
        ) : (
          clinicalQueue.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                item.stage === 'At Consult'
                  ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-sm">Ticket #{item.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.stage === 'At Consult' ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.stage}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">{item.patientName}</h3>
                    {item.isProxy && (
                      <span className="text-[10px] text-indigo-600 font-semibold block">Proxy: {item.proxyName}</span>
                    )}
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.priority === 'emergency' ? 'bg-rose-100 text-rose-800' :
                    item.priority === 'urgent' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.priority}
                  </span>
                </div>

                {/* Existing Vitals Summary */}
                {item.vitals && (
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-slate-200/80 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Blood Pressure</span>
                      <span className="font-bold text-slate-800">{item.vitals.bloodPressureSys}/{item.vitals.bloodPressureDia} mmHg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Pulse Rate</span>
                      <span className="font-bold text-slate-800">{item.vitals.heartRatePulse} bpm</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">SpO2 / Temp</span>
                      <span className="font-bold text-slate-800">{item.vitals.oxygenSatSpO2}% | {item.vitals.temperatureC}°C</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveConsultItem(item)}
                className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Clinical Workspace & Vitals</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal for Vitals Entry & Clinical Consult */}
      {activeConsultItem && (
        <VitalsAndConsultModal
          item={activeConsultItem}
          onClose={() => setActiveConsultItem(null)}
        />
      )}

    </div>
  );
};
