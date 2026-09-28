import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('auth.privacyTitle', 'Privacy Policy')}
            </h1>
            <p className="text-xs text-slate-500">How Red Sea Connect protects and respects your personal data</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600">
          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">1. Data We Collect</h2>
            <p>
              We collect essential contact information (full name, phone number, email address, service address, and operational city) to coordinate on-site technician visits, issue quotations, and manage communication.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">2. Usage of Your Information</h2>
            <p>
              Your data is exclusively utilized to:
            </p>
            <ul className="list-disc ps-5 space-y-1 mt-1">
              <li>Process service work orders and dispatch verified technicians.</li>
              <li>Provide transparent pricing quotations and order status updates.</li>
              <li>Facilitate customer service and quality warranty inspections.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">3. Authentication & Credential Storage</h2>
            <p>
              User authentication is managed securely through Firebase Authentication. We never store raw passwords or unencrypted credentials. Your profile is protected with role-based access control rules.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">4. Third-Party Sharing</h2>
            <p>
              We do not sell, rent, or monetize your personal data. Field service technicians only receive relevant job address and phone details necessary for the scheduled appointment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
