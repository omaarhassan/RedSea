import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Zap, Droplets, Wind, Wrench, Paintbrush, PlusCircle, 
  ArrowRight, ShieldCheck, Clock, CheckCircle2, Search, ArrowUpRight
} from 'lucide-react';
import { 
  TransportationCategoryIcon, 
  MaintenanceCategoryIcon,
  AirportTransferIcon,
  EquipmentTransportIcon 
} from '../../components/icons/ServiceCategoryIcons';

export const ServicesCatalog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { services, categories, currentLanguage, currentCityId, cities } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];

  const getServiceIcon = (slug: string) => {
    switch (slug) {
      case 'electrical':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'plumbing':
        return <Droplets className="w-6 h-6 text-blue-500" />;
      case 'ac-maintenance':
        return <Wind className="w-6 h-6 text-cyan-500" />;
      case 'handyman':
        return <Wrench className="w-6 h-6 text-orange-500" />;
      case 'painting':
        return <Paintbrush className="w-6 h-6 text-indigo-500" />;
      case 'airport-transfers':
        return <AirportTransferIcon size={28} className="shrink-0" />;
      case 'equipment-transport':
        return <EquipmentTransportIcon size={28} className="shrink-0" />;
      default:
        return <PlusCircle className="w-6 h-6 text-slate-500" />;
    }
  };

  const filteredServices = services.filter((srv) => {
    if (!srv.isActive) return false;
    if (selectedCategory !== 'all' && srv.categoryId !== selectedCategory) return false;
    const term = search.toLowerCase();
    return (
      srv.name_en.toLowerCase().includes(term) ||
      srv.name_ar.toLowerCase().includes(term) ||
      srv.name_zh.toLowerCase().includes(term) ||
      srv.description_en.toLowerCase().includes(term)
    );
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* Catalog Header */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
          {t('services.title')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Managed Services in {currentLanguage === 'ar' ? currentCity.name_ar : currentCity.name_en}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
          {t('brand.subheadline')} Every job is protected by Red Sea Connect satisfaction & workmanship guarantee.
        </p>
      </div>

      {/* Search Filter & Category Tabs */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search electrical, plumbing, AC, paint, transfers..."
            className="w-full text-xs sm:text-sm ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#0F3966] text-white shadow-xs'
                : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span>{t('common.all', 'All Services')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {services.filter(s => s.isActive).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('cat-maintenance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
              selectedCategory === 'cat-maintenance'
                ? 'border-[#0F3966] bg-blue-50 text-[#0F3966] shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <MaintenanceCategoryIcon size={18} className="shrink-0" />
            <span>{t('services.maintenanceCategory', 'Maintenance & Property')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('cat-transportation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
              selectedCategory === 'cat-transportation'
                ? 'border-[#0F3966] bg-blue-50 text-[#0F3966] shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <TransportationCategoryIcon size={18} className="shrink-0" />
            <span>{t('services.transportationCategory', 'Transportation & Logistics')}</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((srv) => {
          const title = currentLanguage === 'ar' ? srv.name_ar : currentLanguage === 'zh' ? srv.name_zh : srv.name_en;
          const desc = currentLanguage === 'ar' ? srv.description_ar : currentLanguage === 'zh' ? srv.description_zh : srv.description_en;

          return (
            <div
              key={srv.id}
              onClick={() => navigate(`/request?service=${srv.id}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#0F3966]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50/80 flex items-center justify-center transition-colors border border-slate-100 group-hover:border-blue-200">
                    {getServiceIcon(srv.slug)}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {srv.quoteSlaHours}h SLA
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0F3966] transition-colors mt-3">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-orange-600">
                  Quote-based • No hidden fees
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F3966] group-hover:text-orange-600 transition-colors"
                >
                  <span>Request Now</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
