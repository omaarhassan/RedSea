import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Zap, Droplets, Wind, Wrench, Paintbrush, PlusCircle, 
  MapPin, Calendar, Clock, Camera, Image, Trash2, CheckCircle2, 
  ArrowRight, ArrowLeft, AlertCircle, ShieldAlert, Sparkles, Check 
} from 'lucide-react';
import { Priority, WorkOrderAttachment } from '../../types';
import confetti from 'canvas-confetti';
import { 
  TransportationCategoryIcon, 
  MaintenanceCategoryIcon,
  AirportTransferIcon,
  EquipmentTransportIcon 
} from '../../components/icons/ServiceCategoryIcons';

export const RequestWizard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service');

  const { 
    services, 
    categories, 
    currentCityId, 
    cities, 
    currentUser, 
    createWorkOrder,
    currentLanguage,
    draftWorkOrder,
    saveDraftWorkOrder
  } = useAppStore();

  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];

  // Wizard Step (1 to 7)
  const [step, setStep] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || draftWorkOrder?.serviceTypeId || services[0]?.id || ''
  );
  const [description, setDescription] = useState(draftWorkOrder?.description || '');
  const [priority, setPriority] = useState<Priority>((draftWorkOrder?.priority as Priority) || 'NORMAL');
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>(draftWorkOrder?.formData || {});

  // Location State
  const [addressText, setAddressText] = useState(draftWorkOrder?.addressText || currentUser.addressText || '');
  const [cityId, setCityId] = useState(draftWorkOrder?.cityId || currentCityId);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat?: number; lng?: number }>({});

  // Schedule State
  const [preferredDate, setPreferredDate] = useState(
    draftWorkOrder?.preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState(draftWorkOrder?.preferredTime || 'Morning (09:00 - 12:00)');
  const [flexibleTime, setFlexibleTime] = useState(draftWorkOrder?.flexibleTime ?? true);

  // Photos State
  const [photos, setPhotos] = useState<WorkOrderAttachment[]>(draftWorkOrder?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Selected Service Object
  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Autosave Draft
  useEffect(() => {
    saveDraftWorkOrder({
      serviceTypeId: selectedServiceId,
      description,
      priority,
      formData: dynamicAnswers,
      addressText,
      cityId,
      preferredDate,
      preferredTime,
      flexibleTime,
      attachments: photos,
    });
  }, [selectedServiceId, description, priority, dynamicAnswers, addressText, cityId, preferredDate, preferredTime, flexibleTime, photos]);

  const getServiceIcon = (slug: string) => {
    switch (slug) {
      case 'electrical':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'plumbing':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'ac-maintenance':
        return <Wind className="w-5 h-5 text-cyan-500" />;
      case 'handyman':
        return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'painting':
        return <Paintbrush className="w-5 h-5 text-indigo-500" />;
      case 'airport-transfers':
        return <AirportTransferIcon size={24} className="shrink-0" />;
      case 'equipment-transport':
        return <EquipmentTransportIcon size={24} className="shrink-0" />;
      default:
        return <PlusCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          const detectedCity = cities.find((c) => c.id === cityId);
          setAddressText(`Detected GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}) - ${detectedCity?.name_en || 'Ras Gharib'}`);
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          setAddressText(`${currentCity.name_en} Coastal District, Block 4`);
          setIsLocating(false);
        }
      );
    } else {
      setAddressText(`${currentCity.name_en} Center`);
      setIsLocating(false);
    }
  };

  const handleSimulatePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setTimeout(() => {
      const fileList = Array.from(files) as File[];
      const newItems: WorkOrderAttachment[] = fileList.map((f, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        url: URL.createObjectURL(f),
        name: f.name,
        type: 'image',
        sizeBytes: f.size,
        uploadedBy: currentUser.fullName,
        uploadedAt: new Date().toISOString(),
      }));

      setPhotos((prev) => [...prev, ...newItems]);
      setIsUploading(false);
    }, 600);
  };

  const handleAddSamplePhoto = () => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&auto=format&fit=crop&q=80',
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const newSample: WorkOrderAttachment = {
      id: `att-sample-${Date.now()}`,
      url: randomUrl,
      name: 'property_issue_photo.jpg',
      type: 'image',
      sizeBytes: 840000,
      uploadedBy: currentUser.fullName,
      uploadedAt: new Date().toISOString(),
    };
    setPhotos((prev) => [...prev, newSample]);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !selectedServiceId) {
      newErrors.service = 'Please select a service type';
    }

    if (step === 2) {
      if (!description.trim() || description.length < 5) {
        newErrors.description = 'Please describe the problem (at least 5 characters)';
      }
      // Check required dynamic fields
      selectedService?.formSchema?.forEach((field) => {
        if (field.required && !dynamicAnswers[field.id]) {
          newErrors[field.id] = 'This field is required';
        }
      });
    }

    if (step === 3 && (!addressText.trim() || addressText.length < 5)) {
      newErrors.address = 'Please provide a valid street address or GPS pin';
    }

    if (step === 4 && !preferredDate) {
      newErrors.date = 'Please select a preferred service date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    const selectedCityObj = cities.find((c) => c.id === cityId) || currentCity;
    const selectedCategoryObj = categories.find((c) => c.id === selectedService.categoryId) || categories[0];

    const newOrder = createWorkOrder({
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      cityId: selectedCityObj.id,
      cityName: selectedCityObj.name_en,
      serviceCategoryId: selectedCategoryObj.id,
      serviceCategoryName: selectedCategoryObj.name_en,
      serviceTypeId: selectedService.id,
      serviceTypeName: selectedService.name_en,
      status: 'SUBMITTED',
      priority,
      description,
      addressText,
      latitude: gpsCoordinates.lat,
      longitude: gpsCoordinates.lng,
      preferredDate,
      preferredTime,
      flexibleTime,
      formData: dynamicAnswers,
      attachments: photos,
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F3966', '#F97316', '#38BDF8'],
      });
    } catch (e) {
      // ignore
    }

    navigate(`/requests/${newOrder.id}`);
  };

  const stepsList = [
    { num: 1, label: t('wizard.step1') },
    { num: 2, label: t('wizard.step2') },
    { num: 3, label: t('wizard.step3') },
    { num: 4, label: t('wizard.step4') },
    { num: 5, label: t('wizard.step5') },
    { num: 6, label: t('wizard.step6') },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
              {t('wizard.title')}
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Step {step} of 6: {stepsList[step - 1]?.label}
            </h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {Math.round((step / 6) * 100)}%
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          <div 
            className="bg-gradient-to-r from-[#0F3966] to-orange-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('wizard.selectServicePrompt')}
            </h2>
            <p className="text-xs text-slate-500">
              Select your required service category and specific job discipline.
            </p>
          </div>

          {/* Service Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'all'
                  ? 'bg-[#0F3966] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{t('common.all', 'All')}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
              }`}>
                {services.filter(s => s.isActive).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('cat-maintenance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                categoryFilter === 'cat-maintenance'
                  ? 'border-[#0F3966] bg-blue-50 text-[#0F3966] shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <MaintenanceCategoryIcon size={18} className="shrink-0" />
              <span>{t('services.maintenanceCategory', 'Maintenance')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('cat-transportation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                categoryFilter === 'cat-transportation'
                  ? 'border-[#0F3966] bg-blue-50 text-[#0F3966] shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <TransportationCategoryIcon size={18} className="shrink-0" />
              <span>{t('services.transportationCategory', 'Transportation')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {services
              .filter((srv) => srv.isActive && (categoryFilter === 'all' || srv.categoryId === categoryFilter))
              .map((srv) => {
                const isSelected = srv.id === selectedServiceId;
                const title = currentLanguage === 'ar' ? srv.name_ar : currentLanguage === 'zh' ? srv.name_zh : srv.name_en;
                const desc = currentLanguage === 'ar' ? srv.description_ar : currentLanguage === 'zh' ? srv.description_zh : srv.description_en;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#0F3966] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#0F3966] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {getServiceIcon(srv.slug)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold text-sm ${isSelected ? 'text-[#0F3966]' : 'text-slate-900'}`}>
                          {title}
                        </h3>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0F3966]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {errors.service && (
            <p className="text-xs text-red-600 font-medium">{errors.service}</p>
          )}
        </div>
      )}

      {/* Step 2: Dynamic Form & Description */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-[#0F3966]">
              {getServiceIcon(selectedService.slug)}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Selected Service</span>
              <h2 className="text-base font-bold text-slate-900">
                {currentLanguage === 'ar' ? selectedService.name_ar : selectedService.name_en}
              </h2>
            </div>
          </div>

          {/* Dynamic Service Form Fields */}
          {selectedService.formSchema?.map((field) => {
            const fieldLabel = currentLanguage === 'ar' ? field.label_ar : currentLanguage === 'zh' ? field.label_zh : field.label_en;

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'select' && (
                  <select
                    value={dynamicAnswers[field.id] || ''}
                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.id]: e.target.value })}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
                  >
                    <option value="">Select option...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {currentLanguage === 'ar' ? opt.label_ar : currentLanguage === 'zh' ? opt.label_zh : opt.label_en}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2 pt-1">
                    {field.options?.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          dynamicAnswers[field.id] === opt.value
                            ? 'border-[#0F3966] bg-blue-50/50 font-semibold text-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt.value}
                          checked={dynamicAnswers[field.id] === opt.value}
                          onChange={() => setDynamicAnswers({ ...dynamicAnswers, [field.id]: opt.value })}
                          className="text-[#0F3966]"
                        />
                        <span>{currentLanguage === 'ar' ? opt.label_ar : currentLanguage === 'zh' ? opt.label_zh : opt.label_en}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    min="1"
                    value={dynamicAnswers[field.id] || ''}
                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.id]: e.target.value })}
                    placeholder={currentLanguage === 'ar' ? field.placeholder_ar : currentLanguage === 'zh' ? field.placeholder_zh : field.placeholder_en}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
                  />
                )}

                {field.type === 'text' && (
                  <input
                    type="text"
                    value={dynamicAnswers[field.id] || ''}
                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.id]: e.target.value })}
                    placeholder={currentLanguage === 'ar' ? field.placeholder_ar : currentLanguage === 'zh' ? field.placeholder_zh : field.placeholder_en}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    value={dynamicAnswers[field.id] || ''}
                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.id]: e.target.value })}
                    placeholder={currentLanguage === 'ar' ? field.placeholder_ar : currentLanguage === 'zh' ? field.placeholder_zh : field.placeholder_en}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
                  />
                )}

                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(dynamicAnswers[field.id])}
                      onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.id]: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0F3966] focus:ring-[#0F3966]"
                    />
                    <span className="text-slate-800 font-medium">{fieldLabel}</span>
                  </label>
                )}

                {errors[field.id] && (
                  <p className="text-[11px] text-red-600 font-medium">{errors[field.id]}</p>
                )}
              </div>
            );
          })}

          {/* Problem Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {t('wizard.describeProblem')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('wizard.describePlaceholder')}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
            />
            {errors.description && (
              <p className="text-[11px] text-red-600 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              {t('wizard.priority')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'LOW', label: t('wizard.priorityLow') },
                { val: 'NORMAL', label: t('wizard.priorityNormal') },
                { val: 'HIGH', label: t('wizard.priorityHigh') },
                { val: 'URGENT', label: t('wizard.priorityUrgent') },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setPriority(p.val as Priority)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors cursor-pointer ${
                    priority === p.val
                      ? p.val === 'URGENT'
                        ? 'border-red-600 bg-red-50 text-red-800'
                        : 'border-[#0F3966] bg-blue-50 text-[#0F3966]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p.val}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('wizard.locationTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              Where should the verified specialist be dispatched?
            </p>
          </div>

          {/* City Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {t('wizard.city')}
            </label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {currentLanguage === 'ar' ? c.name_ar : c.name_en} {c.slug === 'ras-gharib' ? `(${t('city.launchFirst')})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Quick Pin */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-[#0F3966] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>{isLocating ? 'Locating...' : t('wizard.useCurrentLocation')}</span>
          </button>

          {/* Manual Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {t('wizard.manualAddress')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder={t('wizard.addressPlaceholder')}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
            />
            {errors.address && (
              <p className="text-[11px] text-red-600 font-medium">{errors.address}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Schedule */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('wizard.scheduleTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              Choose your convenient date and preferred arrival window.
            </p>
          </div>

          {/* Preferred Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {t('wizard.preferredDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={preferredDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3966]"
            />
            {errors.date && (
              <p className="text-[11px] text-red-600 font-medium">{errors.date}</p>
            )}
          </div>

          {/* Preferred Time Window */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              {t('wizard.preferredTime')}
            </label>
            <div className="space-y-2">
              {[
                { label: t('wizard.morning'), val: 'Morning (09:00 - 12:00)' },
                { label: t('wizard.afternoon'), val: 'Afternoon (12:00 - 16:00)' },
                { label: t('wizard.evening'), val: 'Evening (16:00 - 20:00)' },
              ].map((timeOption) => (
                <label
                  key={timeOption.val}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    preferredTime === timeOption.val
                      ? 'border-[#0F3966] bg-blue-50/50 font-bold text-[#0F3966]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{timeOption.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="preferredTime"
                    value={timeOption.val}
                    checked={preferredTime === timeOption.val}
                    onChange={() => setPreferredTime(timeOption.val)}
                    className="text-[#0F3966]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Flexible checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={flexibleTime}
              onChange={(e) => setFlexibleTime(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
            />
            <span className="text-xs text-slate-700 font-medium">
              {t('wizard.flexibleTime')}
            </span>
          </label>
        </div>
      )}

      {/* Step 5: Photos */}
      {step === 5 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('wizard.photosTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('wizard.photosSubtitle')}
            </p>
          </div>

          {/* Upload Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0F3966] flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30">
              <Camera className="w-6 h-6 text-[#0F3966]" />
              <span className="text-xs font-bold text-slate-800">{t('wizard.takePhoto')}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleSimulatePhotoUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleAddSamplePhoto}
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/30"
            >
              <Image className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-bold text-slate-800">+ Add Sample Photo</span>
            </button>
          </div>

          {isUploading && (
            <div className="p-3 bg-blue-50 text-blue-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Compressing & preparing image...</span>
            </div>
          )}

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700">Attached Photos ({photos.length})</div>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Review & Confirmation */}
      {step === 6 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('wizard.reviewTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('wizard.reviewSubtitle')}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3.5 border border-slate-200 text-xs text-slate-700">
            <div className="flex justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">{selectedService.name_en}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500">City / Location:</span>
              <span className="font-bold text-slate-900">{addressText}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500">Preferred Schedule:</span>
              <span className="font-bold text-slate-900">{preferredDate} • {preferredTime}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500">Priority:</span>
              <span className="font-bold text-orange-600">{priority}</span>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-slate-500 block">Description:</span>
              <p className="font-medium text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                {description}
              </p>
            </div>

            {photos.length > 0 && (
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Photos attached:</span>
                <span className="font-bold text-slate-900">{photos.length} photo(s)</span>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Our operations team in {currentCity.name_en} will review your request and issue an official quotation within <strong>{selectedService.quoteSlaHours} hours</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons (Back / Next / Submit) */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t('common.back')}</span>
          </button>
        ) : (
          <div></div>
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-[#0F3966] hover:bg-[#1A5494] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>{t('common.next')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t('wizard.submitButton')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
