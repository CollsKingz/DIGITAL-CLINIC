import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { HouseholdProxy } from '../../types/schema';
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  HeartPulse,
  AlertTriangle,
  FileText,
  CalendarCheck
} from 'lucide-react';

export const HouseholdProxyManager: React.FC<{ onBookProxy?: (proxy: HouseholdProxy) => void }> = ({ onBookProxy }) => {
  const { user } = useAuth();
  const [proxies, setProxies] = useState<HouseholdProxy[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields for new proxy dependent
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<HouseholdProxy['relationship']>('parent');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = ClinicService.subscribeProxies(user.uid, setProxies);
    return () => unsub();
  }, [user.uid]);

  const handleAddProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSubmitting(true);
    try {
      await ClinicService.addProxy({
        primaryUserId: user.uid,
        fullName,
        relationship,
        idNumber,
        dateOfBirth,
        chronicConditions,
        allergies,
        notes
      });

      setShowAddModal(false);
      setFullName('');
      setIdNumber('');
      setChronicConditions('');
      setAllergies('');
      setNotes('');
    } catch (err) {
      console.error("Failed to add proxy", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this proxy profile?")) {
      await ClinicService.deleteProxy(id);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Elderly & Household Proxy Support</h2>
            <p className="text-xs text-slate-500">Manage health intake & appointment bookings for vulnerable family members</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dependent Proxy</span>
        </button>
      </div>

      {/* List of Registered Proxies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proxies.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No household dependents added yet. Click "Add Dependent Proxy" above to manage appointments or chronic refill collection for parents, children, or elderly family members.
          </div>
        ) : (
          proxies.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.fullName}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                      {p.relationship}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove proxy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {p.idNumber && <p><strong>ID Number:</strong> {p.idNumber}</p>}
                  {p.dateOfBirth && <p><strong>DOB:</strong> {p.dateOfBirth}</p>}
                  {p.chronicConditions && (
                    <div className="flex items-center space-x-1.5 text-amber-800 bg-amber-50 p-2 rounded-xl text-[11px] mt-2">
                      <HeartPulse className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.chronicConditions}</span>
                    </div>
                  )}
                  {p.allergies && (
                    <div className="flex items-center space-x-1.5 text-rose-800 bg-rose-50 p-2 rounded-xl text-[11px] mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Allergies: {p.allergies}</span>
                    </div>
                  )}
                </div>
              </div>

              {onBookProxy && (
                <button
                  onClick={() => onBookProxy(p)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book Appointment for {p.fullName.split(' ')[0]}</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Proxy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Add Dependent / Elderly Proxy</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProxy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Martha Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as HouseholdProxy['relationship'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="parent">Parent</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="child">Child</option>
                    <option value="spouse">Spouse</option>
                    <option value="other">Other Dependent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">ID Number (Optional)</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="ID-480911-XXXX-084"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Known Chronic Conditions</label>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes, Arthritis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Dependent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
