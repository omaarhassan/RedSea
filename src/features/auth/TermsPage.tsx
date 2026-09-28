import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t('common.back', 'Back to Home')}</span>
        </Link>
        <span className="text-[11px] text-slate-400 font-medium">Effective: August 2026</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('auth.termsTitle', 'Terms & Conditions')}
            </h1>
            <p className="text-xs text-slate-500">Red Sea Connect Managed Property & Maintenance Services</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600">
          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or registering for Red Sea Connect, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">2. Managed Service Operations</h2>
            <p>
              Red Sea Connect operates a centralized dispatch and quality-assurance system for residential, commercial, and property maintenance in Ras Gharib, Hurghada, Safaga, El Quseir, and Marsa Alam. All work orders undergo operational review and quotation approval before provider dispatch.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">3. User Registration & Security</h2>
            <p>
              Users must provide accurate, current, and complete personal and contact details during registration. You are responsible for maintaining the confidentiality of your credentials and all activity under your account.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">4. Transparent Quotations & Pricing</h2>
            <p>
              Service quotes issued via the platform are binding upon customer acceptance. Any unexpected onsite scope alterations require customer pre-approval prior to execution.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">5. Quality Guarantee & Disputes</h2>
            <p>
              Completed work orders include guaranteed workmanship. In the event of an issue, requests are inspected and rectified according to our satisfaction warranty policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
