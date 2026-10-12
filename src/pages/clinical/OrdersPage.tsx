import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X, 
  User, 
  Play, 
  Check, 
  Ban,
  Stethoscope,
  Send
} from 'lucide-react';

export type OrderState = 'ORDERED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'MEDICATION' | 'LABORATORY' | 'IMAGING' | 'NURSING' | 'VENTILATOR' | 'CONSULT';
export type OrderPriority = 'STAT' | 'URGENT' | 'ROUTINE';

interface ClinicalOrder {
  id: string;
  type: OrderType;
  priority: OrderPriority;
  instruction: string;
  schedule: string;
  author: string;
  role: string;
  orderedAt: string;
  state: OrderState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  cancelReason?: string;
}

export const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // New Order Form State
  const [newType, setNewType] = useState<OrderType>('LABORATORY');
  const [newPriority, setNewPriority] = useState<OrderPriority>('STAT');
  const [newInstruction, setNewInstruction] = useState('');
  const [newSchedule, setNewSchedule] = useState('Immediate / Once');

  // Cancel order modal state
  const [cancelingOrder, setCancelingOrder] = useState<ClinicalOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [orders, setOrders] = useState<ClinicalOrder[]>([
    {
      id: 'ORD-2026-4401',
      type: 'VENTILATOR',
      priority: 'STAT',
      instruction: 'Adjust Hamilton-G5 PEEP from 10 to 12 cmH2O. Check repeat ABG 30 mins post-adjustment.',
      schedule: 'STAT / Once',
      author: 'Dr. Anand Verma',
      role: 'Lead Intensivist',
      orderedAt: '12:30 UTC+5:30',
      state: 'ACKNOWLEDGED',
      acknowledgedBy: 'RN Priya Singh',
      acknowledgedAt: '12:34 UTC+5:30'
    },
    {
      id: 'ORD-2026-4402',
      type: 'LABORATORY',
      priority: 'STAT',
      instruction: 'Stat Blood Cultures x 2 sets (from CVC port and peripheral vein) prior to starting 2nd antibiotic dose.',
      schedule: 'Immediate STAT',
      author: 'Dr. Anand Verma',
      role: 'Lead Intensivist',
      orderedAt: '12:15 UTC+5:30',
      state: 'IN_PROGRESS',
      acknowledgedBy: 'RN Vikram Singh',
      acknowledgedAt: '12:18 UTC+5:30'
    },
    {
      id: 'ORD-2026-4403',
      type: 'MEDICATION',
      priority: 'URGENT',
      instruction: 'Initiate 20% Albumin 100 mL IV infusion over 2 hours for refractory hypoalbuminemia (Serum Albumin 2.1 g/dL).',
      schedule: 'Q12H x 2 doses',
      author: 'Dr. Ananya Roy',
      role: 'Consultant Intensivist',
      orderedAt: '11:45 UTC+5:30',
      state: 'ORDERED'
    },
    {
      id: 'ORD-2026-4404',
      type: 'IMAGING',
      priority: 'ROUTINE',
      instruction: 'Portable Bedside Chest Radiograph (AP) tomorrow at 06:00 to reassess bilateral dependent infiltrates.',
      schedule: 'Tomorrow 06:00',
      author: 'Dr. Anand Verma',
      role: 'Lead Intensivist',
      orderedAt: '10:00 UTC+5:30',
      state: 'ORDERED'
    },
    {
      id: 'ORD-2026-4390',
      type: 'NURSING',
      priority: 'ROUTINE',
      instruction: 'Strict hourly intake/output measurement with urometer. Maintain mean arterial pressure (MAP) > 65 mmHg.',
      schedule: 'Continuous Protocol',
      author: 'Dr. Anand Verma',
      role: 'Lead Intensivist',
      orderedAt: '08:00 UTC+5:30',
      state: 'COMPLETED'
    }
  ]);

  // Order state transitions: Draft -> Ordered -> Acknowledged -> In Progress -> Completed/Cancelled
  const handleAcknowledge = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      state: 'ACKNOWLEDGED',
      acknowledgedBy: 'RN Current Nurse',
      acknowledgedAt: new Date().toLocaleTimeString()
    } : o));
  };

  const handleStart = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, state: 'IN_PROGRESS' } : o));
  };

  const handleComplete = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, state: 'COMPLETED' } : o));
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingOrder) return;
    setOrders(prev => prev.map(o => o.id === cancelingOrder.id ? {
      ...o,
      state: 'CANCELLED',
      cancelReason
    } : o));
    setCancelingOrder(null);
    setCancelReason('');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.trim()) return;

    const newOrder: ClinicalOrder = {
      id: `ORD-2026-${Math.floor(4405 + Math.random() * 500)}`,
      type: newType,
      priority: newPriority,
      instruction: newInstruction,
      schedule: newSchedule,
      author: 'Dr. Anand Verma',
      role: 'Lead Intensivist',
      orderedAt: new Date().toLocaleTimeString(),
      state: 'ORDERED'
    };

    setOrders(prev => [newOrder, ...prev]);
    setNewInstruction('');
    setIsComposerOpen(false);
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'PENDING' && o.state !== 'ORDERED') return false;
    if (activeTab === 'ACTIVE' && (o.state !== 'ACKNOWLEDGED' && o.state !== 'IN_PROGRESS')) return false;
    if (activeTab === 'COMPLETED' && (o.state !== 'COMPLETED' && o.state !== 'CANCELLED')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.instruction.toLowerCase().includes(q) ||
        o.author.toLowerCase().includes(q) ||
        o.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 12: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-900 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 12
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Rahul Sharma (42M) · Bed 04 · Encounter ENC-90821
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Doctor Clinical Orders & CPOE Lifecycle</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Computerized Physician Order Entry (CPOE), structured lifecycle: Draft → Ordered → Acknowledged → In Progress → Completed.
          </p>
        </div>

        {/* Action Button: Compose Order */}
        <button
          onClick={() => setIsComposerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Doctor Order</span>
        </button>
      </div>

      {/* TOOLBAR: New; pending; active; completed + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold shadow-2xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-teal-700 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Pending Ack ({orders.filter(o => o.state === 'ORDERED').length})</span>
            {orders.some(o => o.state === 'ORDERED') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-blue-600 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            In Progress ({orders.filter(o => o.state === 'ACKNOWLEDGED' || o.state === 'IN_PROGRESS').length})
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-600 text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed / Cancelled
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order directive or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-slate-900 dark:text-white w-52 sm:w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-400 dark:hover:border-slate-700 transition-all duration-200"
          >
            <div className="space-y-2 flex-1 min-w-0">
              {/* Type, Priority, and State Badges */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold">
                <span className="text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-teal-200 dark:border-slate-700">
                  {order.id}
                </span>

                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {order.type}
                </span>

                <span className={`px-2 py-0.5 rounded border font-black ${
                  order.priority === 'STAT'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 animate-pulse'
                    : order.priority === 'URGENT'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                }`}>
                  {order.priority}
                </span>

                <span className={`px-2 py-0.5 rounded border font-black ${
                  order.state === 'ORDERED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                    : order.state === 'ACKNOWLEDGED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                    : order.state === 'IN_PROGRESS'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
                    : order.state === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/40'
                }`}>
                  ● {order.state}
                </span>
              </div>

              {/* Order Instruction */}
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed font-sans">
                {order.instruction}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 flex-wrap">
                <span>Schedule: <strong className="text-slate-800 dark:text-slate-200">{order.schedule}</strong></span>
                <span>·</span>
                <span>Ordered by: <strong className="text-teal-700 dark:text-teal-300">{order.author}</strong> ({order.role}) at {order.orderedAt}</span>
                {order.acknowledgedBy && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-700 dark:text-emerald-400">Ack by: {order.acknowledgedBy} ({order.acknowledgedAt})</span>
                  </>
                )}
                {order.cancelReason && (
                  <>
                    <span>·</span>
                    <span className="text-rose-600 dark:text-rose-400">Cancelled reason: {order.cancelReason}</span>
                  </>
                )}
              </div>
            </div>

            {/* Lifecycle Actions */}
            <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
              {order.state === 'ORDERED' && (
                <button
                  onClick={() => handleAcknowledge(order.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              )}

              {order.state === 'ACKNOWLEDGED' && (
                <button
                  onClick={() => handleStart(order.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Order</span>
                </button>
              )}

              {order.state === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleComplete(order.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
              )}

              {order.state !== 'COMPLETED' && order.state !== 'CANCELLED' && (
                <button
                  onClick={() => setCancelingOrder(order)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700"
                  title="Cancel Order (Requires Reason)"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* COMPOSER MODAL (Type; priority; instruction; schedule) */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">Create Doctor Clinical Order</h3>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Order Type */}
                <div>
                  <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">ORDER TYPE</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as OrderType)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                  >
                    <option value="MEDICATION">MEDICATION</option>
                    <option value="LABORATORY">LABORATORY / ABG</option>
                    <option value="IMAGING">IMAGING / PACS</option>
                    <option value="VENTILATOR">VENTILATOR WEANING</option>
                    <option value="NURSING">NURSING / PROTOCOL</option>
                    <option value="CONSULT">SPECIALTY CONSULT</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">PRIORITY</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as OrderPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                  >
                    <option value="STAT">STAT (Immediate Execution)</option>
                    <option value="URGENT">URGENT (Within 1 Hour)</option>
                    <option value="ROUTINE">ROUTINE (Standard Shift)</option>
                  </select>
                </div>
              </div>

              {/* Instruction */}
              <div>
                <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">CLINICAL INSTRUCTION / DIRECTIVE</label>
                <textarea
                  required
                  rows={4}
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Enter explicit clinical directive, dosage, target parameters or diagnostic test requested..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 placeholder-slate-400 font-sans"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">SCHEDULE / TIMING</label>
                <input
                  type="text"
                  required
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  placeholder="e.g. STAT / Once, Q4H, Post-extubation..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Authorize & Issue Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancelingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <h3 className="font-black text-base text-slate-900 dark:text-white mb-2">Cancel Doctor Order: {cancelingOrder.id}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{cancelingOrder.instruction}</p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">CANCELLATION REASON (MANDATORY AUDIT):</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Clinical condition changed, duplicate order, patient extubated..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelingOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
