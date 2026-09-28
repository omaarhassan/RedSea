import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { useAuth } from '../../features/auth/AuthContext';
import { 
  MapPin, Globe, Bell, ChevronDown, Shield, User, HardHat, 
  Check, LogIn, LogOut, UserCheck, Users, Radio, Settings,
  HardDrive, WifiOff, Compass 
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import { PushNotificationSettingsModal } from '../common/PushNotificationSettingsModal';
import { useFCMNotifications } from '../../hooks/useFCMNotifications';
import { useCoastalPersistence } from '../../hooks/useCoastalPersistence';
import { CoastalTravelCacheModal } from '../common/CoastalTravelCacheModal';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { 
    currentUser, 
    profile, 
    isAuthenticated, 
    role: authRole, 
    logout
  } = useAuth();

  const { 
    cities, 
    currentCityId, 
    setCity, 
    currentLanguage, 
    setLanguage, 
    notifications,
    markNotificationRead,
    markAllNotificationsRead 
  } = useAppStore();

  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);

  const { isPermissionGranted } = useFCMNotifications();
  const { effectiveOffline, isSimulatedOffline, cachedOrdersCount } = useCoastalPersistence();

  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCityName = (city: typeof currentCity) => {
    if (currentLanguage === 'ar') return city.name_ar;
    if (currentLanguage === 'zh') return city.name_zh;
    return city.name_en;
  };

  const handleLangChange = (code: LanguageCode) => {
    setLanguage(code);
    setShowLangMenu(false);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const userDisplayName = profile?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 subtle-shadow">
      {/* Top Banner Notice for Role Perspective & City Context */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] tracking-wide uppercase">
            Official Network
          </span>
          <span className="truncate text-slate-300">
            {getCityName(currentCity)} • {currentCity.slug === 'ras-gharib' ? t('city.launchFirst') : 'Active Sector'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 text-white px-2 py-0.5 rounded text-[11px] font-medium">
            {authRole === 'CUSTOMER' && <User className="w-3 h-3 text-blue-400" />}
            {authRole === 'PROVIDER' && <HardHat className="w-3 h-3 text-amber-400" />}
            {(authRole === 'ADMIN' || authRole === 'OPS_ADMIN' || authRole === 'SUPER_ADMIN') && <Shield className="w-3 h-3 text-orange-400" />}
            <span>{authRole}</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => navigate(authRole === 'ADMIN' ? '/admin' : authRole === 'PROVIDER' ? '/provider' : '/home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0A2544] to-[#1A5494] flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
            <span className="tracking-tighter">RS</span>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 -ms-0.5 -mt-2"></div>
          </div>
          <div>
            <div className="font-extrabold text-slate-900 tracking-tight leading-none text-base sm:text-lg">
              RED SEA <span className="text-orange-600">CONNECT</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-tight mt-0.5 hidden xs:block">
              Managed Local Services
            </div>
          </div>
        </div>

        {/* Center/End Actions: City, Language, Notifications, Auth User */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* City Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCityMenu(!showCityMenu);
                setShowLangMenu(false);
                setShowNotifs(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{getCityName(currentCity)}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showCityMenu && (
              <div className="absolute end-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('city.selectCity')}
                </div>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setCity(city.id);
                      setShowCityMenu(false);
                    }}
                    className={`w-full text-start px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      city.id === currentCityId ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{getCityName(city)}</span>
                        {city.slug === 'ras-gharib' && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.2 rounded font-medium">
                            Launch City
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {city.serviceAreas?.join(' • ') || 'Full Coverage'}
                      </div>
                    </div>
                    {city.id === currentCityId && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Global English / Arabic Quick Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-[#0F3966] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English (LTR)"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('ar')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer font-arabic ${
                currentLanguage === 'ar'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="العربية (RTL)"
            >
              عربي
            </button>
          </div>

          {/* Coastal Offline Indicator - Only displayed when offline */}
          {effectiveOffline && (
            <button
              onClick={() => {
                setShowCacheModal(true);
                setShowCityMenu(false);
                setShowLangMenu(false);
                setShowNotifs(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
              title="You are currently in offline mode"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline text-[11px]">
                Offline Mode
              </span>
            </button>
          )}

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowCityMenu(false);
                setShowLangMenu(false);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-4.5 h-4.5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute end-0 top-full mt-1.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">Notifications</div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                {/* FCM Push Notification Quick Status Banner */}
                <div className="mx-3 my-2 p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {isPermissionGranted && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isPermissionGranted ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <div>
                      <div className="text-[11px] font-bold leading-tight flex items-center gap-1.5">
                        <span>FCM Push {isPermissionGranted ? 'Active' : 'Standby'}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-slate-800 text-orange-400 rounded font-semibold">
                          Service Alerts
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {isPermissionGranted ? 'Live status alerts enabled on device' : 'Click to enable device push'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      setShowPushModal(true);
                    }}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-orange-300 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border border-slate-700"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.workOrderId) {
                            navigate(`/requests/${n.workOrderId}`);
                            setShowNotifs(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-start ${
                          !n.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-xs text-slate-900">
                            {currentLanguage === 'ar' && n.title_ar ? n.title_ar : currentLanguage === 'zh' && n.title_zh ? n.title_zh : n.title}
                          </div>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1"></span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {currentLanguage === 'ar' && n.message_ar ? n.message_ar : currentLanguage === 'zh' && n.message_zh ? n.message_zh : n.message}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Sign In Action */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowCityMenu(false);
                  setShowLangMenu(false);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200/60"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0A2544] text-white flex items-center justify-center text-[11px] font-black">
                  {userInitials}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 me-1" />
              </button>

              {showUserMenu && (
                <div className="absolute end-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">{userDisplayName}</div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">{currentUser?.email}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                      {profile?.role || 'CUSTOMER'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-start px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('nav.profile', 'My Profile')}</span>
                  </Link>

                  {(profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN' || profile?.role === 'OPS_ADMIN' || currentUser?.email === 'omarhassan030@gmail.com') && (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-start px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-orange-700 font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-orange-600" />
                        <span>Admin Operations Hub</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-start px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-indigo-700 font-medium"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>User & Access Control</span>
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-start px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600 font-medium cursor-pointer border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>{t('auth.logout', 'Sign Out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('auth.signIn', 'Sign In')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Push Notification Management Modal */}
      <PushNotificationSettingsModal 
        isOpen={showPushModal} 
        onClose={() => setShowPushModal(false)} 
      />

      {/* Coastal Travel & Firestore Persistence Modal */}
      <CoastalTravelCacheModal
        isOpen={showCacheModal}
        onClose={() => setShowCacheModal(false)}
      />
    </header>
  );
};
