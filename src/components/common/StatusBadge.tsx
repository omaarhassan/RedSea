import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkOrderStatus, Priority } from '../../types';
import { 
  Clock, CheckCircle2, AlertCircle, FileText, Calendar, 
  Truck, ShieldAlert, XCircle, ArrowRightCircle, Sparkles 
} from 'lucide-react';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'DRAFT':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <FileText className="w-3.5 h-3.5" />,
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <Clock className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case 'QUOTE_SENT':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-xs',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'QUOTE_ACCEPTED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'QUOTE_DECLINED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
        };
      case 'SCHEDULED':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Calendar className="w-3.5 h-3.5 text-sky-600" />,
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          icon: <ArrowRightCircle className="w-3.5 h-3.5 text-cyan-600" />,
        };
      case 'EN_ROUTE':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-300 animate-pulse',
          icon: <Truck className="w-3.5 h-3.5 text-orange-600" />,
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case 'CANCELLED':
        return {
          bg: 'bg-slate-100 text-slate-500 border-slate-200',
          icon: <XCircle className="w-3.5 h-3.5 text-slate-400" />,
        };
      case 'DISPUTED':
      case 'ON_HOLD':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium transition-colors whitespace-nowrap ${sizeClasses[size]} ${config.bg}`}
    >
      {showIcon && config.icon}
      <span>{t(`status.${status}`)}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const { t } = useTranslation();

  const getPriorityStyle = () => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200 font-semibold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'LOW':
        return 'bg-slate-50 text-slate-600 border-slate-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${getPriorityStyle()}`}>
      {priority}
    </span>
  );
};
