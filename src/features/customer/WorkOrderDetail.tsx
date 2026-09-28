import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  ArrowLeft, Clock, Calendar, MapPin, User, ShieldCheck, 
  Phone, CheckCircle2, Star, Sparkles, 
  FileText, Check, CreditCard, Receipt, Banknote,
  DollarSign, AlertCircle, Building 
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import confetti from 'canvas-confetti';

export const WorkOrderDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    workOrders, 
    quotes, 
    providers, 
    acceptQuote, 
    declineQuote, 
    submitCustomerReview,
    currentLanguage 
  } = useAppStore();

  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const workOrder = workOrders.find((w) => w.id === id);
  const quote = quotes.find((q) => q.workOrderId === id || q.id === workOrder?.quoteId);
  const provider = providers.find((p) => p.id === workOrder?.assignedProviderId);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  if (!workOrder) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Work order not found.</p>
        <button
          onClick={() => navigate('/requests')}
          className="px-4 py-2 bg-[#0F3966] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          View All Requests
        </button>
      </div>
    );
  }

  const handleAcceptOffer = () => {
    if (quote) {
      acceptQuote(quote.id);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0F3966', '#10B981', '#F59E0B'],
        });
      } catch (e) {}
    }
  };

  const handleDeclineOffer = () => {
    if (quote && window.confirm('Are you sure you want to decline this quotation? Our team will contact you to adjust the scope.')) {
      declineQuote(quote.id);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitCustomerReview(workOrder.id, rating, reviewComment);
    setShowReviewSuccess(true);
  };

  const statusTimeline = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'QUOTE_SENT', label: 'Quote Ready' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getTimelineStepIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 0;
      case 'QUOTE_SENT':
      case 'QUOTE_ACCEPTED':
        return 1;
      case 'SCHEDULED':
      case 'ASSIGNED':
        return 2;
      case 'EN_ROUTE':
      case 'IN_PROGRESS':
        return 3;
      case 'COMPLETED':
      case 'CLOSED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getTimelineStepIndex(workOrder.status);

  // Compute payment status presentation
  const isPaid = workOrder.status === 'COMPLETED' || workOrder.status === 'CLOSED';
  const isAccepted = quote?.status === 'ACCEPTED' || ['SCHEDULED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'].includes(workOrder.status);
  const paymentBadge = isPaid ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>Paid in Full</span>
    </span>
  ) : isAccepted ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
      <span>Payable Upon Completion</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <Receipt className="w-3.5 h-3.5 text-slate-500" />
      <span>Pending Quote Acceptance</span>
    </span>
  );

  return (
    <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto space-y-5">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t('workOrder.backToRequests')}</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {workOrder.workOrderNumber}
        </span>
      </div>

      {/* Main Work Order Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {workOrder.serviceCategoryName}
              </span>
              <PriorityBadge priority={workOrder.priority} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {workOrder.serviceTypeName}
            </h1>
          </div>
          <StatusBadge status={workOrder.status} size="lg" />
        </div>

        {/* Timeline Progress Bar */}
        <div className="pt-2 pb-1 border-t border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 inset-x-4 h-0.5 bg-slate-200 -z-0">
              <div 
                className="h-full bg-[#0F3966] transition-all duration-500"
                style={{ width: `${(currentStepIdx / (statusTimeline.length - 1)) * 100}%` }}
              ></div>
            </div>

            {statusTimeline.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center z-10">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      isPastOrCurrent 
                        ? 'bg-[#0F3966] text-white shadow-xs' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {idx < currentStepIdx ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 hidden sm:block ${isPastOrCurrent ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment & Order Accounting Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0F3966] flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Payment & Invoice Summary
              </h3>
              <p className="text-[11px] text-slate-500">
                Service Order Ref: {workOrder.workOrderNumber}
              </p>
            </div>
          </div>
          <div>{paymentBadge}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Billable</span>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {quote ? `${quote.total} ${quote.currency}` : 'Pending Quote'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Payment Mode</span>
            <div className="font-semibold text-slate-800 mt-0.5">
              Cash on Site / Card / Wallet
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Warranty Protection</span>
            <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>30-Day Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Offer / Quotation Card */}
      {quote && (
        <div className={`rounded-2xl p-5 sm:p-6 border shadow-sm space-y-5 ${
          quote.status === 'SENT' 
            ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="font-bold text-base text-slate-900">{t('quote.officialOffer')}</h2>
                <p className="text-[11px] text-slate-500">Transparent itemized pricing for your service</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
              quote.status === 'ACCEPTED' 
                ? 'bg-emerald-100 text-emerald-800' 
                : quote.status === 'DECLINED' 
                ? 'bg-rose-100 text-rose-800' 
                : 'bg-amber-100 text-amber-900 animate-pulse'
            }`}>
              {quote.status}
            </span>
          </div>

          {/* Line Items Table */}
          <div className="divide-y divide-slate-100">
            {quote.lineItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{item.description}</div>
                  <div className="text-slate-400 text-[11px]">Qty: {item.quantity} × {item.unitPrice} {quote.currency}</div>
                </div>
                <div className="font-bold text-slate-900 whitespace-nowrap">
                  {item.total} {quote.currency}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs border border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>{t('quote.subtotal')}:</span>
              <span className="font-medium">{quote.subtotal} {quote.currency}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{t('quote.discount')}:</span>
                <span className="font-medium">-{quote.discount} {quote.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{t('quote.serviceFee')}:</span>
              <span className="font-medium">{quote.serviceFee} {quote.currency}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>{t('quote.total')}:</span>
              <span className="text-orange-600 font-mono text-base">{quote.total} {quote.currency}</span>
            </div>
          </div>

          {/* Warranty & Guarantee note */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-[#0F3966]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-bold">{t('quote.warranty')}</span>
              <p className="text-[11px] text-blue-800/80 mt-0.5 leading-relaxed">
                {quote.customerNote || 'Includes Red Sea Connect quality assurance and 30-day workmanship warranty.'}
              </p>
            </div>
          </div>

          {/* Quote Action Buttons */}
          {quote.status === 'SENT' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDeclineOffer}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {t('quote.decline')}
              </button>
              <button
                onClick={handleAcceptOffer}
                className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-orange-900/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('quote.accept')}</span>
              </button>
            </div>
          )}

          {quote.status === 'ACCEPTED' && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Quotation accepted. Our operations team has scheduled your technician.</span>
            </div>
          )}
        </div>
      )}

      {/* Assigned Technician Profile */}
      {provider && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t('provider.assigned')}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={provider.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
                alt={provider.businessName}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900">{provider.businessName}</h3>
                  {provider.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {provider.rating}
                  </span>
                  <span>•</span>
                  <span>{provider.completedJobs} jobs completed</span>
                </div>
              </div>
            </div>

            <a
              href={`tel:${provider.phone}`}
              className="p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              title="Call Technician"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      {/* Service Request Requirements Details */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          {t('workOrder.details')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
              <span className="font-medium text-slate-900">{workOrder.addressText} ({workOrder.cityName})</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Preferred Schedule</span>
              <span className="font-medium text-slate-900">{workOrder.preferredDate} • {workOrder.preferredTime}</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-1">Issue Description</span>
          <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
            {workOrder.description}
          </p>
        </div>

        {/* Dynamic Form Specs */}
        {workOrder.formData && Object.keys(workOrder.formData).length > 0 && (
          <div className="pt-2">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-1.5">Submitted Specifications</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {Object.entries(workOrder.formData).map(([k, v]) => (
                <div key={k} className="text-[11px]">
                  <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}: </span>
                  <span className="font-semibold text-slate-900">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {workOrder.attachments && workOrder.attachments.length > 0 && (
          <div className="pt-2">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-1.5">
              Photos & Documentation ({workOrder.attachments.length})
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {workOrder.attachments.map((att) => (
                <div key={att.id} className="rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 relative group">
                  <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 end-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    {att.uploadedBy}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completed State: Review & Rating Section */}
      {workOrder.status === 'COMPLETED' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base">Service Completed Successfully</h3>
          </div>

          {workOrder.rating ? (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Your Rating:</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < workOrder.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
              </div>
              {workOrder.reviewComment && (
                <p className="text-slate-700 italic">"{workOrder.reviewComment}"</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  How was your experience with Red Sea Connect and the specialist?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share any comments regarding quality, timeliness, and technician cleanliness..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F3966]"
              />

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      )}

      {/* Support Banner */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="text-xs">
          <span className="font-bold text-slate-900 block">Need assistance with this order?</span>
          <span className="text-slate-500">Our Ras Gharib operations center is ready to assist.</span>
        </div>
        <button
          onClick={() => navigate('/support')}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
        >
          {t('nav.support')}
        </button>
      </div>
    </div>
  );
};
