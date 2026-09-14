import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { MedicationRequest } from '../../types/schema';
import { Pill, CheckCircle2, UserCheck, Clock } from 'lucide-react';

export const RxCollectionList: React.FC = () => {
  const { clinic, sendAlert } = useAuth();
  const [meds, setMeds] = useState<MedicationRequest[]>([]);

  useEffect(() => {
    const unsub = ClinicService.subscribeMedications(clinic.id, (items) => {
      setMeds(items);
    });
    return () => unsub();
  }, [clinic.id]);

  const readyOrCollected = meds.filter(m => m.status === 'ready_for_pickup' || m.status === 'collected');

  const handleMarkCollected = async (req: MedicationRequest) => {
    await ClinicService.updateMedicationStatus(req.id, 'collected', {
      collectedAt: new Date().toISOString()
    });

    await sendAlert(
      `Medication Handover Confirmed`,
      `Prescription order rx-${req.id.slice(-4)} for ${req.patientName} was collected successfully.`,
      req.patientId
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Rx Collection & Handover Desk</h2>
          <p className="text-xs text-slate-500">Verify patient identity or proxy authorization before dispensing</p>
        </div>
      </div>

      <div className="space-y-3">
        {readyOrCollected.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            No medication packages ready for collection right now.
          </div>
        ) : (
          readyOrCollected.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{m.patientName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    m.status === 'collected' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Location: <strong className="text-teal-700">{m.collectionLockerOrCounter || 'Counter #2'}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Meds: {m.medications.map(item => `${item.medicationName} (${item.quantity})`).join(', ')}
                </p>
              </div>

              <div>
                {m.status === 'ready_for_pickup' ? (
                  <button
                    onClick={() => handleMarkCollected(m)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Confirm Handover & Dispense</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Handed Over
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
