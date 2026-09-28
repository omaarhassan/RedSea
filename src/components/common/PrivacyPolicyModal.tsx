import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, X, Lock, Eye, FileText, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0A2544] text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                {t('auth.privacyTitle', 'Privacy Policy & Data Protection')}
              </h2>
              <p className="text-[11px] text-slate-300">
                Red Sea Connect Technologies S.A.E. • Active Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-medium">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your personal data and service addresses are strictly protected. We never monetize, sell, or disclose your information to third-party advertisers.
            </span>
          </div>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">1</span>
              <span>Information We Collect</span>
            </h3>
            <p className="text-slate-600 ps-7">
              We collect only the essential details necessary to process your maintenance orders and dispatch field technicians:
            </p>
            <ul className="list-disc ps-12 space-y-1 text-slate-600 mt-1 text-xs">
              <li>Contact details: full name, verified phone number, and email address.</li>
              <li>Service location: street address, building/unit details, and GPS coordinates across Red Sea cities.</li>
              <li>Technical details: photographs of appliances, equipment specifications, and reported service notes.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">2</span>
              <span>How Your Information is Used</span>
            </h3>
            <p className="text-slate-600 ps-7">
              Information is processed exclusively to:
            </p>
            <ul className="list-disc ps-12 space-y-1 text-slate-600 mt-1 text-xs">
              <li>Validate service requests and calculate transparent itemized quotations.</li>
              <li>Coordinate field visits with licensed, verified technicians in your city.</li>
              <li>Provide real-time dispatch updates and enforce our 30-day workmanship warranty.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">3</span>
              <span>Authentication & Secure Storage</span>
            </h3>
            <p className="text-slate-600 ps-7">
              Account authentication is handled through encrypted Firebase Authentication tokens. Passwords and credentials are never stored in raw plaintext or exposed in client logs. Role-based security rules strictly quarantine access to authorized accounts.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">4</span>
              <span>Technician Data Privacy Boundaries</span>
            </h3>
            <p className="text-slate-600 ps-7">
              Field technicians assigned to your work order receive only the active job address and customer contact phone required to perform the appointment. They do not have access to your historical account records, payment credentials, or other private requests.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">5</span>
              <span>Your Data Rights & Erasure</span>
            </h3>
            <p className="text-slate-600 ps-7">
              You have the right to request a complete export or deletion of your profile and service history at any time by contacting our Data Protection Officer at <span className="font-mono text-slate-900 font-semibold">privacy@redseaconnect.com</span>.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Compliant with Egyptian Personal Data Protection Law
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ms-auto"
          >
            <Check className="w-4 h-4" />
            <span>Understood & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
