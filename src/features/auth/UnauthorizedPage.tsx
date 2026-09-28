import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from './AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isAuthenticated } = useAuth();

  const attemptedPath = (location.state as any)?.attemptedPath || 'restricted area';
  const isEmailRestricted = (location.state as any)?.reason === 'ADMIN_EMAIL_RESTRICTED';

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.unauthorizedTitle', 'Access Restricted')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {isEmailRestricted
              ? t('admin.allowlistEnforced', 'Security lockdown: Administrative access is restricted exclusively to authorized emails (omarhassan030@gmail.com).')
              : `${t('auth.unauthorizedDesc', 'You do not have the required administrative or provider permissions to view')} `}
            {!isEmailRestricted && (
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">{attemptedPath}</code>
            )}
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-start text-xs space-y-1">
          <div className="text-slate-500 font-medium">{t('auth.yourActiveRole', 'Your active role:')}</div>
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
            <span>{role}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t('common.back', 'Go Back')}</span>
          </button>

          <button
            onClick={() => {
              if (['ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'].includes(role)) {
                navigate('/admin');
              } else if (role === 'PROVIDER') {
                navigate('/provider');
              } else {
                navigate('/home');
              }
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>{t('nav.home', 'Go to Dashboard')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
