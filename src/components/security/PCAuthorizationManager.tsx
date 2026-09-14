import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthorizedPC } from '../../types/schema';
import { Base45Logo } from '../brand/Base45Logo';
import {
  Monitor,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Building2,
  Cpu,
  RefreshCw,
  X
} from 'lucide-react';

const INITIAL_PCS: AuthorizedPC[] = [
  {
    id: 'pc-001',
    machineName: 'Central Reception Terminal #01',
    ipAddress: '192.168.10.42',
    macHostHash: 'B4-MAC-89A1-229F',
    clinicId: 'clinic-central',
    roomOrDepartment: 'Reception Desk Bay 1',
    status: 'authorized',
    authorizedBy: 'Dr. Sarah Jenkins (Admin)',
    authorizedAt: '2026-09-01 08:30',
    lastActiveAt: '2026-09-14 11:05',
    authToken: 'AUTH-B4-9012-RECEPT'
  },
  {
    id: 'pc-002',
    machineName: 'Triage & Vitals Workstation B',
    ipAddress: '192.168.10.58',
    macHostHash: 'B4-MAC-77C3-9901',
    clinicId: 'clinic-central',
    roomOrDepartment: 'Triage Room 2',
    status: 'authorized',
    authorizedBy: 'Nurse Practitioner Alex',
    authorizedAt: '2026-09-05 09:15',
    lastActiveAt: '2026-09-14 10:50',
    authToken: 'AUTH-B4-3382-TRIAGE'
  },
  {
    id: 'pc-003',
    machineName: 'Doctor Consult Workstation #03',
    ipAddress: '192.168.10.88',
    macHostHash: 'B4-MAC-1102-55AA',
    clinicId: 'clinic-central',
    roomOrDepartment: 'Consultation Room 3',
    status: 'authorized',
    authorizedBy: 'Dr. Sarah Jenkins (Admin)',
    authorizedAt: '2026-09-10 14:00',
    lastActiveAt: '2026-09-14 11:02',
    authToken: 'AUTH-B4-7719-DOCTOR'
  },
  {
    id: 'pc-004',
    machineName: 'Pharmacy Smart Locker Kiosk #02',
    ipAddress: '192.168.10.104',
    macHostHash: 'B4-MAC-4491-00FF',
    clinicId: 'clinic-central',
    roomOrDepartment: 'Pharmacy Corridor Counter 2',
    status: 'pending',
    lastActiveAt: '2026-09-14 08:12'
  }
];

export const PCAuthorizationManager: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, clinic, sendAlert } = useAuth();
  const [pcs, setPcs] = useState<AuthorizedPC[]>(INITIAL_PCS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [newRoom, setNewRoom] = useState('Reception Desk');
  const [generatedPairingCode, setGeneratedPairingCode] = useState<string | null>(null);

  // Authorize PC Action
  const handleAuthorize = async (pcId: string) => {
    setPcs(prev =>
      prev.map(p => {
        if (p.id === pcId) {
          return {
            ...p,
            status: 'authorized',
            authorizedBy: user.fullName,
            authorizedAt: new Date().toLocaleString()
          };
        }
        return p;
      })
    );
    await sendAlert("PC Device Authorized", `Workstation PC #${pcId} authorized by ${user.fullName}.`);
  };

  // Revoke PC Action
  const handleRevoke = async (pcId: string) => {
    if (confirm("Revoke access for this PC workstation? The machine will be locked out immediately.")) {
      setPcs(prev =>
        prev.map(p => {
          if (p.id === pcId) {
            return { ...p, status: 'revoked' };
          }
          return p;
        })
      );
      await sendAlert("PC Device Revoked", `Workstation PC #${pcId} access revoked by ${user.fullName}.`);
    }
  };

  // Authorize Current Device
  const handleAuthorizeCurrentDevice = async () => {
    const currentDeviceName = `This Workstation (${navigator.platform || 'Linux/Win PC'})`;
    const newPc: AuthorizedPC = {
      id: `pc-${Date.now().toString().slice(-4)}`,
      machineName: currentDeviceName,
      ipAddress: '192.168.10.' + Math.floor(10 + Math.random() * 200),
      macHostHash: `B4-MAC-${Math.floor(1000 + Math.random() * 9000)}-CURR`,
      clinicId: clinic.id,
      roomOrDepartment: 'Current Operating Desk',
      status: 'authorized',
      authorizedBy: user.fullName,
      authorizedAt: new Date().toLocaleString(),
      lastActiveAt: new Date().toLocaleString(),
      authToken: `AUTH-B4-${Math.floor(1000 + Math.random() * 9000)}-LOCAL`
    };

    setPcs(prev => [newPc, ...prev]);
    await sendAlert("Current PC Device Authorized", `Your current PC machine (${currentDeviceName}) has been registered and authorized.`);
  };

  // Create new PC token
  const handleAddPcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) return;

    const code = `B4-${Math.floor(100000 + Math.random() * 900000)}-PC`;
    const newPc: AuthorizedPC = {
      id: `pc-${Date.now().toString().slice(-4)}`,
      machineName: newMachineName,
      ipAddress: '192.168.10.' + Math.floor(10 + Math.random() * 200),
      macHostHash: `B4-MAC-${Math.floor(1000 + Math.random() * 9000)}-NEW`,
      clinicId: clinic.id,
      roomOrDepartment: newRoom,
      status: 'pending',
      lastActiveAt: new Date().toLocaleString(),
      authToken: code
    };

    setPcs(prev => [newPc, ...prev]);
    setGeneratedPairingCode(code);
    setNewMachineName('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Workstation PC Authorization Console</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                BASE 45 Device Security
              </span>
            </div>
            <p className="text-xs text-slate-500">Manage, authorize & lock down clinical workstation PCs and kiosk hardware</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleAuthorizeCurrentDevice}
            className="px-3.5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs border border-teal-200 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Authorize This PC</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Register PC Workstation</span>
          </button>

          {onClose && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Current Device Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Cpu className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold text-indigo-900 block">Current Operating Workstation Hardware</span>
            <span className="text-indigo-700 text-[11px]">System Status: <strong className="text-emerald-700">Authorized & Encrypted</strong> (BASE 45 Workstation Guard)</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
          Active Session
        </span>
      </div>

      {/* PCs List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3">Workstation Machine</th>
              <th className="py-3 px-3">Room / Department</th>
              <th className="py-3 px-3">IP / Hardware Fingerprint</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Security Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {pcs.map((pc) => (
              <tr key={pc.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-3">
                  <div className="flex items-center space-x-2.5">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">{pc.machineName}</span>
                      <span className="text-[10px] text-slate-400">ID: {pc.id}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 font-medium text-slate-700">
                  {pc.roomOrDepartment}
                </td>

                <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                  <div>
                    <span>{pc.ipAddress}</span>
                    <span className="block text-[10px] text-slate-400">{pc.macHostHash}</span>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    pc.status === 'authorized' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    pc.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {pc.status}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-right space-x-2">
                  {pc.status === 'pending' && (
                    <button
                      onClick={() => handleAuthorize(pc.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve PC</span>
                    </button>
                  )}

                  {pc.status === 'authorized' && (
                    <button
                      onClick={() => handleRevoke(pc.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-medium text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  )}

                  {pc.status === 'revoked' && (
                    <button
                      onClick={() => handleAuthorize(pc.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-authorize</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register New PC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>Register Workstation PC Device</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPcSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Machine Name / Terminal Label
                </label>
                <input
                  type="text"
                  value={newMachineName}
                  onChange={(e) => setNewMachineName(e.target.value)}
                  placeholder="e.g. Pharmacy Counter PC-04"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Clinic Location / Room
                </label>
                <select
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Reception Desk">Reception Desk</option>
                  <option value="Triage Station">Triage Station</option>
                  <option value="Consultation Room 1">Consultation Room 1</option>
                  <option value="Consultation Room 2">Consultation Room 2</option>
                  <option value="Pharmacy Counter">Pharmacy Counter</option>
                  <option value="Emergency Bay">Emergency Bay</option>
                </select>
              </div>

              {generatedPairingCode && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                    One-Time PC Authorization Token
                  </span>
                  <p className="text-xl font-mono font-black text-indigo-900">{generatedPairingCode}</p>
                  <p className="text-[11px] text-indigo-700">Enter this code on the target workstation PC to complete pairing.</p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setGeneratedPairingCode(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  Generate PC Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
