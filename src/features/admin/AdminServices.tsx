import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Plus, Edit3, Trash2, Check, X, Search, Filter,
  Layers, Clock, DollarSign, FileText, ChevronRight,
  CheckCircle2, Sparkles, Wrench, Car, Truck, Home,
  Tag, HelpCircle, Eye, Settings, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { ServiceType, ServiceCategory, FormFieldSchema, PricingMode } from '../../types';
import { 
  syncServiceTypeToFirestore, 
  deleteServiceTypeFromFirestore, 
  syncCategoryToFirestore, 
  deleteCategoryFromFirestore 
} from '../../lib/firestoreSync';

export const AdminServices: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const { 
    services, 
    categories, 
    addServiceType, 
    updateServiceType, 
    toggleServiceType, 
    deleteServiceType,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory
  } = useAppStore();

  // Filter & Search states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Service Modal State (Add / Edit)
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormData, setServiceFormData] = useState<{
    categoryId: string;
    name_en: string;
    name_ar: string;
    name_zh: string;
    slug: string;
    description_en: string;
    description_ar: string;
    description_zh: string;
    pricingMode: PricingMode;
    defaultDurationMinutes: number;
    quoteSlaHours: number;
    isActive: boolean;
    sortOrder: number;
  }>({
    categoryId: categories[0]?.id || 'cat-maintenance',
    name_en: '',
    name_ar: '',
    name_zh: '',
    slug: '',
    description_en: '',
    description_ar: '',
    description_zh: '',
    pricingMode: 'QUOTE_BASED',
    defaultDurationMinutes: 90,
    quoteSlaHours: 2,
    isActive: true,
    sortOrder: 1,
  });

  // Category Modal State (Add / Edit)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<{
    name_en: string;
    name_ar: string;
    name_zh: string;
    slug: string;
    icon: string;
    isActive: boolean;
    sortOrder: number;
  }>({
    name_en: '',
    name_ar: '',
    name_zh: '',
    slug: '',
    icon: 'Wrench',
    isActive: true,
    sortOrder: 1,
  });

  // Form Builder Modal State
  const [formBuilderOpen, setFormBuilderOpen] = useState(false);
  const [builderService, setBuilderService] = useState<ServiceType | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [previewTab, setPreviewTab] = useState(false);

  // Field Editor State inside Form Builder
  const [fieldFormData, setFieldFormData] = useState<FormFieldSchema>({
    id: '',
    type: 'text',
    required: false,
    label_en: '',
    label_ar: '',
    label_zh: '',
    placeholder_en: '',
    placeholder_ar: '',
    placeholder_zh: '',
    options: [],
  });
  const [newOption, setNewOption] = useState({ value: '', label_en: '', label_ar: '', label_zh: '' });

  // Delete Confirmation Modals
  const [deleteServiceModalOpen, setDeleteServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceType | null>(null);

  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchCategory = selectedCategoryFilter === 'all' || srv.categoryId === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        srv.name_en.toLowerCase().includes(q) ||
        srv.name_ar.toLowerCase().includes(q) ||
        srv.name_zh.toLowerCase().includes(q) ||
        srv.slug.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [services, selectedCategoryFilter, searchQuery]);

  // Open Service Modal
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceFormData({
      categoryId: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : (categories[0]?.id || 'cat-maintenance'),
      name_en: '',
      name_ar: '',
      name_zh: '',
      slug: '',
      description_en: '',
      description_ar: '',
      description_zh: '',
      pricingMode: 'QUOTE_BASED',
      defaultDurationMinutes: 90,
      quoteSlaHours: 2,
      isActive: true,
      sortOrder: services.length + 1,
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceType) => {
    setEditingServiceId(srv.id);
    setServiceFormData({
      categoryId: srv.categoryId,
      name_en: srv.name_en,
      name_ar: srv.name_ar,
      name_zh: srv.name_zh,
      slug: srv.slug,
      description_en: srv.description_en,
      description_ar: srv.description_ar,
      description_zh: srv.description_zh,
      pricingMode: srv.pricingMode,
      defaultDurationMinutes: srv.defaultDurationMinutes,
      quoteSlaHours: srv.quoteSlaHours,
      isActive: srv.isActive,
      sortOrder: srv.sortOrder,
    });
    setServiceModalOpen(true);
  };

  // Save Service
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name_en.trim()) return;

    const generatedSlug = serviceFormData.slug.trim() || 
      serviceFormData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingServiceId) {
      const existing = services.find((s) => s.id === editingServiceId);
      const updated: ServiceType = {
        ...(existing || {}),
        id: editingServiceId,
        ...serviceFormData,
        slug: generatedSlug,
        formSchema: existing?.formSchema || [],
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateServiceType(editingServiceId, updated);
      syncServiceTypeToFirestore(updated);
      showToast('Service updated successfully');
    } else {
      const newService: ServiceType = {
        id: `srv-${Date.now()}`,
        ...serviceFormData,
        slug: generatedSlug,
        formSchema: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addServiceType(newService);
      syncServiceTypeToFirestore(newService);
      showToast('Service added to catalog');
    }

    setServiceModalOpen(false);
  };

  // Toggle Service Status
  const handleToggleService = (srv: ServiceType) => {
    const updatedStatus = !srv.isActive;
    toggleServiceType(srv.id, updatedStatus);
    const updated = { ...srv, isActive: updatedStatus, updatedAt: new Date().toISOString() };
    syncServiceTypeToFirestore(updated);
    showToast(`Service ${updatedStatus ? 'activated' : 'disabled'}`);
  };

  // Delete Service
  const handleConfirmDeleteService = () => {
    if (!serviceToDelete) return;
    deleteServiceType(serviceToDelete.id);
    deleteServiceTypeFromFirestore(serviceToDelete.id);
    setDeleteServiceModalOpen(false);
    setServiceToDelete(null);
    showToast('Service deleted');
  };

  // Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({
      name_en: '',
      name_ar: '',
      name_zh: '',
      slug: '',
      icon: 'Tag',
      isActive: true,
      sortOrder: categories.length + 1,
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ServiceCategory) => {
    setEditingCategoryId(cat.id);
    setCategoryFormData({
      name_en: cat.name_en,
      name_ar: cat.name_ar,
      name_zh: cat.name_zh,
      slug: cat.slug,
      icon: cat.icon,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name_en.trim()) return;

    const catSlug = categoryFormData.slug.trim() || 
      categoryFormData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategoryId) {
      const updated: ServiceCategory = {
        id: editingCategoryId,
        ...categoryFormData,
        slug: catSlug,
      };
      updateServiceCategory(editingCategoryId, updated);
      syncCategoryToFirestore(updated);
      showToast('Category updated successfully');
    } else {
      const newCat: ServiceCategory = {
        id: `cat-${Date.now()}`,
        ...categoryFormData,
        slug: catSlug,
      };
      addServiceCategory(newCat);
      syncCategoryToFirestore(newCat);
      showToast('Category created');
    }

    setCategoryModalOpen(false);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteServiceCategory(categoryToDelete.id);
    deleteCategoryFromFirestore(categoryToDelete.id);
    setDeleteCategoryModalOpen(false);
    setCategoryToDelete(null);
    showToast('Category deleted');
  };

  // Form Builder Handlers
  const handleOpenFormBuilder = (srv: ServiceType) => {
    setBuilderService(srv);
    setPreviewTab(false);
    setFormBuilderOpen(true);
  };

  const handleOpenAddField = () => {
    setEditingFieldIndex(null);
    setFieldFormData({
      id: `field_${Date.now()}`,
      type: 'text',
      required: false,
      label_en: '',
      label_ar: '',
      label_zh: '',
      placeholder_en: '',
      placeholder_ar: '',
      placeholder_zh: '',
      options: [],
    });
    setNewOption({ value: '', label_en: '', label_ar: '', label_zh: '' });
    setFieldModalOpen(true);
  };

  const handleOpenEditField = (index: number) => {
    if (!builderService) return;
    const field = builderService.formSchema[index];
    setEditingFieldIndex(index);
    setFieldFormData({
      ...field,
      options: field.options ? [...field.options] : [],
    });
    setNewOption({ value: '', label_en: '', label_ar: '', label_zh: '' });
    setFieldModalOpen(true);
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderService || !fieldFormData.label_en.trim()) return;

    const updatedSchema = [...builderService.formSchema];
    const fieldId = fieldFormData.id.trim() || `field_${Date.now()}`;
    const finalizedField: FormFieldSchema = {
      ...fieldFormData,
      id: fieldId,
    };

    if (editingFieldIndex !== null) {
      updatedSchema[editingFieldIndex] = finalizedField;
    } else {
      updatedSchema.push(finalizedField);
    }

    const updatedService: ServiceType = {
      ...builderService,
      formSchema: updatedSchema,
      updatedAt: new Date().toISOString(),
    };

    updateServiceType(builderService.id, { formSchema: updatedSchema });
    syncServiceTypeToFirestore(updatedService);
    setBuilderService(updatedService);
    setFieldModalOpen(false);
    showToast('Form field saved');
  };

  const handleDeleteField = (index: number) => {
    if (!builderService) return;
    const updatedSchema = builderService.formSchema.filter((_, i) => i !== index);
    const updatedService: ServiceType = {
      ...builderService,
      formSchema: updatedSchema,
      updatedAt: new Date().toISOString(),
    };
    updateServiceType(builderService.id, { formSchema: updatedSchema });
    syncServiceTypeToFirestore(updatedService);
    setBuilderService(updatedService);
    showToast('Form field removed');
  };

  const handleAddOptionToField = () => {
    if (!newOption.value.trim() || !newOption.label_en.trim()) return;
    setFieldFormData((prev) => ({
      ...prev,
      options: [
        ...(prev.options || []),
        {
          value: newOption.value.trim(),
          label_en: newOption.label_en.trim(),
          label_ar: newOption.label_ar.trim() || newOption.label_en.trim(),
          label_zh: newOption.label_zh.trim() || newOption.label_en.trim(),
        },
      ],
    }));
    setNewOption({ value: '', label_en: '', label_ar: '', label_zh: '' });
  };

  const handleRemoveOptionFromField = (optIdx: number) => {
    setFieldFormData((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, idx) => idx !== optIdx),
    }));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-4 h-4" />;
      case 'Car': return <Car className="w-4 h-4" />;
      case 'Truck': return <Truck className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 end-6 z-50 bg-[#0A2544] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 border border-blue-400/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              {t('nav.admin', 'Admin Ops')}
            </span>
            <span className="text-xs text-slate-400 font-medium">Catalog & Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {t('admin.servicesManager.title', 'Services & Categories Catalog')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {t('admin.servicesManager.subtitle', 'Manage service categories, SLA times, pricing modes, and dynamic customer intake forms.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddCategory}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('admin.servicesManager.addNewCategory', 'Add Category')}</span>
          </button>

          <button
            onClick={handleOpenAddService}
            className="px-4 py-2 bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.servicesManager.addNewService', 'Add Service Type')}</span>
          </button>
        </div>
      </div>

      {/* Categories Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('admin.servicesManager.categories', 'Service Categories')}</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {categories.length} configured
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#0A2544] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>{t('admin.servicesManager.allCategories', 'All Services')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
            }`}>
              {services.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = services.filter((s) => s.categoryId === cat.id).length;
            const isSelected = selectedCategoryFilter === cat.id;
            const catName = currentLang === 'ar' ? cat.name_ar : currentLang === 'zh' ? cat.name_zh : cat.name_en;

            return (
              <div
                key={cat.id}
                className={`group flex items-center rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'border-[#0A2544] bg-blue-50 text-[#0A2544] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <button
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className="py-1.5 ps-3 pe-2 flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-slate-500">{getCategoryIcon(cat.icon)}</span>
                  <span>{catName}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-[#0A2544] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                  {!cat.isActive && (
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase">Inactive</span>
                  )}
                </button>

                <div className="flex items-center pe-1.5 border-s border-slate-200/80 ps-1 my-1">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    title={t('admin.servicesManager.editCategory', 'Edit Category')}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteCategoryModalOpen(true);
                    }}
                    title={t('admin.servicesManager.deleteCategory', 'Delete Category')}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.servicesManager.searchPlaceholder', 'Search services by name or slug...')}
            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2544]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs text-slate-500 font-medium whitespace-nowrap self-start sm:self-center">
          Showing <span className="font-bold text-slate-900">{filteredServices.length}</span> of {services.length} services
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start">Service Type</th>
                <th className="py-3.5 px-4 text-start">Category</th>
                <th className="py-3.5 px-4 text-start">Pricing Mode</th>
                <th className="py-3.5 px-4 text-start">Quote SLA</th>
                <th className="py-3.5 px-4 text-start">Duration</th>
                <th className="py-3.5 px-4 text-start">Dynamic Form</th>
                <th className="py-3.5 px-4 text-start">Status</th>
                <th className="py-3.5 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No services found</p>
                    <p className="text-xs mt-1">Try adjusting your category filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => {
                  const catObj = categories.find((c) => c.id === srv.categoryId);
                  const catName = catObj 
                    ? (currentLang === 'ar' ? catObj.name_ar : currentLang === 'zh' ? catObj.name_zh : catObj.name_en)
                    : srv.categoryId;

                  return (
                    <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Multilingual Display */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{srv.name_en}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-arabic text-slate-700">{srv.name_ar}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">{srv.name_zh}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          slug: {srv.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {catObj && getCategoryIcon(catObj.icon)}
                          <span>{catName}</span>
                        </span>
                      </td>

                      {/* Pricing Mode */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          srv.pricingMode === 'FIXED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : srv.pricingMode === 'HOURLY'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : srv.pricingMode === 'QUOTE_BASED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          <DollarSign className="w-3 h-3" />
                          <span>{srv.pricingMode.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* SLA */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{srv.quoteSlaHours} hrs</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {srv.defaultDurationMinutes} mins
                      </td>

                      {/* Dynamic Form Schema Button */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenFormBuilder(srv)}
                          className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>{srv.formSchema?.length || 0} fields</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleService(srv)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            srv.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {srv.isActive ? t('admin.servicesManager.statusActive', 'Active') : t('admin.servicesManager.statusDisabled', 'Disabled')}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenFormBuilder(srv)}
                            title={t('admin.servicesManager.configureForm', 'Form Builder')}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditService(srv)}
                            title={t('admin.servicesManager.editService', 'Edit Service')}
                            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setServiceToDelete(srv);
                              setDeleteServiceModalOpen(true);
                            }}
                            title={t('admin.servicesManager.deleteService', 'Delete Service')}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT SERVICE MODAL                                                  */}
      {/* ========================================================================= */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveService}
            className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                  {editingServiceId 
                    ? t('admin.servicesManager.editService', 'Edit Service Type') 
                    : t('admin.servicesManager.addNewService', 'Add New Service Type')}
                </h2>
                <p className="text-xs text-slate-500">Configure multilingual content, SLAs, and pricing properties.</p>
              </div>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Service Category *</label>
                  <select
                    required
                    value={serviceFormData.categoryId}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {currentLang === 'ar' ? c.name_ar : currentLang === 'zh' ? c.name_zh : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Service Slug (URL ID)</label>
                  <input
                    type="text"
                    value={serviceFormData.slug}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, slug: e.target.value })}
                    placeholder="e.g. airport-transfers"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Multilingual Names */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Multilingual Service Names
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">English *</label>
                    <input
                      type="text"
                      required
                      value={serviceFormData.name_en}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name_en: e.target.value })}
                      placeholder="e.g. Airport Transfers"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Arabic (عربي) *</label>
                    <input
                      type="text"
                      required
                      value={serviceFormData.name_ar}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name_ar: e.target.value })}
                      placeholder="توصيل واستقبال المطارات"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-arabic text-end"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Chinese (中文) *</label>
                    <input
                      type="text"
                      required
                      value={serviceFormData.name_zh}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name_zh: e.target.value })}
                      placeholder="机场接送机专车"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Multilingual Descriptions */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Multilingual Descriptions
                </span>

                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={serviceFormData.description_en}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, description_en: e.target.value })}
                      placeholder="Short summary of what this service delivers..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Arabic Description</label>
                      <textarea
                        rows={2}
                        value={serviceFormData.description_ar}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, description_ar: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-arabic text-end"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Chinese Description</label>
                      <textarea
                        rows={2}
                        value={serviceFormData.description_zh}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, description_zh: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Mode, SLA, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('admin.servicesManager.pricingMode', 'Pricing Mode')}
                  </label>
                  <select
                    value={serviceFormData.pricingMode}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, pricingMode: e.target.value as PricingMode })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="QUOTE_BASED">Quote Based (Inspection & Offer)</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="CUSTOM">Custom Scope</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('admin.servicesManager.quoteSla', 'Quote SLA')} (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={serviceFormData.quoteSlaHours}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, quoteSlaHours: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('admin.servicesManager.defaultDuration', 'Default Duration')} (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={serviceFormData.defaultDurationMinutes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, defaultDurationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Status & Sort Order */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={serviceFormData.isActive}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0A2544]"
                  />
                  <span>Active & Available for Customer Booking</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Sort Priority:</span>
                  <input
                    type="number"
                    min="1"
                    value={serviceFormData.sortOrder}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, sortOrder: Number(e.target.value) })}
                    className="w-16 p-1.5 text-center rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                {t('common.save', 'Save Service')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL                                                 */}
      {/* ========================================================================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-base text-slate-900">
                {editingCategoryId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name_en}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name_en: e.target.value })}
                  placeholder="e.g. Transportation & Airport Transfers"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Name (Arabic) *</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name_ar}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name_ar: e.target.value })}
                    placeholder="التنقلات وتوصيل المطارات"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-arabic text-end"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Name (Chinese) *</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name_zh}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name_zh: e.target.value })}
                    placeholder="专车接送与机场通勤"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Slug / Key</label>
                  <input
                    type="text"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    placeholder="e.g. transportation"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Icon Representation</label>
                  <select
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Wrench">Wrench (Maintenance)</option>
                    <option value="Car">Car (Transportation)</option>
                    <option value="Truck">Truck (Heavy Logistics)</option>
                    <option value="Sparkles">Sparkles (Cleaning)</option>
                    <option value="Tag">Tag (General)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={categoryFormData.isActive}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0A2544]"
                  />
                  <span>Active (Displayed on Home & Wizard)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Order:</span>
                  <input
                    type="number"
                    min="1"
                    value={categoryFormData.sortOrder}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, sortOrder: Number(e.target.value) })}
                    className="w-14 p-1 text-center rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM BUILDER MODAL (DYNAMIC FIELD SCHEMAS)                                */}
      {/* ========================================================================= */}
      {formBuilderOpen && builderService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase">
                    Dynamic Form Builder
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{builderService.slug}</span>
                </div>
                <h2 className="font-extrabold text-lg text-slate-900 mt-1">
                  {builderService.name_en}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('admin.servicesManager.formBuilder.subtitle', 'Customize dynamic fields presented to customers when ordering this service.')}
                </p>
              </div>

              <button
                onClick={() => setFormBuilderOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs (Fields List vs Preview) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    !previewTab ? 'bg-[#0A2544] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Fields Schema ({builderService.formSchema?.length || 0})
                </button>
                <button
                  onClick={() => setPreviewTab(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    previewTab ? 'bg-[#0A2544] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Customer Preview</span>
                </button>
              </div>

              {!previewTab && (
                <button
                  onClick={handleOpenAddField}
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('admin.servicesManager.formBuilder.addField', 'Add Custom Field')}</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3">
              {!previewTab ? (
                /* Fields List View */
                builderService.formSchema?.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="font-bold text-slate-800 text-sm">No Custom Form Fields Yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Customers ordering this service will only see the standard problem description and photos intake.
                    </p>
                    <button
                      onClick={handleOpenAddField}
                      className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Form Field</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {builderService.formSchema.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{field.label_en}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold uppercase">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-bold uppercase">
                                Required
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-arabic">{field.label_ar}</span>
                            <span>•</span>
                            <span>{field.label_zh}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400">id: {field.id}</span>
                          </div>

                          {field.options && field.options.length > 0 && (
                            <div className="text-[10px] text-blue-700 font-medium pt-0.5">
                              {field.options.length} options configured
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditField(index)}
                            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                            title="Edit Field"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteField(index)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                            title="Delete Field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Customer Preview View */
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Live Intake Form Simulation ({currentLang.toUpperCase()})
                    </span>
                    <span className="text-[11px] text-slate-400">Read-only preview</span>
                  </div>

                  <div className="space-y-4">
                    {builderService.formSchema.map((field) => {
                      const label = currentLang === 'ar' ? field.label_ar : currentLang === 'zh' ? field.label_zh : field.label_en;
                      const placeholder = currentLang === 'ar' ? field.placeholder_ar : currentLang === 'zh' ? field.placeholder_zh : field.placeholder_en;

                      return (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {label} {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {field.type === 'text' && (
                            <input
                              type="text"
                              disabled
                              placeholder={placeholder || 'Sample text input...'}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              disabled
                              rows={2}
                              placeholder={placeholder || 'Sample multi-line details...'}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                            />
                          )}

                          {field.type === 'number' && (
                            <input
                              type="number"
                              disabled
                              placeholder={placeholder || '0'}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                            />
                          )}

                          {field.type === 'select' && (
                            <select disabled className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white">
                              <option value="">Select option...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {currentLang === 'ar' ? opt.label_ar : currentLang === 'zh' ? opt.label_zh : opt.label_en}
                                </option>
                              ))}
                            </select>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-1.5">
                              {field.options?.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700">
                                  <input type="radio" disabled name={field.id} />
                                  <span>{currentLang === 'ar' ? opt.label_ar : currentLang === 'zh' ? opt.label_zh : opt.label_en}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {field.type === 'checkbox' && (
                            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800">
                              <input type="checkbox" disabled className="w-4 h-4 rounded text-[#0A2544]" />
                              <span>{label}</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setFormBuilderOpen(false)}
                className="px-5 py-2.5 bg-[#0A2544] hover:bg-[#1A5494] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIELD EDITOR MODAL (SUB-MODAL OF FORM BUILDER)                            */}
      {/* ========================================================================= */}
      {fieldModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveField}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingFieldIndex !== null ? 'Edit Form Field' : 'Add Form Field'}
              </h3>
              <button
                type="button"
                onClick={() => setFieldModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Field Key (ID) *</label>
                  <input
                    type="text"
                    required
                    value={fieldFormData.id}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, id: e.target.value })}
                    placeholder="e.g. flightNumber"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Field Type *</label>
                  <select
                    value={fieldFormData.type}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="textarea">Multi-line Textarea</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown Select</option>
                    <option value="radio">Radio Options</option>
                    <option value="checkbox">Checkbox Toggle</option>
                  </select>
                </div>
              </div>

              {/* Multilingual Labels */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Field Labels *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">English *</label>
                    <input
                      type="text"
                      required
                      value={fieldFormData.label_en}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, label_en: e.target.value })}
                      placeholder="e.g. Flight Number"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Arabic (عربي) *</label>
                    <input
                      type="text"
                      required
                      value={fieldFormData.label_ar}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, label_ar: e.target.value })}
                      placeholder="رقم الرحلة الجوية"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-arabic text-end"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Chinese (中文) *</label>
                    <input
                      type="text"
                      required
                      value={fieldFormData.label_zh}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, label_zh: e.target.value })}
                      placeholder="航班号"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Multilingual Placeholders (for text, number, textarea) */}
              {['text', 'textarea', 'number'].includes(fieldFormData.type) && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                    Placeholder Prompts (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={fieldFormData.placeholder_en || ''}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, placeholder_en: e.target.value })}
                      placeholder="English hint..."
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={fieldFormData.placeholder_ar || ''}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, placeholder_ar: e.target.value })}
                      placeholder="تلميح بالعربية..."
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-arabic text-end"
                      dir="rtl"
                    />
                    <input
                      type="text"
                      value={fieldFormData.placeholder_zh || ''}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, placeholder_zh: e.target.value })}
                      placeholder="中文提示..."
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Option Builder for Select or Radio */}
              {['select', 'radio'].includes(fieldFormData.type) && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                    Configured Options ({fieldFormData.options?.length || 0})
                  </span>

                  {fieldFormData.options && fieldFormData.options.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {fieldFormData.options.map((opt, oIdx) => (
                        <div key={opt.value} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{opt.label_en}</span>
                            <span className="text-[10px] text-slate-400 ms-2 font-mono">({opt.value})</span>
                            <span className="text-[10px] text-slate-500 ms-2 font-arabic">{opt.label_ar}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionFromField(oIdx)}
                            className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-700">Add Option:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newOption.value}
                        onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                        placeholder="Key / Value (e.g., sedan)"
                        className="p-2 rounded-xl border border-slate-300 bg-white font-mono"
                      />
                      <input
                        type="text"
                        value={newOption.label_en}
                        onChange={(e) => setNewOption({ ...newOption, label_en: e.target.value })}
                        placeholder="Label (English)"
                        className="p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newOption.label_ar}
                        onChange={(e) => setNewOption({ ...newOption, label_ar: e.target.value })}
                        placeholder="Label (Arabic)"
                        className="p-2 rounded-xl border border-slate-300 bg-white font-arabic text-end"
                        dir="rtl"
                      />
                      <input
                        type="text"
                        value={newOption.label_zh}
                        onChange={(e) => setNewOption({ ...newOption, label_zh: e.target.value })}
                        placeholder="Label (Chinese)"
                        className="p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddOptionToField}
                      className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Append Option</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Required Toggle */}
              <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={fieldFormData.required}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, required: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0A2544]"
                  />
                  <span>{t('admin.servicesManager.formBuilder.required', 'Mandatory / Required Field')}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFieldModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Save Field
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE SERVICE CONFIRMATION MODAL                                         */}
      {/* ========================================================================= */}
      {deleteServiceModalOpen && serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                {t('admin.servicesManager.deleteConfirmTitle', 'Delete Service Type?')}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                You are about to delete <strong className="text-slate-900">{serviceToDelete.name_en}</strong>.
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {t('admin.servicesManager.deleteConfirmDesc', 'Existing work orders referencing this service will retain historic records, but new customers will not be able to request it.')}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setDeleteServiceModalOpen(false);
                  setServiceToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteService}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CATEGORY CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deleteCategoryModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                {t('admin.servicesManager.deleteCategoryConfirmTitle', 'Delete Category?')}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Delete category <strong className="text-slate-900">{categoryToDelete.name_en}</strong>?
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {t('admin.servicesManager.deleteCategoryConfirmDesc', 'Make sure services under this category are reassigned first.')}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setDeleteCategoryModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
