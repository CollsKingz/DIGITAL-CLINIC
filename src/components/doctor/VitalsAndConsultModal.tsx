import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { QueueItem, PatientVitals } from '../../types/schema';
import {
  Stethoscope,
  Activity,
  Heart,
  Pill,
  Send,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const VitalsAndConsultModal: React.FC<{
  item: QueueItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const { user, clinic, sendAlert } = useAuth();

  // Vitals State
  const [sys, setSys] = useState<number>(item.vitals?.bloodPressureSys || 120);
  const [dia, setDia] = useState<number>(item.vitals?.bloodPressureDia || 80);
  const [pulse, setPulse] = useState<number>(item.vitals?.heartRatePulse || 72);
  const [temp, setTemp] = useState<number>(item.vitals?.temperatureC || 36.6);
  const [spO2, setSpO2] = useState<number>(item.vitals?.oxygenSatSpO2 || 98);
  const [glucose, setGlucose] = useState<number>(item.vitals?.bloodGlucoseMmoll || 5.5);

  // Consult Notes & Diagnosis
  const [diagnosis, setDiagnosis] = useState(item.diagnosis || '');
  const [doctorNotes, setDoctorNotes] = useState(item.doctorNotes || '');

  // Prescription Order State
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('10 mg');
  const [needsPharmacyRoute, setNeedsPharmacyRoute] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // Abnormal vital warning flags
  const isHighBP = sys >= 140 || dia >= 90;
  const isLowSpO2 = spO2 < 95;
  const isFever = temp >= 38.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updatedVitals: PatientVitals = {
        bloodPressureSys: sys,
        bloodPressureDia: dia,
        heartRatePulse: pulse,
        temperatureC: temp,
        oxygenSatSpO2: spO2,
        bloodGlucoseMmoll: glucose,
        recordedBy: user.fullName,
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const nextStage = needsPharmacyRoute ? 'At Pharmacy' : 'Completed';
      const assignedRoom = needsPharmacyRoute ? 'Pharmacy Counter #2' : 'Discharged';

      await ClinicService.updateQueueStage(item.id, nextStage, {
        vitals: updatedVitals,
        diagnosis,
        doctorNotes,
        assignedRoom,
        assignedStaff: user.fullName
      });

      await sendAlert(
        `Consultation Completed: Ticket #${item.ticketNumber}`,
        `Dr. ${user.fullName} completed consult for ${item.patientName}. Next stage: ${nextStage}.`,
        item.patientId
      );

      onClose();
    } catch (err) {
      console.error("Failed to complete consult", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">

        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">Ticket #{item.ticketNumber}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                {item.patientName}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">Clinical Consultation & Vital Signs</h3>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banners for Abnormal Vitals */}
        {(isHighBP || isLowSpO2 || isFever) && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Abnormal Vitals Detected: {isHighBP && 'High Blood Pressure! '} {isLowSpO2 && 'Hypoxia Warning (SpO2 < 95%)! '}{isFever && 'Pyrexia Fever Warning! '}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Vitals Entry Grid */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Vital Signs Assessment</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">BP Sys (mmHg)</label>
                <input
                  type="number"
                  value={sys}
                  onChange={(e) => setSys(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">BP Dia (mmHg)</label>
                <input
                  type="number"
                  value={dia}
                  onChange={(e) => setDia(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Heart Pulse (bpm)</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Oxygen SpO2 (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Glucose (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Clinical Assessment & Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Primary Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension Grade 1 / Acute Bronchitis"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Doctor Clinical Notes & Observations
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Record physical exam findings, treatment plan, and follow-up instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Routing Stage */}
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-indigo-900 block">Next Destination</span>
              <span className="text-[11px] text-indigo-700">Route patient to Pharmacy or Discharge</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setNeedsPharmacyRoute(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  needsPharmacyRoute ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Send to Pharmacy
              </button>
              <button
                type="button"
                onClick={() => setNeedsPharmacyRoute(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  !needsPharmacyRoute ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Discharge Patient
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !diagnosis.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Complete Consultation & Route</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
