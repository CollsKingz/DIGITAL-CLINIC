import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { PriorityLevel } from '../../types/schema';
import { FileText, AlertTriangle, Plus, X } from 'lucide-react';

export const ManualEntryFallbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { clinic } = useAuth();

  const [patientName, setPatientName] = useState('');
  const [paperCardNumber, setPaperCardNumber] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('standard');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setSubmitting(true);
    try {
      const isEmergency = priority === 'emergency';
      const prefix = isEmergency ? 'E' : 'A';
      const ticketNum = `${prefix}-${Math.floor(100 + Math.random() * 800)}`;

      await ClinicService.checkInPatient({
        ticketNumber: ticketNum,
        clinicId: clinic.id,
        patientId: `manual-${Date.now()}`,
        patientName,
        stage: 'Checked In',
        priority,
        estimatedWaitMins: isEmergency ? 0 : 25,
        assignedRoom: isEmergency ? 'Emergency Assessment Bay' : 'Waiting Lounge A',
        paperworkFallbackNote: `Manual Paper Card #${paperCardNumber || 'N/A'} - ${reason || 'Walk-in'}`
      });

      onClose();
    } catch (err) {
      console.error("Failed manual intake", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150">

        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manual Paperwork Fallback Intake</h3>
              <p className="text-xs text-slate-500">For walk-in emergency cardholders or paper file fallbacks</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Patient Full Name
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Samuel Dlamini"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Paper File / Health Card # (Optional)
            </label>
            <input
              type="text"
              value={paperCardNumber}
              onChange={(e) => setPaperCardNumber(e.target.value)}
              placeholder="e.g. CARD-9012-A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Intake Reason / Chief Complaint
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Severe abdominal pain, walk-in consultation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Triage Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard', class: 'border-slate-200' },
                { id: 'urgent', label: 'Urgent Care', class: 'border-amber-200 bg-amber-50 text-amber-800' },
                { id: 'emergency', label: 'Emergency!', class: 'border-rose-200 bg-rose-50 text-rose-800' }
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as PriorityLevel)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium text-center cursor-pointer ${
                    priority === p.id ? 'ring-2 ring-blue-500 font-bold border-blue-500' : p.class
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Issue Digital Override Ticket
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
