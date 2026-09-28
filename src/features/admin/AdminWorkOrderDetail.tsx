import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  ArrowLeft, FileText, User, Phone, MapPin, Calendar, 
  Clock, ShieldAlert, Sparkles, CheckCircle2, ChevronDown, 
  AlertCircle, Edit3, Save, Plus, DollarSign, Users, Check 
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { WorkOrderStatus } from '../../types';

export const AdminWorkOrderDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    workOrders, 
    quotes, 
    providers, 
    updateWorkOrderStatus, 
    assignProviderToWorkOrder,
    scheduleAppointment 
  } = useAppStore();

  const workOrder = workOrders.find((w) => w.id === id);
  const quote = quotes.find((q) => q.workOrderId === id || q.id === workOrder?.quoteId);
  const assignedProvider = providers.find((p) => p.id === workOrder?.assignedProviderId);

  // Status update modal / dropdown
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus>(workOrder?.status || 'SUBMITTED');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Provider assignment
  const [selectedProviderId, setSelectedProviderId] = useState(workOrder?.assignedProviderId || '');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Dispatch Appointment Scheduler
  const [scheduledDate, setScheduledDate] = useState(
    workOrder?.preferredDate || new Date().toISOString().split('T')[0]
  );
  const [scheduledStartTime, setScheduledStartTime] = useState('10:00');
  const [scheduledEndTime, setScheduledEndTime] = useState('12:00');
  const [scheduleConflict, setScheduleConflict] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  if (!workOrder) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Work order not found.</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 bg-[#0F3966] text-white rounded-xl text-xs font-bold"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkOrderStatus(workOrder.id, selectedStatus, statusNote);
    setStatusUpdateSuccess(true);
    setTimeout(() => setStatusUpdateSuccess(false), 3000);
  };

  const handleAssignProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId) return;
    assignProviderToWorkOrder(workOrder.id, selectedProviderId);
    setAssignmentSuccess(true);
    setTimeout(() => setAssignmentSuccess(false), 3000);
  };

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId) {
      alert('Please assign a technician before scheduling.');
      return;
    }

    const providerObj = providers.find((p) => p.id === selectedProviderId);
    const startIso = `${scheduledDate}T${scheduledStartTime}:00.000Z`;
    const endIso = `${scheduledDate}T${scheduledEndTime}:00.000Z`;

    const res = scheduleAppointment({
      workOrderId: workOrder.id,
      workOrderNumber: workOrder.workOrderNumber,
      providerId: selectedProviderId,
      providerName: providerObj?.businessName || '',
      customerName: workOrder.customerName,
      customerPhone: workOrder.customerPhone,
      addressText: workOrder.addressText,
      scheduledStart: startIso,
      scheduledEnd: endIso,
      status: 'CONFIRMED',
      notes: `Dispatched by Operations Center for ${workOrder.serviceTypeName}`,
    });

    if (res.conflict) {
      setScheduleConflict(true);
      setScheduleSuccess(false);
    } else {
      setScheduleConflict(false);
      setScheduleSuccess(true);
      setTimeout(() => setScheduleSuccess(false), 3000);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Work Orders Registry</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
            {workOrder.workOrderNumber}
          </span>
          <StatusBadge status={workOrder.status} size="md" />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Photos, Quotation Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {workOrder.serviceCategoryName} • {workOrder.cityName}
                  </span>
                  <PriorityBadge priority={workOrder.priority} />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {workOrder.serviceTypeName}
                </h1>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
              <span className="font-bold text-slate-600 block text-[10px] uppercase mb-1">Customer Problem Statement:</span>
              {workOrder.description}
            </div>

            {/* Dynamic Form Specs */}
            {workOrder.formData && Object.keys(workOrder.formData).length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Submitted Form Data</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {Object.entries(workOrder.formData).map(([k, v]) => (
                    <div key={k} className="text-[11px]">
                      <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}: </span>
                      <span className="font-bold text-slate-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Customer Contact</span>
                <div className="font-bold text-slate-900">{workOrder.customerName}</div>
                <div className="text-slate-500 font-mono">{workOrder.customerPhone}</div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Address & Preferred Time</span>
                <div className="font-semibold text-slate-900">{workOrder.addressText}</div>
                <div className="text-slate-500">{workOrder.preferredDate} • {workOrder.preferredTime}</div>
              </div>
            </div>

            {/* Attachments */}
            {workOrder.attachments && workOrder.attachments.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Customer & Field Photos ({workOrder.attachments.length})
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {workOrder.attachments.map((att) => (
                    <div key={att.id} className="rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 relative group">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 end-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {att.uploadedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quotation & Margin Card (ADMIN PRIVILEGED) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-base text-slate-900">Quotation & Financials</h2>
                  <span className="text-[11px] text-slate-400">Privileged admin margin overview</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/admin/quote-builder?orderId=${workOrder.id}`)}
                className="px-3.5 py-1.5 bg-[#0F3966] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{quote ? 'Edit Quotation' : 'Create Quotation'}</span>
              </button>
            </div>

            {quote ? (
              <div className="space-y-4">
                {/* Line Items */}
                <div className="divide-y divide-slate-100 text-xs">
                  {quote.lineItems.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{item.description}</span>
                        <span className="text-slate-400 text-[11px] block">
                          Qty: {item.quantity} | Client: {item.unitPrice} EGP | Provider: {item.providerCost || 0} EGP
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="font-bold text-slate-900">{item.total} EGP</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary & Margin Calculation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">CUSTOMER TOTAL</span>
                    <span className="text-base font-extrabold text-slate-900">{quote.total} EGP</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">PROVIDER COST</span>
                    <span className="text-base font-bold text-slate-700">{quote.providerCost || 0} EGP</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">GROSS MARGIN</span>
                    <span className="text-base font-extrabold text-emerald-600">+{quote.margin || 0} EGP</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">MARGIN %</span>
                    <span className="text-base font-extrabold text-orange-600">{quote.marginPercentage || 0}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <p>No quotation has been prepared for this work order yet.</p>
                <button
                  onClick={() => navigate(`/admin/quote-builder?orderId=${workOrder.id}`)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold cursor-pointer hover:bg-orange-700"
                >
                  Generate First Quotation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Status Transition, Provider Assignment, Scheduling */}
        <div className="space-y-6">
          {/* Status Controls */}
          <form onSubmit={handleUpdateStatus} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Workflow Status Transition
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Change Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as WorkOrderStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="QUOTE_SENT">QUOTE SENT</option>
                <option value="QUOTE_ACCEPTED">QUOTE ACCEPTED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="EN_ROUTE">EN ROUTE</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Status Update Note</label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional reason or operational note..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F3966] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Workflow Status</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span>Dispatches real-time FCM push notification to customer</span>
            </div>

            {statusUpdateSuccess && (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status recorded & FCM Push Alert sent to customer</span>
              </div>
            )}
          </form>

          {/* Provider Assignment */}
          <form onSubmit={handleAssignProvider} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Technician Assignment
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Select Verified Provider</label>
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">Choose technician...</option>
                {providers.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.businessName} ({prov.rating}★, {prov.completedJobs} jobs)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assign Technician</span>
            </button>

            {assignmentSuccess && (
              <span className="text-[11px] text-emerald-700 font-bold block text-center">
                ✓ Technician assigned to order
              </span>
            )}
          </form>

          {/* Schedule Job */}
          <form onSubmit={handleScheduleAppointment} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Dispatch Schedule
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Dispatch Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Start Time</label>
                <input
                  type="time"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">End Time</label>
                <input
                  type="time"
                  value={scheduledEndTime}
                  onChange={(e) => setScheduledEndTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            {scheduleConflict && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-1.5 font-medium border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Double-booking conflict detected for technician!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirm & Lock Appointment</span>
            </button>

            {scheduleSuccess && (
              <span className="text-[11px] text-emerald-700 font-bold block text-center">
                ✓ Appointment scheduled & calendar updated
              </span>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
