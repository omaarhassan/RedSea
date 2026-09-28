import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, MapPin, Globe, 
  CheckCircle, AlertCircle, Loader2, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { signUpSchema, SignUpFormData } from './schemas';
import { useAuth } from './AuthContext';
import { useAppStore } from '../../stores/useAppStore';
import { LanguageCode } from '../../types';
import { setAppLanguage } from '../../i18n';

export const SignUpPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signup, signInWithGoogle, isSubmitting, authError, isOperationNotAllowed, clearAuthError } = useAuth();
  const { cities, currentCityId } = useAppStore();

  const [passwordVisible, setPasswordVisible] = useState(false);

  const activeLang = (i18n.language as LanguageCode) || 'en';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      cityId: currentCityId || 'city-ras-gharib',
      preferredLanguage: activeLang,
      termsAccepted: false,
    },
  });

  const selectedLanguage = watch('preferredLanguage');
  const termsChecked = watch('termsAccepted');

  const handleLanguageSwitch = (lang: LanguageCode) => {
    setValue('preferredLanguage', lang);
    setAppLanguage(lang);
    clearAuthError();
  };

  const handleGoogleSignUp = async () => {
    clearAuthError();
    const result = await signInWithGoogle();
    if (result.success) {
      if (['ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'].includes(result.role || '')) {
        navigate('/admin', { replace: true });
      } else if (result.role === 'PROVIDER') {
        navigate('/provider', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    clearAuthError();
    const result = await signup(data);
    if (result.success) {
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Branding & Language Selector Bar */}
        <div className="bg-[#0A2544] text-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-blue-900/40">
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

          {/* Language Selector Pill */}
          <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedLanguage === 'en'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('ar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer font-arabic ${
                selectedLanguage === 'ar'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('zh')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedLanguage === 'zh'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-start space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('auth.signup.title', 'Create your account')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t('auth.signup.subtitle', 'Access local services with one simple account.')}
            </p>
          </div>

          {/* Firebase Console Configuration Helper Card */}
          {isOperationNotAllowed && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-start animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Enable Email/Password in Firebase Console</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                To create accounts with email and password, enable the provider in your Firebase project:
              </p>
              <ol className="text-[11px] text-amber-900 list-decimal list-inside space-y-1 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/60 font-medium">
                <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-amber-950">Firebase Console</a></li>
                <li>Navigate to <strong>Authentication &rarr; Sign-in method</strong></li>
                <li>Click <strong>Email/Password</strong> and toggle <strong>Enable</strong></li>
              </ol>
              <div className="pt-1">
                <Link
                  to="/login"
                  className="text-[11px] font-bold text-blue-800 hover:text-blue-950 underline"
                >
                  Or click here to use 1-Click Fast Sign In &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Global Auth Error Alert */}
          {authError && !isOperationNotAllowed && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                {t('auth.fullName', 'Full Name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('auth.placeholders.fullName', 'e.g., Karim Mostafa')}
                  {...register('fullName')}
                  className={`w-full min-h-[44px] ps-10 pe-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 bg-white focus:border-[#0A2544] focus:ring-blue-900/20'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-red-600 font-medium ps-1">
                  {t(errors.fullName.message || 'auth.validation.nameMin')}
                </p>
              )}
            </div>

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

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                {t('auth.phone', 'Phone Number')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  dir="ltr"
                  placeholder={t('auth.placeholders.phone', '+20 100 123 4567')}
                  {...register('phone')}
                  className={`w-full min-h-[44px] ps-10 pe-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 bg-white focus:border-[#0A2544] focus:ring-blue-900/20'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-red-600 font-medium ps-1">
                  {t(errors.phone.message || 'auth.validation.phoneInvalid')}
                </p>
              )}
            </div>

            {/* City & Preferred Language grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* City Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t('auth.city', 'Operational City')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    {...register('cityId')}
                    className="w-full min-h-[44px] ps-10 pe-8 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {activeLang === 'ar' ? city.name_ar : activeLang === 'zh' ? city.name_zh : city.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.cityId && (
                  <p className="text-[11px] text-red-600 font-medium ps-1">
                    {t(errors.cityId.message || 'auth.validation.cityRequired')}
                  </p>
                )}
              </div>

              {/* Preferred Language */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t('auth.preferredLanguage', 'Preferred Language')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    {...register('preferredLanguage')}
                    onChange={(e) => handleLanguageSwitch(e.target.value as LanguageCode)}
                    className="w-full min-h-[44px] ps-10 pe-8 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic RTL)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                {t('auth.password', 'Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder={t('auth.placeholders.password', 'Minimum 6 characters')}
                  {...register('password')}
                  className={`w-full min-h-[44px] ps-10 pe-10 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 bg-white focus:border-[#0A2544] focus:ring-blue-900/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  {passwordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-600 font-medium ps-1">
                  {t(errors.password.message || 'auth.validation.passwordMin')}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                {t('auth.confirmPassword', 'Confirm Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder={t('auth.placeholders.confirmPassword', 'Re-enter your password')}
                  {...register('confirmPassword')}
                  className={`w-full min-h-[44px] ps-10 pe-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 bg-white focus:border-[#0A2544] focus:ring-blue-900/20'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 font-medium ps-1">
                  {t(errors.confirmPassword.message || 'auth.validation.passwordsDontMatch')}
                </p>
              )}
            </div>

            {/* Mandatory Terms & Conditions Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  {t('auth.termsAgreePrefix', 'I agree to the')}{' '}
                  <Link to="/terms" target="_blank" className="font-bold text-blue-700 underline hover:text-blue-800">
                    {t('auth.termsTitle', 'Terms & Conditions')}
                  </Link>{' '}
                  {t('auth.and', 'and')}{' '}
                  <Link to="/privacy" target="_blank" className="font-bold text-blue-700 underline hover:text-blue-800">
                    {t('auth.privacyTitle', 'Privacy Policy')}
                  </Link>
                  .
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-[11px] text-red-600 font-medium mt-1 ps-1">
                  {t('auth.validation.termsRequired', 'You must agree to the Terms & Conditions to register.')}
                </p>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !termsChecked}
              className={`w-full min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                isSubmitting || !termsChecked
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('auth.creatingAccount', 'CREATING ACCOUNT...')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.createAccount', 'CREATE ACCOUNT WITH EMAIL')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign Up Option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                {t('common.or', 'OR')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting}
            className="w-full min-h-[46px] rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{t('auth.continueWithGoogle', 'Sign up with Google')}</span>
          </button>

          {/* Secondary Switch to Sign In */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <div>
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <Link
                to="/login"
                className="font-extrabold text-blue-700 hover:text-blue-900 underline uppercase tracking-wider ms-1"
              >
                {t('auth.signIn', 'SIGN IN')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
