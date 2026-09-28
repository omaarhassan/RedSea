import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Mail, AlertCircle, CheckCircle, Loader2, ArrowLeft, KeyRound 
} from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordFormData } from './schemas';
import { useAuth } from './AuthContext';
import { LanguageCode } from '../../types';
import { setAppLanguage } from '../../i18n';

export const ForgotPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { resetPassword, isSubmitting, authError, clearAuthError } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const activeLang = (i18n.language as LanguageCode) || 'en';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleLanguageSwitch = (lang: LanguageCode) => {
    setAppLanguage(lang);
    clearAuthError();
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearAuthError();
    const result = await resetPassword(data.email);
    if (result.success) {
      setEmailSent(true);
      setSentToEmail(data.email);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Branding Bar */}
        <div className="bg-[#0A2544] text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-sm border border-white/20">
              <span>RS</span>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 -ms-0.5 -mt-2"></div>
            </div>
            <div>
              <div className="font-black tracking-tight text-base sm:text-lg uppercase">
                RED SEA <span className="text-orange-500">CONNECT</span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium tracking-wider uppercase">
                {t('brand.tagline', 'Local services, made simple.')}
              </div>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeLang === 'en' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('ar')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer font-arabic ${
                activeLang === 'ar' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('zh')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeLang === 'zh' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-8 space-y-6">
          {!emailSent ? (
            <>
              <div className="text-start space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('auth.forgotPasswordTitle', 'Reset your password')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t(
                    'auth.forgotPasswordSubtitle',
                    "Enter your email address and we'll send you a link to reset your password."
                  )}
                </p>
              </div>

              {/* Global Auth Error */}
              {authError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{authError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('auth.email', 'Email Address')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      dir="ltr"
                      placeholder={t('auth.placeholders.email', 'name@example.com')}
                      {...register('email')}
                      className={`w-full min-h-[44px] ps-10 pe-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-300 bg-red-50/30 focus:ring-red-400'
                          : 'border-slate-300 bg-white focus:border-[#0A2544] focus:ring-blue-900/20'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium ps-1">
                      {t(errors.email.message || 'auth.validation.emailInvalid')}
                    </p>
                  )}
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    isSubmitting
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('auth.sendingResetLink', 'SENDING RESET LINK...')}</span>
                    </>
                  ) : (
                    <span>{t('auth.sendResetEmail', 'SEND RESET LINK')}</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">
                  {t('auth.resetEmailSentTitle', 'Check your email')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {t(
                    'auth.resetEmailSentMessage',
                    'Check your email for instructions to reset your password.'
                  )}
                </p>
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-mono text-slate-800 break-all font-bold">
                  {sentToEmail}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                >
                  {t('auth.tryAnotherEmail', 'Did not receive it? Try another email')}
                </button>
              </div>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t('auth.backToSignIn', 'Back to Sign In')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
