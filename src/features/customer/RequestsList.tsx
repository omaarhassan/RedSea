import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  FileText, Search, Plus, Clock, Calendar, 
  MapPin, ChevronRight, Filter 
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const RequestsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { workOrders } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'OFFERS' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = workOrders.filter((order) => {
    // Search query filter
    const matchesSearch = 
      order.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.serviceTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'ACTIVE') {
      return order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && order.status !== 'CLOSED';
    }
    if (activeTab === 'OFFERS') {
      return order.status === 'QUOTE_SENT';
    }
    if (activeTab === 'COMPLETED') {
      return order.status === 'COMPLETED' || order.status === 'CLOSED';
    }

    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('requests.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('requests.subtitle')}
          </p>
        </div>

        <button
          onClick={() => navigate('/request')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F3966] hover:bg-[#1A5494] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('nav.newRequest')}</span>
        </button>
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('requests.searchPlaceholder')}
            className="w-full text-xs sm:text-sm ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'ALL', label: t('requests.filterAll') },
            { key: 'ACTIVE', label: t('requests.filterActive') },
            { key: 'OFFERS', label: t('requests.filterOffers') },
            { key: 'COMPLETED', label: t('requests.filterCompleted') },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#0F3966] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">{t('requests.empty')}</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {t('requests.emptyDesc')}
              </p>
            </div>
            <button
              onClick={() => navigate('/request')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {t('home.requestService')}
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/requests/${order.id}`)}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-[#0F3966]/40 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {order.workOrderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {order.cityName}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                    {order.serviceTypeName}
                  </h3>
                </div>
                <StatusBadge status={order.status} size="sm" />
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {order.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.preferredDate}</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.preferredTime}</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 font-bold text-xs text-[#0F3966]">
                  <span>{order.status === 'QUOTE_SENT' ? 'View Offer' : 'Details'}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

