import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  UserProfile, UserRole, LanguageCode, City, ServiceCategory, ServiceType, 
  Provider, WorkOrder, WorkOrderStatus, Quote, Appointment, AppNotification, 
  AdminActivityLog, Review 
} from '../types';
import { 
  INITIAL_CITIES, INITIAL_CATEGORIES, INITIAL_SERVICES, 
  INITIAL_PROVIDERS, INITIAL_WORK_ORDERS, INITIAL_QUOTES, 
  INITIAL_APPOINTMENTS, INITIAL_NOTIFICATIONS 
} from '../data/seedData';
import { setAppLanguage } from '../i18n';
import { triggerWorkOrderStatusPushNotification } from '../lib/fcmNotifications';
import { syncWorkOrderToFirestore } from '../lib/firestoreSync';

interface AppState {
  // Auth & Profile
  currentUser: UserProfile;
  activeRole: UserRole;
  currentCityId: string;
  currentLanguage: LanguageCode;
  
  // Data Collections
  cities: City[];
  categories: ServiceCategory[];
  services: ServiceType[];
  providers: Provider[];
  workOrders: WorkOrder[];
  quotes: Quote[];
  appointments: Appointment[];
  notifications: AppNotification[];
  activityLogs: AdminActivityLog[];
  reviews: Review[];

  // Work order draft
  draftWorkOrder: Partial<WorkOrder> | null;

  // Actions
  setRole: (role: UserRole) => void;
  setCity: (cityId: string) => void;
  setLanguage: (lang: LanguageCode) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Work Order Actions
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'createdAt' | 'updatedAt'>) => WorkOrder;
  updateWorkOrderStatus: (id: string, newStatus: WorkOrderStatus, note?: string) => void;
  saveDraftWorkOrder: (draft: Partial<WorkOrder> | null) => void;
  submitCustomerReview: (workOrderId: string, rating: number, comment: string) => void;

  // Quote Actions
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Quote;
  acceptQuote: (quoteId: string) => void;
  declineQuote: (quoteId: string) => void;

  // Appointment & Provider Actions
  assignProviderToWorkOrder: (workOrderId: string, providerId: string) => void;
  scheduleAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; conflict?: boolean; appointment?: Appointment };
  
  // Provider Field Actions
  providerUpdateStatus: (workOrderId: string, status: WorkOrderStatus, note?: string) => void;
  providerUploadPhotos: (workOrderId: string, photoUrls: string[]) => void;

  // Catalog & City Management (Admin)
  addServiceCategory: (category: Omit<ServiceCategory, 'id'>) => void;
  updateServiceCategory: (id: string, updates: Partial<ServiceCategory>) => void;
  deleteServiceCategory: (id: string) => void;
  addServiceType: (service: Omit<ServiceType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateServiceType: (id: string, updates: Partial<ServiceType>) => void;
  toggleServiceType: (id: string, isActive: boolean) => void;
  deleteServiceType: (id: string) => void;
  addCity: (city: Omit<City, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCity: (id: string, updates: Partial<City>) => void;
  toggleCity: (id: string, isActive: boolean) => void;
  addProvider: (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;

  // Reset/Seed helper
  resetToDefaultData: () => void;
}

const DEFAULT_USER: UserProfile = {
  uid: 'cust-demo-1',
  id: 'cust-demo-1',
  authUserId: 'auth-demo-karim',
  fullName: 'Karim Mostafa',
  phone: '+20 102 938 4811',
  email: 'karim.m@gmail.com',
  preferredLanguage: 'en',
  role: 'CUSTOMER',
  cityId: 'city-ras-gharib',
  addressText: 'Al-Mina St, Building 14, Apt 3, Ras Gharib',
  isActive: true,
  termsAccepted: true,
  termsAcceptedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: DEFAULT_USER,
      activeRole: 'CUSTOMER',
      currentCityId: 'city-ras-gharib',
      currentLanguage: (localStorage.getItem('rsc_preferred_lang') as LanguageCode) || 'en',

      cities: INITIAL_CITIES,
      categories: INITIAL_CATEGORIES,
      services: INITIAL_SERVICES,
      providers: INITIAL_PROVIDERS,
      workOrders: INITIAL_WORK_ORDERS,
      quotes: INITIAL_QUOTES,
      appointments: INITIAL_APPOINTMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      activityLogs: [
        {
          id: 'log-1',
          action: 'STATUS_CHANGE',
          details: 'Work Order RSC-000001 status changed to QUOTE_SENT',
          entityType: 'WORK_ORDER',
          entityId: 'wo-001',
          performedBy: 'Red Sea Connect Dispatch',
          performedByRole: 'ADMIN',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      reviews: [
        {
          id: 'rev-1',
          workOrderId: 'wo-003',
          customerId: 'cust-demo-1',
          customerName: 'Karim Mostafa',
          providerId: 'prov-mahmoud-plumb',
          rating: 5,
          comment: 'Outstanding professionalism. Arrived promptly with genuine parts and tested everything cleanly.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],
      draftWorkOrder: null,

      setRole: (role: UserRole) => {
        set({ activeRole: role });
      },

      setCity: (cityId: string) => {
        set({ currentCityId: cityId });
      },

      setLanguage: (lang: LanguageCode) => {
        setAppLanguage(lang);
        set({ currentLanguage: lang });
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      createWorkOrder: (orderData) => {
        const state = get();
        const nextIndex = state.workOrders.length + 1;
        const workOrderNumber = `RSC-${String(nextIndex).padStart(6, '0')}`;
        const newId = `wo-${Date.now()}`;

        const newWorkOrder: WorkOrder = {
          ...orderData,
          id: newId,
          workOrderNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'CREATE_WORK_ORDER',
          details: `New Work Order ${workOrderNumber} created for ${newWorkOrder.serviceTypeName || 'Service'}`,
          entityType: 'WORK_ORDER',
          entityId: newId,
          performedBy: newWorkOrder.customerName,
          performedByRole: 'CUSTOMER',
          timestamp: new Date().toISOString(),
        };

        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: newWorkOrder.customerId,
          title: `Work Order ${workOrderNumber} Received`,
          title_ar: `تم استلام أمر العمل ${workOrderNumber}`,
          title_zh: `工单 ${workOrderNumber} 已接收`,
          message: 'Our operations team is reviewing your requirements to provide an official quotation.',
          message_ar: 'يقوم فريق العمليات بمراجعة تفاصيل طلبك لإعداد عرض السعر الشفاف.',
          message_zh: '运营中台正在审核您的需求细节，将尽快出具明细报价单。',
          type: 'REQUEST',
          workOrderId: newId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          workOrders: [newWorkOrder, ...state.workOrders],
          activityLogs: [newLog, ...state.activityLogs],
          notifications: [newNotif, ...state.notifications],
          draftWorkOrder: null,
        }));

        // Trigger Cloud Sync & FCM alert
        syncWorkOrderToFirestore(newWorkOrder).catch(console.warn);
        triggerWorkOrderStatusPushNotification(newWorkOrder, 'SUBMITTED').catch(console.warn);

        return newWorkOrder;
      },

      updateWorkOrderStatus: (id: string, newStatus: WorkOrderStatus, note?: string) => {
        const state = get();
        const order = state.workOrders.find((w) => w.id === id);
        if (!order) return;

        let targetUpdatedOrder: WorkOrder | undefined;

        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === id) {
            targetUpdatedOrder = {
              ...w,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : w.completedAt,
            };
            return targetUpdatedOrder;
          }
          return w;
        });

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'STATUS_CHANGE',
          details: `Status of ${order.workOrderNumber} updated from ${order.status} to ${newStatus}${note ? ` (${note})` : ''}`,
          entityType: 'WORK_ORDER',
          entityId: id,
          performedBy: state.activeRole,
          performedByRole: state.activeRole,
          timestamp: new Date().toISOString(),
        };

        // Notify customer on key transitions
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: order.customerId,
          title: `Status Update: ${order.workOrderNumber}`,
          title_ar: `تحديث حالة: ${order.workOrderNumber}`,
          title_zh: `工单状态更新: ${order.workOrderNumber}`,
          message: `Your work order status changed to ${newStatus}.`,
          message_ar: `تم تغيير حالة طلبك إلى: ${newStatus}`,
          message_zh: `您的工单状态已变更为: ${newStatus}`,
          type: 'STATUS_CHANGE',
          workOrderId: id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set({
          workOrders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
          notifications: [newNotif, ...state.notifications],
        });

        // Trigger Firebase Cloud Messaging Push Notification & Cloud Sync
        if (targetUpdatedOrder) {
          syncWorkOrderToFirestore(targetUpdatedOrder).catch(console.warn);
          triggerWorkOrderStatusPushNotification(targetUpdatedOrder, newStatus, note).catch(console.warn);
        }
      },

      saveDraftWorkOrder: (draft) => {
        set({ draftWorkOrder: draft });
      },

      submitCustomerReview: (workOrderId, rating, comment) => {
        const state = get();
        const order = state.workOrders.find((w) => w.id === workOrderId);
        if (!order) return;

        const newReview: Review = {
          id: `rev-${Date.now()}`,
          workOrderId,
          customerId: order.customerId,
          customerName: order.customerName,
          providerId: order.assignedProviderId || '',
          rating,
          comment,
          createdAt: new Date().toISOString(),
        };

        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === workOrderId) {
            return {
              ...w,
              rating,
              reviewComment: comment,
              updatedAt: new Date().toISOString(),
            };
          }
          return w;
        });

        // Update provider rating & completedJobs count
        const updatedProviders = state.providers.map((p) => {
          if (p.id === order.assignedProviderId) {
            const allProvReviews = [...state.reviews.filter((r) => r.providerId === p.id), newReview];
            const avgRating = allProvReviews.reduce((acc, r) => acc + r.rating, 0) / allProvReviews.length;
            return {
              ...p,
              rating: Number(avgRating.toFixed(2)),
              completedJobs: p.completedJobs + 1,
            };
          }
          return p;
        });

        set({
          workOrders: updatedOrders,
          reviews: [newReview, ...state.reviews],
          providers: updatedProviders,
        });
      },

      createQuote: (quoteData) => {
        const newId = `quote-${Date.now()}`;
        const newQuote: Quote = {
          ...quoteData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const state = get();
        let updatedOrderWithQuote: WorkOrder | undefined;
        // Update work order with quoteId and status QUOTE_SENT
        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === quoteData.workOrderId) {
            updatedOrderWithQuote = {
              ...w,
              quoteId: newId,
              status: 'QUOTE_SENT' as WorkOrderStatus,
              assignedProviderId: quoteData.providerId || w.assignedProviderId,
              updatedAt: new Date().toISOString(),
            };
            return updatedOrderWithQuote;
          }
          return w;
        });

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'CREATE_QUOTE',
          details: `Quotation of ${newQuote.total} ${newQuote.currency} created for ${newQuote.workOrderNumber}`,
          entityType: 'QUOTE',
          entityId: newId,
          performedBy: quoteData.createdBy,
          performedByRole: 'ADMIN',
          timestamp: new Date().toISOString(),
        };

        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: 'cust-demo-1',
          title: `Offer Ready for ${newQuote.workOrderNumber}`,
          title_ar: `عرض سعر جاهز لأمر العمل ${newQuote.workOrderNumber}`,
          title_zh: `工单 ${newQuote.workOrderNumber} 报价已生成`,
          message: `Official offer of ${newQuote.total} ${newQuote.currency} is ready for review.`,
          message_ar: `عرض السعر بقيمة ${newQuote.total} ${newQuote.currency} متاح الآن للمراجعة والقبول.`,
          message_zh: `报价方案（金额 ${newQuote.total} ${newQuote.currency}）已发送，请查阅确认。`,
          type: 'QUOTE',
          workOrderId: newQuote.workOrderId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set({
          quotes: [newQuote, ...state.quotes.filter((q) => q.workOrderId !== quoteData.workOrderId)],
          workOrders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
          notifications: [newNotif, ...state.notifications],
        });

        // Trigger FCM Push & Cloud Sync
        if (updatedOrderWithQuote) {
          syncWorkOrderToFirestore(updatedOrderWithQuote).catch(console.warn);
          triggerWorkOrderStatusPushNotification(updatedOrderWithQuote, 'QUOTE_SENT', `Offer total: ${newQuote.total} ${newQuote.currency}`).catch(console.warn);
        }

        return newQuote;
      },

      acceptQuote: (quoteId) => {
        const state = get();
        const quote = state.quotes.find((q) => q.id === quoteId);
        if (!quote) return;

        let acceptedOrder: WorkOrder | undefined;

        const updatedQuotes = state.quotes.map((q) =>
          q.id === quoteId ? { ...q, status: 'ACCEPTED' as const, updatedAt: new Date().toISOString() } : q
        );

        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === quote.workOrderId) {
            acceptedOrder = { ...w, status: 'QUOTE_ACCEPTED' as WorkOrderStatus, updatedAt: new Date().toISOString() };
            return acceptedOrder;
          }
          return w;
        });

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'ACCEPT_QUOTE',
          details: `Customer accepted offer for ${quote.workOrderNumber}`,
          entityType: 'QUOTE',
          entityId: quoteId,
          performedBy: 'Customer',
          performedByRole: 'CUSTOMER',
          timestamp: new Date().toISOString(),
        };

        set({
          quotes: updatedQuotes,
          workOrders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
        });

        if (acceptedOrder) {
          syncWorkOrderToFirestore(acceptedOrder).catch(console.warn);
          triggerWorkOrderStatusPushNotification(acceptedOrder, 'QUOTE_ACCEPTED').catch(console.warn);
        }
      },

      declineQuote: (quoteId) => {
        const state = get();
        const quote = state.quotes.find((q) => q.id === quoteId);
        if (!quote) return;

        const updatedQuotes = state.quotes.map((q) =>
          q.id === quoteId ? { ...q, status: 'DECLINED' as const, updatedAt: new Date().toISOString() } : q
        );

        const updatedOrders = state.workOrders.map((w) =>
          w.id === quote.workOrderId ? { ...w, status: 'QUOTE_DECLINED' as WorkOrderStatus, updatedAt: new Date().toISOString() } : w
        );

        set({
          quotes: updatedQuotes,
          workOrders: updatedOrders,
        });
      },

      assignProviderToWorkOrder: (workOrderId, providerId) => {
        const state = get();
        const provider = state.providers.find((p) => p.id === providerId);
        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === workOrderId) {
            return {
              ...w,
              assignedProviderId: providerId,
              assignedProviderName: provider?.businessName || '',
              status: (w.status === 'SUBMITTED' || w.status === 'UNDER_REVIEW') ? 'ASSIGNED' as WorkOrderStatus : w.status,
              updatedAt: new Date().toISOString(),
            };
          }
          return w;
        });

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'ASSIGN_PROVIDER',
          details: `Assigned provider ${provider?.businessName} to work order`,
          entityType: 'WORK_ORDER',
          entityId: workOrderId,
          performedBy: state.activeRole,
          performedByRole: state.activeRole,
          timestamp: new Date().toISOString(),
        };

        set({
          workOrders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      scheduleAppointment: (appointmentData) => {
        const state = get();
        
        // Conflict detection: Check if provider already has an appointment overlapping
        const newStart = new Date(appointmentData.scheduledStart).getTime();
        const newEnd = new Date(appointmentData.scheduledEnd).getTime();

        const conflict = state.appointments.some((apt) => {
          if (apt.providerId !== appointmentData.providerId) return false;
          if (apt.status === 'CANCELLED') return false;
          const aptStart = new Date(apt.scheduledStart).getTime();
          const aptEnd = new Date(apt.scheduledEnd).getTime();
          return (newStart < aptEnd && newEnd > aptStart);
        });

        if (conflict) {
          return { success: false, conflict: true };
        }

        const newAppointment: Appointment = {
          ...appointmentData,
          id: `apt-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        let scheduledOrder: WorkOrder | undefined;

        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === appointmentData.workOrderId) {
            scheduledOrder = {
              ...w,
              appointmentId: newAppointment.id,
              assignedProviderId: appointmentData.providerId,
              assignedProviderName: appointmentData.providerName,
              status: 'SCHEDULED' as WorkOrderStatus,
              updatedAt: new Date().toISOString(),
            };
            return scheduledOrder;
          }
          return w;
        });

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'SCHEDULE_JOB',
          details: `Scheduled job ${appointmentData.workOrderNumber} on ${new Date(appointmentData.scheduledStart).toLocaleString()} with ${appointmentData.providerName}`,
          entityType: 'APPOINTMENT',
          entityId: newAppointment.id,
          performedBy: state.activeRole,
          performedByRole: state.activeRole,
          timestamp: new Date().toISOString(),
        };

        set({
          appointments: [newAppointment, ...state.appointments],
          workOrders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
        });

        if (scheduledOrder) {
          syncWorkOrderToFirestore(scheduledOrder).catch(console.warn);
          triggerWorkOrderStatusPushNotification(scheduledOrder, 'SCHEDULED', `Appointment set for ${new Date(appointmentData.scheduledStart).toLocaleDateString()}`).catch(console.warn);
        }

        return { success: true, conflict: false, appointment: newAppointment };
      },

      providerUpdateStatus: (workOrderId, status, note) => {
        const state = get();
        const order = state.workOrders.find((w) => w.id === workOrderId);
        if (!order) return;

        let providerUpdatedOrder: WorkOrder | undefined;

        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === workOrderId) {
            providerUpdatedOrder = {
              ...w,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === 'COMPLETED' ? new Date().toISOString() : w.completedAt,
              internalNotes: note ? `${w.internalNotes || ''}\n[Provider Note]: ${note}` : w.internalNotes,
            };
            return providerUpdatedOrder;
          }
          return w;
        });

        const newLog: AdminActivityLog = {
          id: `log-${Date.now()}`,
          action: 'PROVIDER_STATUS_UPDATE',
          details: `Provider updated ${order.workOrderNumber} status to ${status}`,
          entityType: 'WORK_ORDER',
          entityId: workOrderId,
          performedBy: 'Provider',
          performedByRole: 'PROVIDER',
          timestamp: new Date().toISOString(),
        };

        // Notify customer
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: order.customerId,
          title: `Field Update: ${order.workOrderNumber}`,
          title_ar: `تحديث ميداني: ${order.workOrderNumber}`,
          title_zh: `技师施工更新: ${order.workOrderNumber}`,
          message: status === 'EN_ROUTE' 
            ? 'Your service technician is on the way.' 
            : status === 'IN_PROGRESS' 
            ? 'Service work is currently in progress.' 
            : status === 'COMPLETED' 
            ? 'Technician has completed the job. Please confirm and review.' 
            : `Status changed to ${status}`,
          type: 'STATUS_CHANGE',
          workOrderId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set({
          workOrders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
          notifications: [newNotif, ...state.notifications],
        });

        // Trigger Firebase Cloud Messaging Push Notification & Cloud Sync
        if (providerUpdatedOrder) {
          syncWorkOrderToFirestore(providerUpdatedOrder).catch(console.warn);
          triggerWorkOrderStatusPushNotification(providerUpdatedOrder, status, note).catch(console.warn);
        }
      },

      providerUploadPhotos: (workOrderId, photoUrls) => {
        const state = get();
        const updatedOrders = state.workOrders.map((w) => {
          if (w.id === workOrderId) {
            const newAttachments = photoUrls.map((url, idx) => ({
              id: `att-prov-${Date.now()}-${idx}`,
              url,
              name: `completion_photo_${idx + 1}.jpg`,
              type: 'image' as const,
              sizeBytes: 1024000,
              uploadedBy: 'Provider',
              uploadedAt: new Date().toISOString(),
            }));
            return {
              ...w,
              attachments: [...w.attachments, ...newAttachments],
              updatedAt: new Date().toISOString(),
            };
          }
          return w;
        });

        set({ workOrders: updatedOrders });
      },

      // Admin Catalog actions
      addServiceCategory: (category) => {
        const newCat: ServiceCategory = {
          ...category,
          id: `cat-${Date.now()}`,
        };
        set((state) => ({ categories: [...state.categories, newCat] }));
      },

      updateServiceCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteServiceCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addServiceType: (service) => {
        const newSrv: ServiceType = {
          ...service,
          id: `srv-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ services: [...state.services, newSrv] }));
      },

      updateServiceType: (id, updates) => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      toggleServiceType: (id, isActive) => {
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, isActive } : s)),
        }));
      },

      deleteServiceType: (id) => {
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }));
      },

      addCity: (city) => {
        const newCity: City = {
          ...city,
          id: `city-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ cities: [...state.cities, newCity] }));
      },

      updateCity: (id, updates) => {
        set((state) => ({
          cities: state.cities.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      toggleCity: (id, isActive) => {
        set((state) => ({
          cities: state.cities.map((c) => (c.id === id ? { ...c, isActive } : c)),
        }));
      },

      addProvider: (prov) => {
        const newProv: Provider = {
          ...prov,
          id: `prov-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ providers: [...state.providers, newProv] }));
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      addNotification: (notif) => {
        const newN: AppNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ notifications: [newN, ...state.notifications] }));
      },

      resetToDefaultData: () => {
        set({
          cities: INITIAL_CITIES,
          categories: INITIAL_CATEGORIES,
          services: INITIAL_SERVICES,
          providers: INITIAL_PROVIDERS,
          workOrders: INITIAL_WORK_ORDERS,
          quotes: INITIAL_QUOTES,
          appointments: INITIAL_APPOINTMENTS,
          notifications: INITIAL_NOTIFICATIONS,
          currentUser: DEFAULT_USER,
        });
      },
    }),
    {
      name: 'red-sea-connect-store-v2',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState) return persistedState;
        if (version < 2) {
          const existingServices = persistedState.services || [];
          const existingCategories = persistedState.categories || [];
          const missingServices = INITIAL_SERVICES.filter(
            (s) => !existingServices.some((es: any) => es.id === s.id)
          );
          const updatedCategories = existingCategories.map((c: any) =>
            c.id === 'cat-transportation' ? { ...c, isActive: true, sortOrder: 2 } : c
          );
          if (!updatedCategories.some((c: any) => c.id === 'cat-transportation')) {
            const transCat = INITIAL_CATEGORIES.find((c) => c.id === 'cat-transportation');
            if (transCat) updatedCategories.push(transCat);
          }
          return {
            ...persistedState,
            services: [...existingServices, ...missingServices],
            categories: updatedCategories,
          };
        }
        return persistedState;
      },
    }
  )
);
