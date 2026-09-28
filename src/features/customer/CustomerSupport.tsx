import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Headphones, Phone, MessageSquare, ShieldCheck, 
  Send, HelpCircle, CheckCircle2, MapPin, Clock 
} from 'lucide-react';

export const CustomerSupport: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { cities, currentCityId, currentLanguage } = useAppStore();
  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];

  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSentSuccess(true);
    setMessage('');
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Support Header */}
      <div className="bg-gradient-to-r from-[#0F3966] to-[#1A5494] rounded-3xl p-6 text-white space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-semibold">
          <Headphones className="w-3.5 h-3.5 text-orange-400" />
          <span>Red Sea Connect Operations Desk</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">{t('support.title')}</h1>
        <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
          {t('support.subtitle')}
        </p>
      </div>

      {/* Direct Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="tel:+201000000000"
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-500 shadow-xs flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">{t('support.callUs')}</div>
            <div className="text-[11px] text-slate-500">{t('support.phoneHours')}</div>
          </div>
        </a>

        <a
          href="https://wa.me/201000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-green-500 shadow-xs flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">{t('support.whatsapp')}</div>
            <div className="text-[11px] text-slate-500">Instant Chat Dispatch</div>
          </div>
        </a>
      </div>

      {/* Local Operations Hub Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Local Operations Hub — {currentLanguage === 'ar' ? currentCity.name_ar : currentCity.name_en}
        </h3>
        <div className="space-y-2 text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Coverage: {currentCity.serviceAreas?.join(', ') || 'Metropolitan Area'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Operating Hours: {currentCity.operatingHours} (Cairo Time)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Emergency Coverage: {currentCity.emergencyAvailable ? 'Available 24/7' : 'Standard Hours'}</span>
          </div>
        </div>
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Send an Inquiry or Feedback</h3>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can our operations team assist you today?"
          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F3966]"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0F3966] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>Send Message</span>
          </button>

          {sentSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Message delivered to dispatch!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
