import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, ShieldCheck, FileText, 
  ExternalLink, ArrowUpRight, CheckCircle2, Globe 
} from 'lucide-react';
import { PrivacyPolicyModal } from '../common/PrivacyPolicyModal';
import { useAppStore } from '../../stores/useAppStore';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { currentLanguage, setLanguage } = useAppStore();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 md:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                <span>RS</span>
              </div>
              <span className="font-black text-base sm:text-lg tracking-tight text-white uppercase">
                RED SEA <span className="text-orange-500">CONNECT</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The centralized managed services platform for residential, commercial, and property maintenance across the Red Sea governorate. Verified specialists, guaranteed workmanship, and transparent quotations.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Licensed & Insured Specialists</span>
              </div>
            </div>
          </div>

          {/* Core Services Column */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              {t('nav.services', 'Services')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Air Conditioning</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Electrical Systems</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Plumbing & Pumps</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Deep Cleaning & Sanitization</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Appliance Maintenance</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Cities Column */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              {t('city.selectCity', 'Coverage Areas')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Ras Gharib (Main Hub)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Hurghada</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>El Gouna</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Safaga & Soma Bay</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Marsa Alam</span>
              </li>
            </ul>
          </div>

          {/* Legal & Contact Column */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Compliance & Help
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-white transition-colors cursor-pointer text-start flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span>Contact Operations</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Central Dispatch:</div>
                <div className="font-mono text-slate-400">+20 100 123 4567</div>
                <div className="font-mono text-slate-400">support@redseaconnect.com</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Red Sea Connect Technologies S.A.E. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Global Language Switcher */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  currentLanguage === 'en' ? 'bg-[#0F3966] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-2 py-0.5 rounded font-bold font-arabic transition-all cursor-pointer ${
                  currentLanguage === 'ar' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                العربية
              </button>
            </div>

            <span className="hidden sm:inline">•</span>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-slate-200 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Global Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </footer>
  );
};
