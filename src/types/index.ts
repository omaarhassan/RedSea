export type UserRole = 
  | 'CUSTOMER' 
  | 'PROVIDER' 
  | 'ADMIN' 
  | 'OPS_ADMIN' 
  | 'FINANCE_ADMIN' 
  | 'SUPER_ADMIN';

export type LanguageCode = 'en' | 'ar' | 'zh';

export interface UserProfile {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  cityId: string;
  preferredLanguage: LanguageCode;
  role: UserRole;
  isActive: boolean;
  termsAccepted: boolean;
  termsAcceptedAt: string;
  avatarUrl?: string;
  addressText?: string;
  createdAt: string;
  updatedAt: string;
  // Aliases for compatibility
  id?: string;
  authUserId?: string;
}

export interface City {
  id: string;
  name_en: string;
  name_ar: string;
  name_zh: string;
  slug: string;
  isActive: boolean;
  timezone: string;
  operatingHours?: string;
  emergencyAvailable?: boolean;
  serviceAreas?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name_en: string;
  name_ar: string;
  name_zh: string;
  slug: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export type PricingMode = 'FIXED' | 'QUOTE_BASED' | 'HOURLY' | 'CUSTOM';

export interface FormFieldSchema {
  id: string;
  label_en: string;
  label_ar: string;
  label_zh: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'radio' | 'checkbox';
  options?: { value: string; label_en: string; label_ar: string; label_zh: string }[];
  placeholder_en?: string;
  placeholder_ar?: string;
  placeholder_zh?: string;
  required: boolean;
}

export interface ServiceType {
  id: string;
  categoryId: string;
  name_en: string;
  name_ar: string;
  name_zh: string;
  slug: string;
  description_en: string;
  description_ar: string;
  description_zh: string;
  pricingMode: PricingMode;
  formSchema: FormFieldSchema[];
  defaultDurationMinutes: number;
  quoteSlaHours: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  profileId: string;
  cityId: string;
  businessName: string;
  description: string;
  phone: string;
  email?: string;
  rating: number;
  completedJobs: number;
  isVerified: boolean;
  isAvailable: boolean;
  serviceCategoryIds: string[];
  baseHourlyRate?: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTE_SENT'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD'
  | 'DISPUTED'
  | 'CLOSED';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface WorkOrderAttachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'document';
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WorkOrderStatusHistory {
  id: string;
  fromStatus: WorkOrderStatus;
  toStatus: WorkOrderStatus;
  changedBy: string;
  changedByRole: UserRole;
  note?: string;
  timestamp: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string; // e.g. RSC-000001
  customerId: string;
  customerName: string;
  customerPhone: string;
  cityId: string;
  cityName?: string;
  serviceCategoryId: string;
  serviceCategoryName?: string;
  serviceTypeId: string;
  serviceTypeName?: string;
  status: WorkOrderStatus;
  priority: Priority;
  description: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
  preferredDate: string;
  preferredTime: string;
  flexibleTime: boolean;
  formData?: Record<string, any>;
  attachments: WorkOrderAttachment[];
  assignedProviderId?: string;
  assignedProviderName?: string;
  quoteId?: string;
  appointmentId?: string;
  internalNotes?: string;
  rating?: number;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  providerCost?: number; // ADMIN ONLY
}

export interface Quote {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  providerId?: string;
  providerName?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVISED';
  lineItems: QuoteLineItem[];
  subtotal: number;
  discount: number;
  serviceFee: number;
  tax: number;
  total: number;
  providerCost: number; // ADMIN ONLY
  margin: number; // ADMIN ONLY (total - providerCost)
  marginPercentage: number; // ADMIN ONLY
  currency: string;
  validUntil: string;
  customerNote?: string;
  internalNote?: string; // ADMIN ONLY
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  providerId: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  addressText: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  title_ar?: string;
  title_zh?: string;
  message: string;
  message_ar?: string;
  message_zh?: string;
  type: 'REQUEST' | 'QUOTE' | 'APPOINTMENT' | 'STATUS_CHANGE' | 'SYSTEM';
  workOrderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  workOrderId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  details: string;
  entityType: 'WORK_ORDER' | 'QUOTE' | 'PROVIDER' | 'APPOINTMENT' | 'SERVICE' | 'CITY';
  entityId: string;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
}
