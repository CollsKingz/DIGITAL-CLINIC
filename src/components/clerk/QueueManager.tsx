import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicService } from '../../services/clinicService';
import { QueueItem, QueueStage } from '../../types/schema';
import {
  Users,
  Clock,
  ArrowRight,
  Filter,
  Search,
  AlertTriangle,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const QueueManager: React.FC<{ onOpenFallbackModal: () => void }> = ({ onOpenFallbackModal }) => {
  const { clinic, sendAlert } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  useEffect(() => {
    const unsub = ClinicService.subscribeQueue(clinic.id, (items) => {
      setQueue(items);
    });
    return () => unsub();
  }, [clinic.id]);

  const STAGES: QueueStage[] = ['Checked In', 'At Vitals', 'At Consult', 'At Pharmacy', 'Completed'];

  const filteredQueue = queue.filter((q) => {
    const matchesSearch =
      q.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.patientName.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || q.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleAdvanceStage = async (item: QueueItem) => {
    const currentIdx = STAGES.indexOf(item.stage);
    if (currentIdx < STAGES.length - 1) {
      const nextStage = STAGES[currentIdx + 1];
      const roomMap: Record<QueueStage, string> = {
        'Checked In': 'Waiting Lounge',
        'At Vitals': 'Triage Station B',
        'At Consult': 'Consultation Room 3',
        'At Pharmacy': 'Pharmacy Counter #2',
        'Completed': 'Discharged',
        'Transferred': 'Referral Ward'
      };

      await ClinicService.updateQueueStage(item.id, nextStage, {
        assignedRoom: roomMap[nextStage] || 'Main Corridor'
      });

      await sendAlert(
        `Queue Update: Ticket #${item.ticketNumber}`,
        `Patient ${item.patientName} moved to stage: ${nextStage} (${roomMap[nextStage]}).`,
        item.patientId
      );
    }
  };

  const getStageBadge = (stage: QueueStage) => {
    switch (stage) {
      case 'Checked In': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'At Vitals': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'At Consult': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'At Pharmacy': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* Live Queue Header Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Live Queue</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{queue.filter(q => q.stage !== 'Completed').length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Awaiting Vitals</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{queue.filter(q => q.stage === 'At Vitals').length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">In Consult</span>
          <p className="text-2xl font-black text-indigo-900 mt-1">{queue.filter(q => q.stage === 'At Consult').length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">At Pharmacy</span>
          <p className="text-2xl font-black text-teal-900 mt-1">{queue.filter(q => q.stage === 'At Pharmacy').length}</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Reception & Queue Board</h2>
              <p className="text-xs text-slate-500">Monitor and route patient flow synchronously</p>
            </div>
          </div>

          <button
            onClick={onOpenFallbackModal}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center space-x-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>Manual / Paper File Intake</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket # or patient name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
          >
            <option value="all">All Stages</option>
            {STAGES.map(stg => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>

        {/* Live Queue Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Ticket</th>
                <th className="py-3 px-3">Patient Name</th>
                <th className="py-3 px-3">Current Stage</th>
                <th className="py-3 px-3">Station / Room</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active tickets matching filter.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        #{item.ticketNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-900">
                      <div>
                        <span>{item.patientName}</span>
                        {item.isProxy && (
                          <span className="block text-[10px] text-indigo-600 font-semibold">Proxy (Family Member)</span>
                        )}
                        {item.paperworkFallbackNote && (
                          <span className="block text-[10px] text-amber-700 italic">Card: {item.paperworkFallbackNote}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStageBadge(item.stage)}`}>
                        {item.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-600">
                      {item.assignedRoom || 'Unassigned'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.priority === 'emergency' ? 'bg-rose-100 text-rose-800' :
                        item.priority === 'urgent' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {item.stage !== 'Completed' ? (
                        <button
                          onClick={() => handleAdvanceStage(item)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs inline-flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        >
                          <span>Move Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
