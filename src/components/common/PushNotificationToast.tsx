import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Volume2, 
  Wrench, 
  FileText 
} from 'lucide-react';
import { useFCMNotifications } from '../../hooks/useFCMNotifications';
import { WorkOrderStatus } from '../../types';

export const PushNotificationToast: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { latestPush, dismissLatestPush, preferences } = useFCMNotifications();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (latestPush) {
      setVisible(true);
      setProgress(100);

      // Auto dismiss countdown
      const duration = 8000;
      const step = 50;
      const decrement = (step / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setVisible(false);
            dismissLatestPush();
            return 0;
          }
          return prev - decrement;
        });
      }, step);

      return () => clearInterval(timer);
    } else {
      setVisible(false);
    }
  }, [latestPush, dismissLatestPush]);

  if (!visible || !latestPush) return null;

  const getStatusIcon = (status: WorkOrderStatus) => {
    switch (status) {
      case 'EN_ROUTE':
        return <Navigation className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'QUOTE_SENT':
      case 'QUOTE_ACCEPTED':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'SCHEDULED':
      case 'UNDER_REVIEW':
        return <Clock className="w-5 h-5 text-sky-500" />;
      default:
        return <Bell className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusBadgeClass = (status: WorkOrderStatus) => {
    switch (status) {
      case 'EN_ROUTE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'QUOTE_SENT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const currentLang = i18n.language;
  const displayTitle = currentLang === 'ar' && latestPush.title_ar 
    ? latestPush.title_ar 
    : currentLang === 'zh' && latestPush.title_zh 
    ? latestPush.title_zh 
    : latestPush.title;

  const displayBody = currentLang === 'ar' && latestPush.body_ar 
    ? latestPush.body_ar 
    : currentLang === 'zh' && latestPush.body_zh 
    ? latestPush.body_zh 
    : latestPush.body;

  const handleOpen = () => {
    setVisible(false);
    dismissLatestPush();
    if (latestPush.workOrderId) {
      navigate(`/requests/${latestPush.workOrderId}`);
    } else {
      navigate('/requests');
    }
  };

  return (
    <div className="fixed top-16 end-4 sm:end-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden backdrop-blur-lg">
        {/* Progress bar */}
        <div 
          className="h-1 bg-gradient-to-r from-orange-500 to-amber-400 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              {getStatusIcon(latestPush.status)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-800 text-orange-400 border-orange-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                    FCM Push Alert
                  </span>
                  {latestPush.workOrderNumber && (
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {latestPush.workOrderNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {preferences.sound && (
                    <span title="Audio chime played" className="text-slate-400">
                      <Volume2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setVisible(false);
                      dismissLatestPush();
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-sm text-white leading-snug line-clamp-1">
                {displayTitle}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                {displayBody}
              </p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusBadgeClass(latestPush.status)}`}>
                  {latestPush.status.replace('_', ' ')}
                </span>

                <button
                  onClick={handleOpen}
                  className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer group"
                >
                  <span>{t('common.viewDetails', 'View Order')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
