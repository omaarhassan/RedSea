import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Globe, Shield, ShieldCheck,
  Check, Save, LogOut, Loader2, AlertCircle, Edit3, X,
  Bell, Smartphone, Zap, Sliders, Settings, Copy,
  HardDrive, Compass, Wifi, WifiOff, Download
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useAppStore } from '../../stores/useAppStore';
import { LanguageCode } from '../../types';
import { setAppLanguage } from '../../i18n';
import { useFCMNotifications } from '../../hooks/useFCMNotifications';
import { PushNotificationSettingsModal } from '../../components/common/PushNotificationSettingsModal';
import { useCoastalPersistence } from '../../hooks/useCoastalPersistence';
import { CoastalTravelCacheModal } from '../../components/common/CoastalTravelCacheModal';
import { PrivacyPolicyModal } from '../../components/common/PrivacyPolicyModal';

export const CustomerProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, currentUser, logout, updateProfile, isSubmitting } = useAuth();
  const { cities, currentCityId, setCity, setLanguage: setStoreLang } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [addressText, setAddressText] = useState(profile?.addressText || '');
  const [cityId, setCityId] = useState(profile?.cityId || currentCityId || 'city-ras-gharib');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Push Notifications state
  const { isPermissionGranted, permission, deviceToken, preferences, triggerTestPush, requestPermission } = useFCMNotifications();
  const [showPushModal, setShowPushModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Coastal Offline Persistence state
  const { 
    effectiveOffline, 
    cachedOrdersCount, 
    cachedQuotesCount, 
    lastPrecachedAt, 
    isPrecaching, 
    precacheForTravel 
  } = useCoastalPersistence();
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [precacheDone, setPrecacheDone] = useState(false);

  const handlePrecacheNow = async () => {
    await precacheForTravel();
    setPrecacheDone(true);
    setTimeout(() => setPrecacheDone(false), 3000);
  };
  const { workOrders } = useAppStore();

  const handleCopy = () => {
    if (!deviceToken) return;
    navigator.clipboard.writeText(deviceToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleTest = async () => {
    if (workOrders.length > 0) {
      await triggerTestPush(workOrders[0], 'EN_ROUTE');
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const activeLang = (i18n.language as LanguageCode) || 'en';

  const currentCityObj = cities.find((c) => c.id === (profile?.cityId || cityId)) || cities[0];

  const getCityName = (city: typeof currentCityObj) => {
    if (activeLang === 'ar') return city?.name_ar || city?.name_en;
    if (activeLang === 'zh') return city?.name_zh || city?.name_en;
    return city?.name_en;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg(t('auth.validation.nameMin', 'Full name is required'));
      return;
    }

    const result = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressText: addressText.trim(),
      cityId,
    });

    if (result.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMsg(result.error || 'Failed to update profile.');
    }
  };

  const handleLanguageChange = async (lang: LanguageCode) => {
    setAppLanguage(lang);
    setStoreLang(lang);
    if (profile) {
      await updateProfile({ preferredLanguage: lang });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const userInitials = (profile?.fullName || currentUser?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0A2544] to-[#1A5494] flex items-center justify-center text-white text-xl font-black border-2 border-white shadow-md">
            {userInitials}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {profile?.fullName || currentUser?.displayName || 'Customer Account'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {currentUser?.email || profile?.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                {profile?.isActive !== false ? t('profile.activeStatus', 'Active Account') : 'Pending'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                <span>{profile?.role || 'CUSTOMER'}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setFullName(profile?.fullName || '');
            setPhone(profile?.phone || '');
            setAddressText(profile?.addressText || '');
            setCityId(profile?.cityId || currentCityId || 'city-ras-gharib');
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
        >
          {isEditing ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>{t('common.cancel', 'Cancel')}</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('profile.editProfile', 'Edit Profile')}</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('profile.savedSuccess', 'Profile updated successfully!')}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Details or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t('profile.editPersonalInfo', 'Edit Personal Information')}</span>
            <span className="text-[11px] text-slate-400 font-normal">{t('profile.roleLocked', 'Role cannot be changed')}</span>
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('auth.fullName', 'Full Name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs sm:text-sm ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A2544]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('auth.phone', 'Phone Number')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A2544]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('auth.city', 'Operational City')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setCity(e.target.value);
                }}
                className="w-full text-xs sm:text-sm ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A2544] cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {activeLang === 'ar' ? city.name_ar : activeLang === 'zh' ? city.name_zh : city.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('profile.defaultAddress', 'Service Address')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <textarea
                rows={2}
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Building, street, apartment..."
                className="w-full text-xs sm:text-sm ps-9 pe-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A2544]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{t('profile.saveChanges', 'Save Changes')}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('profile.personalInfo', 'Personal Information')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 font-medium">{t('auth.fullName', 'Full Name')}</div>
              <div className="font-bold text-slate-900 mt-0.5 text-sm">
                {profile?.fullName || currentUser?.displayName || '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 font-medium">{t('auth.email', 'Email Address')}</div>
              <div className="font-bold text-slate-900 mt-0.5 text-sm font-mono break-all">
                {currentUser?.email || profile?.email || '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 font-medium">{t('auth.phone', 'Phone Number')}</div>
              <div className="font-bold text-slate-900 mt-0.5 text-sm font-mono">
                {profile?.phone || '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 font-medium">{t('auth.city', 'Operational City')}</div>
              <div className="font-bold text-slate-900 mt-0.5 text-sm">
                {getCityName(currentCityObj)}
              </div>
            </div>
          </div>

          {profile?.addressText && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="text-slate-400 font-medium">{t('profile.defaultAddress', 'Service Address')}</div>
              <div className="font-medium text-slate-800 mt-0.5">{profile.addressText}</div>
            </div>
          )}
        </div>
      )}

      {/* Language Preference Settings */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          {t('profile.preferences', 'Language & Regional Settings')}
        </h2>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            {t('profile.language', 'Preferred Language')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English (LTR)' },
              { code: 'ar', label: 'العربية (RTL)' },
              { code: 'zh', label: '中文 (LTR)' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code as LanguageCode)}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  activeLang === lang.code
                    ? 'border-[#0A2544] bg-blue-50 text-[#0A2544] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Firebase Cloud Messaging & Push Notifications Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Firebase Push Notifications (FCM)
              </h2>
              <p className="text-[11px] text-slate-500">
                Real-time browser & device alerts for work order status changes
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isPermissionGranted
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {isPermissionGranted ? 'FCM Enabled' : permission.toUpperCase()}
          </span>
        </div>

        {/* Device Registration Status */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Device Notification Channel</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {isPermissionGranted ? 'Connected' : 'Standby'}
            </span>
          </div>

          <div className="text-xs text-slate-600">
            {isPermissionGranted
              ? 'This device is securely registered to receive instant technician dispatch and quotation status updates.'
              : 'Enable push alerts to receive instantaneous technician dispatch and quotation updates directly on this device.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {!isPermissionGranted ? (
            <button
              type="button"
              onClick={requestPermission}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Enable Push Alerts</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTest}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-orange-400 hover:text-orange-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Send Sample FCM Alert</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPushModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Notification Preferences</span>
          </button>

          {testSent && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              Sample push alert triggered!
            </span>
          )}
        </div>
      </div>

      {/* Coastal Travel & Offline Persistence Settings */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0F3966] flex items-center justify-center">
              <Compass className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Coastal Travel & Offline Persistence
              </h2>
              <p className="text-[11px] text-slate-500">
                Firestore persistent cache for transit across remote Red Sea zones
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            effectiveOffline
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {effectiveOffline ? 'Offline Mode' : 'Online / Synced'}
          </span>
        </div>

        {/* Cached Summary Banner */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Firestore Local Cache Status</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              IndexedDB Multi-Tab
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[11px]">Cached Requests</div>
              <div className="font-bold text-slate-900 mt-0.5">{cachedOrdersCount} orders</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[11px]">Cached Quotes</div>
              <div className="font-bold text-slate-900 mt-0.5">{cachedQuotesCount} quotes</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1">
            Last pre-cached: {lastPrecachedAt ? new Date(lastPrecachedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Ready on device'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handlePrecacheNow}
            disabled={isPrecaching}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isPrecaching ? 'Pre-caching...' : 'Pre-cache for Coastal Travel'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCacheModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Manage Offline Storage</span>
          </button>

          {precacheDone && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              All data primed in offline cache!
            </span>
          )}
        </div>
      </div>

      {/* Privacy Policy & Personal Data Rights */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Privacy Policy & Data Protection
              </h2>
              <p className="text-[11px] text-slate-500">
                Transparent personal data management and compliance
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p>
            Your account credentials, contact phone, and service addresses are securely protected. We do not sell or monetize personal customer records.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              View Full Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="text-xs">
          <span className="font-bold text-slate-900 block">{t('auth.signout', 'Sign Out')}</span>
          <span className="text-slate-500">{t('profile.logoutSubtitle', 'End current session on this device.')}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('auth.logout', 'LOGOUT')}</span>
        </button>
      </div>

      <PushNotificationSettingsModal 
        isOpen={showPushModal} 
        onClose={() => setShowPushModal(false)} 
      />

      <CoastalTravelCacheModal
        isOpen={showCacheModal}
        onClose={() => setShowCacheModal(false)}
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};
