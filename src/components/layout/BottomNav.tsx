import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Headphones, User, Plus } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRole, workOrders } = useAppStore();

  if (activeRole === 'ADMIN' || activeRole === 'OPS_ADMIN' || activeRole === 'SUPER_ADMIN') {
    return null; // Admin has dedicated desktop/drawer navigation
  }

  const activeRequestsCount = workOrders.filter(
    (w) => w.status !== 'COMPLETED' && w.status !== 'CANCELLED' && w.status !== 'CLOSED'
  ).length;

  const navItems = [
    {
      id: 'home',
      label: t('nav.home'),
      path: activeRole === 'PROVIDER' ? '/provider' : '/',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'requests',
      label: activeRole === 'PROVIDER' ? t('provider.todayJobs') : t('nav.requests'),
      path: activeRole === 'PROVIDER' ? '/provider/jobs' : '/requests',
      icon: <FileText className="w-5 h-5" />,
      badge: activeRequestsCount > 0 && activeRole === 'CUSTOMER' ? activeRequestsCount : undefined,
    },
    {
      id: 'fab',
      label: t('nav.newRequest'),
      isFab: true,
      path: '/request',
    },
    {
      id: 'support',
      label: t('nav.support'),
      path: '/support',
      icon: <Headphones className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      path: activeRole === 'PROVIDER' ? '/provider/profile' : '/profile',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {navItems.map((item) => {
          if (item.isFab) {
            if (activeRole === 'PROVIDER') return null; // Providers don't have new request FAB
            return (
              <div key={item.id} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => navigate(item.path)}
                  className="w-13 h-13 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-600/30 active:scale-95 transition-all cursor-pointer border-4 border-white"
                  aria-label={item.label}
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
                <span className="text-[10px] font-bold text-orange-600 mt-0.5">
                  {t('nav.newRequest')}
                </span>
              </div>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
                isActive ? 'text-[#0F3966] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -end-2 min-w-4 h-4 px-1 rounded-full bg-orange-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-[#0F3966] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
