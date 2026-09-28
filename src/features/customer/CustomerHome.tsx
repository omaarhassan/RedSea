import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Zap, Droplets, Wind, Wrench, Paintbrush, PlusCircle, 
  ArrowRight, Clock, ShieldCheck, ChevronRight, Sparkles, 
  CheckCircle, Calendar, PhoneCall, ArrowUpRight
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  TransportationCategoryIcon, 
  MaintenanceCategoryIcon,
  AirportTransferIcon,
  EquipmentTransportIcon 
} from '../../components/icons/ServiceCategoryIcons';

export const CustomerHome: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { services, workOrders, currentLanguage, currentCityId, cities } = useAppStore();

  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];

  // Find active work orders (not completed/cancelled)
  const activeWorkOrder = workOrders.find(
    (w) => w.status !== 'COMPLETED' && w.status !== 'CANCELLED' && w.status !== 'CLOSED'
  );

  const completedOrders = workOrders.filter((w) => w.status === 'COMPLETED');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

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
        return <AirportTransferIcon size={26} className="shrink-0" />;
      case 'equipment-transport':
        return <EquipmentTransportIcon size={26} className="shrink-0" />;
      default:
        return <PlusCircle className="w-6 h-6 text-slate-500" />;
    }
  };

  const getServiceTitle = (srv: typeof services[0]) => {
    if (currentLanguage === 'ar') return srv.name_ar;
    if (currentLanguage === 'zh') return srv.name_zh;
    return srv.name_en;
  };

  const getServiceDesc = (srv: typeof services[0]) => {
    if (currentLanguage === 'ar') return srv.description_ar;
    if (currentLanguage === 'zh') return srv.description_zh;
    return srv.description_en;
  };

  const handleSelectService = (serviceId: string) => {
    navigate(`/request?service=${serviceId}`);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* Hero Header Greeting */}
      <section className="bg-gradient-to-br from-[#0F3966] via-[#164E87] to-[#0A2544] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/15 relative overflow-hidden">
        {/* Subtle decorative Red Sea waves background accent */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Wind className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-orange-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{t('brand.tagline')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t('home.greeting')}
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl">
            {t('brand.subheadline')}
          </p>

          {/* Quick CTA Buttons */}
          <div className="pt-3 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/request')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold text-sm shadow-md shadow-orange-900/30 transition-all cursor-pointer"
            >
              <span>{t('home.requestService')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            <button
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-colors cursor-pointer border border-white/15"
            >
              <span>{t('home.viewServices')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Active Work Order Card (If any) */}
      {activeWorkOrder && (
        <section className="bg-white rounded-2xl p-5 border border-orange-200/80 shadow-md shadow-orange-900/5 relative overflow-hidden card-hover">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500"></div>

          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                  {t('home.activeRequest')}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {activeWorkOrder.workOrderNumber}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {activeWorkOrder.serviceTypeName}
              </h3>
            </div>
            <StatusBadge status={activeWorkOrder.status} size="md" />
          </div>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 my-3">
            {activeWorkOrder.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeWorkOrder.preferredDate}</span>
            </div>

            <button
              onClick={() => navigate(`/requests/${activeWorkOrder.id}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F3966] hover:text-orange-600 transition-colors cursor-pointer group"
            >
              <span>
                {activeWorkOrder.status === 'QUOTE_SENT' 
                  ? t('quote.offerTitle') 
                  : t('workOrder.details')}
              </span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>
      )}

      {/* Services Grid with Category Navigation */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {selectedCategory === 'cat-transportation'
                ? t('services.transportationCategory', 'Transportation & Logistics')
                : selectedCategory === 'cat-maintenance'
                ? t('services.maintenanceCategory', 'Maintenance & Property')
                : t('services.title', 'Managed Local Services')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified local services in {currentLanguage === 'ar' ? currentCity.name_ar : currentCity.name_en}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#0F3966] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('common.all', 'All')}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('cat-maintenance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                selectedCategory === 'cat-maintenance'
                  ? 'border-[#0F3966] bg-blue-50 text-[#0F3966] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MaintenanceCategoryIcon size={16} className="shrink-0" />
              <span>{t('services.maintenanceCategory', 'Maintenance')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('cat-transportation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                selectedCategory === 'cat-transportation'
                  ? 'border-[#0F3966] bg-blue-50 text-[#0F3966] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <TransportationCategoryIcon size={16} className="shrink-0" />
              <span>{t('services.transportationCategory', 'Transportation')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {services
            .filter((srv) => srv.isActive && (selectedCategory === 'all' || srv.categoryId === selectedCategory))
            .map((srv) => (
              <div
                key={srv.id}
                onClick={() => handleSelectService(srv.id)}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-[#0F3966]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50/80 flex items-center justify-center transition-colors mb-3.5 border border-slate-100 group-hover:border-blue-200">
                    {getServiceIcon(srv.slug)}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0F3966] transition-colors leading-snug">
                    {getServiceTitle(srv)}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {getServiceDesc(srv)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {srv.quoteSlaHours}h response
                  </span>
                  <ArrowUpRight className="w-4 h-4 rtl:rotate-90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="bg-slate-100/80 rounded-3xl p-6 sm:p-7 border border-slate-200/70 space-y-4">
        <div className="text-center max-w-md mx-auto space-y-1">
          <h3 className="font-bold text-base sm:text-lg text-slate-900">
            {t('home.howItWorks')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('home.managedPromise')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white rounded-2xl p-4 text-center space-y-1.5 border border-slate-200/60">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900">{t('home.steps.step1')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">{t('home.steps.step1Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 text-center space-y-1.5 border border-slate-200/60">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900">{t('home.steps.step2')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">{t('home.steps.step2Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 text-center space-y-1.5 border border-slate-200/60">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900">{t('home.steps.step3')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">{t('home.steps.step3Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 text-center space-y-1.5 border border-slate-200/60">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center mx-auto">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-900">{t('home.steps.step4')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">{t('home.steps.step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Managed Quality Guarantee Banner */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-[#0F3966]">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-bold text-sm text-slate-900">
            {t('home.managedPromise')}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('home.managedPromiseDesc')}
          </p>
        </div>
      </section>
    </div>
  );
};
