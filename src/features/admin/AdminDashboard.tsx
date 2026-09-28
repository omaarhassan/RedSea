import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  FileText, Clock, CheckCircle2, DollarSign, Users, 
  Calendar, AlertCircle, TrendingUp, Sparkles, MapPin, 
  ArrowUpRight, Plus, ChevronRight, ShieldCheck, HardHat, Database
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { 
    workOrders, 
    quotes, 
    providers, 
    cities, 
    currentCityId, 
    activityLogs, 
    currentLanguage 
  } = useAppStore();

  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];

  // Operations Metrics Calculations
  const totalWorkOrders = workOrders.length;
  const pendingReviewOrders = workOrders.filter((w) => w.status === 'SUBMITTED' || w.status === 'UNDER_REVIEW');
  const quoteSentOrders = workOrders.filter((w) => w.status === 'QUOTE_SENT');
  const scheduledOrders = workOrders.filter((w) => w.status === 'SCHEDULED' || w.status === 'ASSIGNED' || w.status === 'EN_ROUTE' || w.status === 'IN_PROGRESS');
  const completedOrders = workOrders.filter((w) => w.status === 'COMPLETED');

  // Revenue & Margin Aggregates (ADMIN ONLY)
  const totalRevenue = quotes
    .filter((q) => q.status === 'ACCEPTED' || workOrders.find((w) => w.id === q.workOrderId && w.status === 'COMPLETED'))
    .reduce((acc, q) => acc + q.total, 0);

  const totalMargin = quotes
    .filter((q) => q.status === 'ACCEPTED' || workOrders.find((w) => w.id === q.workOrderId && w.status === 'COMPLETED'))
    .reduce((acc, q) => acc + (q.margin || 0), 0);

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Operations Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">
              {currentLanguage === 'ar' ? currentCity.name_ar : currentCity.name_en} Operations Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Red Sea Connect Dispatch & Workflow Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time control over requests, quotation margins, technician assignment, and SLA fulfillment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Manage Orders</span>
          </button>
          <button
            onClick={() => navigate('/admin/calendar')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Calendar className="w-4 h-4" />
            <span>Dispatch Schedule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Pending Review */}
        <div 
          onClick={() => navigate('/admin/orders?status=SUBMITTED')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-orange-500/50 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('admin.needsReview')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {pendingReviewOrders.length}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-blue-600 font-bold">Awaiting Quote</span> • SLA active
          </div>
        </div>

        {/* Quotes Sent */}
        <div 
          onClick={() => navigate('/admin/orders?status=QUOTE_SENT')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-orange-500/50 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('admin.quotesSent')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {quoteSentOrders.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Awaiting customer acceptance
          </div>
        </div>

        {/* Active In Field */}
        <div 
          onClick={() => navigate('/admin/orders?status=IN_PROGRESS')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-orange-500/50 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('admin.activeInField')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {scheduledOrders.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Scheduled & in execution
          </div>
        </div>

        {/* Total Gross Margin (EGP) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('admin.grossMargin')}
            </span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-600">
            {totalMargin} <span className="text-xs text-slate-400 font-normal">EGP</span>
          </div>
          <div className="text-[11px] text-slate-500">
            From {completedOrders.length + 1} finalized orders
          </div>
        </div>
      </div>

      {/* Main Two-Column Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Work Orders Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Recent Work Orders</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {workOrders.length}
              </span>
            </h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-[#0F3966] hover:text-orange-600 transition-colors cursor-pointer"
            >
              View All Orders →
            </button>
          </div>

          <div className="space-y-3">
            {workOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-[#0F3966]/40 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {order.workOrderNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{order.serviceTypeName}</span>
                      <span className="text-[10px] text-slate-400">({order.cityName})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                    </div>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {order.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Assigned: {order.assignedProviderName || 'Unassigned'}</span>
                  <span className="font-bold text-[#0F3966] flex items-center gap-1">
                    Manage Workflow <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Operations Activity Stream & Quick Links */}
        <div className="space-y-5">
          {/* Quick Hub Navigation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Operations Tools
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-start font-bold text-slate-800 transition-colors cursor-pointer border border-slate-100"
              >
                <Users className="w-4 h-4 text-indigo-600 mb-1.5" />
                <span>Users & Access</span>
              </button>
              <button
                onClick={() => navigate('/admin/providers')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-start font-bold text-slate-800 transition-colors cursor-pointer border border-slate-100"
              >
                <HardHat className="w-4 h-4 text-blue-600 mb-1.5" />
                <span>Technicians ({providers.length})</span>
              </button>
              <button
                onClick={() => navigate('/admin/services')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-start font-bold text-slate-800 transition-colors cursor-pointer border border-slate-100"
              >
                <Sparkles className="w-4 h-4 text-amber-600 mb-1.5" />
                <span>Service Catalog</span>
              </button>
              <button
                onClick={() => navigate('/admin/cities')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-start font-bold text-slate-800 transition-colors cursor-pointer border border-slate-100"
              >
                <MapPin className="w-4 h-4 text-orange-600 mb-1.5" />
                <span>Cities & Hubs</span>
              </button>
              <button
                onClick={() => navigate('/admin/audit')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-start font-bold text-slate-800 transition-colors cursor-pointer border border-slate-100 col-span-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1.5" />
                <span>Audit Logs & System History</span>
              </button>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              {t('admin.recentActivity')}
            </h3>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="pt-2.5 first:pt-0 space-y-0.5">
                  <div className="font-semibold text-slate-800">{log.details}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>By: {log.performedBy} ({log.performedByRole})</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
