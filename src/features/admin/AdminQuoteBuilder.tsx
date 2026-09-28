import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  ArrowLeft, Plus, Trash2, DollarSign, Sparkles, 
  Send, ShieldCheck, Check, AlertCircle 
} from 'lucide-react';
import { QuoteLineItem } from '../../types';

export const AdminQuoteBuilder: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const { workOrders, providers, createQuote, quotes } = useAppStore();

  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || workOrders[0]?.id || '');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  
  // Line items state
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    {
      id: 'item-1',
      description: 'Standard Labor & Diagnostics Fee',
      quantity: 1,
      unitPrice: 300,
      total: 300,
      providerCost: 180,
    },
    {
      id: 'item-2',
      description: 'Replacement Parts & Materials',
      quantity: 1,
      unitPrice: 250,
      total: 250,
      providerCost: 160,
    },
  ]);

  const [discount, setDiscount] = useState(0);
  const [serviceFee, setServiceFee] = useState(50);
  const [tax, setTax] = useState(0);
  const [customerNote, setCustomerNote] = useState(
    'Includes Red Sea Connect quality assurance and standard 30-day workmanship guarantee.'
  );
  const [internalNote, setInternalNote] = useState('');
  const [validDays, setValidDays] = useState(3);

  const selectedOrder = workOrders.find((w) => w.id === selectedOrderId);

  // Sync provider from order if assigned
  useEffect(() => {
    if (selectedOrder?.assignedProviderId) {
      setSelectedProviderId(selectedOrder.assignedProviderId);
    }
  }, [selectedOrderId, selectedOrder]);

  // Add Line Item
  const handleAddLineItem = () => {
    const newItem: QuoteLineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 100,
      total: 100,
      providerCost: 70,
    };
    setLineItems([...lineItems, newItem]);
  };

  // Remove Line Item
  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  // Update Line Item Field
  const handleUpdateItem = (id: string, field: keyof QuoteLineItem, val: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const total = Math.max(0, subtotal - Number(discount) + Number(serviceFee) + Number(tax));
  const totalProviderCost = lineItems.reduce(
    (sum, i) => sum + (Number(i.providerCost || 0) * Number(i.quantity || 1)),
    0
  );
  const grossMargin = total - totalProviderCost;
  const marginPercentage = total > 0 ? Number(((grossMargin / total) * 100).toFixed(2)) : 0;

  const handleSendQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const providerObj = providers.find((p) => p.id === selectedProviderId);

    const validUntilDate = new Date(Date.now() + validDays * 86400000).toISOString();

    createQuote({
      workOrderId: selectedOrder.id,
      workOrderNumber: selectedOrder.workOrderNumber,
      providerId: selectedProviderId || undefined,
      providerName: providerObj?.businessName || undefined,
      status: 'SENT',
      lineItems,
      subtotal,
      discount: Number(discount),
      serviceFee: Number(serviceFee),
      tax: Number(tax),
      total,
      providerCost: totalProviderCost,
      margin: grossMargin,
      marginPercentage,
      currency: 'EGP',
      validUntil: validUntilDate,
      customerNote,
      internalNote,
      createdBy: 'Operations Center',
    });

    navigate(`/admin/orders/${selectedOrder.id}`);
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Registry</span>
        </button>

        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
          Official Quotation & Margin Engine
        </span>
      </div>

      <form onSubmit={handleSendQuotation} className="space-y-6">
        {/* Step 1: Work Order & Provider Assignment Context */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Target Work Order & Technician
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Select Work Order *</label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-mono font-bold"
              >
                {workOrders.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.workOrderNumber} — {wo.serviceTypeName} ({wo.customerName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Assign Technician (Optional)</label>
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">Select later / Auto dispatch</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.businessName} ({p.rating}★)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedOrder && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex justify-between items-center">
              <div>
                <span className="font-bold">Customer: </span>
                <span>{selectedOrder.customerName} ({selectedOrder.customerPhone})</span>
                <span className="mx-2">•</span>
                <span className="font-bold">Location: </span>
                <span>{selectedOrder.cityName}</span>
              </div>
              <span className="text-[11px] text-blue-700 font-mono">{selectedOrder.status}</span>
            </div>
          )}
        </div>

        {/* Step 2: Line Items Manager */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Itemized Pricing & Provider Cost</h2>
              <p className="text-[11px] text-slate-400">Specify customer charge and contractor cost per item</p>
            </div>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                {/* Description */}
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Item Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g. Chemical coil cleaning..."
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Client Unit Price (EGP) */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Client Unit (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Provider Cost (EGP) - ADMIN ONLY */}
                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-orange-600 mb-1">Provider Cost</label>
                  <input
                    type="number"
                    min="0"
                    value={item.providerCost || 0}
                    onChange={(e) => handleUpdateItem(item.id, 'providerCost', Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-orange-200 bg-orange-50/50"
                  />
                </div>

                {/* Remove */}
                <div className="col-span-1 flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Adjustments: Discount & Service Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Discount (EGP)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Platform Service Fee (EGP)</label>
              <input
                type="number"
                min="0"
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Quote Validity (Days)</label>
              <input
                type="number"
                min="1"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Real-Time Margin & Revenue Dashboard */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <span className="font-bold text-xs text-orange-400 uppercase tracking-wider">
              Financial Margin Analysis
            </span>
            <span className="text-xs text-slate-300">Live Calculation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">CUSTOMER BILLING</span>
              <div className="text-2xl font-black text-white">{total} EGP</div>
              <span className="text-[10px] text-slate-400">Includes {serviceFee} EGP platform fee</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">PROVIDER PAYOUT</span>
              <div className="text-2xl font-bold text-slate-300">{totalProviderCost} EGP</div>
              <span className="text-[10px] text-slate-400">Direct labor & parts cost</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">GROSS MARGIN</span>
              <div className="text-2xl font-black text-emerald-400">+{grossMargin} EGP</div>
              <span className="text-[10px] text-slate-400">Platform retained profit</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">MARGIN RATIO</span>
              <div className="text-2xl font-black text-orange-400">{marginPercentage}%</div>
              <span className="text-[10px] text-slate-400">Target: &gt; 25%</span>
            </div>
          </div>
        </div>

        {/* Step 4: Notes & Guarantee */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Customer Notes & Warranty Terms
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Customer Note & Scope Details</label>
            <textarea
              rows={2}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Internal Operational Notes (Confidential)</label>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="e.g. Freon R410A price negotiated with Ahmed."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs font-bold shadow-lg shadow-orange-900/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Send Offer to Customer</span>
          </button>
        </div>
      </form>
    </div>
  );
};
