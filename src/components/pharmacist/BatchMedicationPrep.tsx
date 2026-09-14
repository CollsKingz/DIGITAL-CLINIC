import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { MedicationRequest } from '../../types/schema';
import {
  Pill,
  CheckCircle2,
  Box,
  Send,
  Sparkles,
  Clock,
  Building2
} from 'lucide-react';

export const BatchMedicationPrep: React.FC = () => {
  const { clinic, sendAlert } = useAuth();
  const [meds, setMeds] = useState<MedicationRequest[]>([]);

  useEffect(() => {
    const unsub = ClinicService.subscribeMedications(clinic.id, (items) => {
      setMeds(items);
    });
    return () => unsub();
  }, [clinic.id]);

  const activeRequests = meds.filter(m => m.status === 'requested' || m.status === 'preparing');

  const handleMarkBatchReady = async (req: MedicationRequest, lockerOrCounter: string) => {
    await ClinicService.updateMedicationStatus(req.id, 'ready_for_pickup', {
      isBatchPrepared: true,
      collectionLockerOrCounter: lockerOrCounter,
      readyByDate: new Date().toISOString().split('T')[0]
    });

    await sendAlert(
      `Prescription Ready for Pickup!`,
      `Your medication order (${req.medications[0]?.medicationName || 'Refill'}) is pre-packed and ready at ${lockerOrCounter}.`,
      req.patientId
    );
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Chronic Medication Batch Preparation Workspace</h2>
            <p className="text-xs text-slate-500">Pre-pack chronic refills in advance to slash counter queue times</p>
          </div>
        </div>

        <div className="bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900">
          {activeRequests.length} Batch Requests Pending
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRequests.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No active medication batch preps pending. All chronic refills are up to date!
          </div>
        ) : (
          activeRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{req.patientName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase border border-amber-200">
                    {req.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1">Prescribed by: {req.prescribedBy}</p>

                <div className="mt-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Prescribed Items:</span>
                  {req.medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{m.medicationName} ({m.dosage})</span>
                        <span>Qty: {m.quantity}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.frequency} — {m.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Assign Collection Point & Alert Patient:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMarkBatchReady(req, 'Smart Locker #04 (Code: 8821)')}
                    className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Locker #04</span>
                  </button>

                  <button
                    onClick={() => handleMarkBatchReady(req, 'Pharmacy Counter Window #2')}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Counter #2</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
