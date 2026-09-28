import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute, GuestRoute } from './features/auth/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { PushNotificationToast } from './components/common/PushNotificationToast';

// Auth Pages
import { SignInPage } from './features/auth/SignInPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { TermsPage } from './features/auth/TermsPage';
import { PrivacyPage } from './features/auth/PrivacyPage';
import { UnauthorizedPage } from './features/auth/UnauthorizedPage';

// Customer Pages
import { CustomerHome } from './features/customer/CustomerHome';
import { RequestWizard } from './features/customer/RequestWizard';
import { RequestsList } from './features/customer/RequestsList';
import { WorkOrderDetail } from './features/customer/WorkOrderDetail';
import { ServicesCatalog } from './features/customer/ServicesCatalog';
import { CustomerProfile } from './features/customer/CustomerProfile';
import { CustomerSupport } from './features/customer/CustomerSupport';

// Admin Pages
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminWorkOrders } from './features/admin/AdminWorkOrders';
import { AdminWorkOrderDetail } from './features/admin/AdminWorkOrderDetail';
import { AdminQuoteBuilder } from './features/admin/AdminQuoteBuilder';
import { AdminCalendar } from './features/admin/AdminCalendar';
import { AdminProviders } from './features/admin/AdminProviders';
import { AdminUsers } from './features/admin/AdminUsers';
import { AdminServices } from './features/admin/AdminServices';
import { AdminCities } from './features/admin/AdminCities';
import { AdminAuditLog } from './features/admin/AdminAuditLog';

// Provider Pages
import { ProviderHome } from './features/provider/ProviderHome';
import { CoastalOfflineBanner } from './components/common/CoastalOfflineBanner';

const ADMIN_ROLES = ['ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'] as const;
const PROVIDER_ROLES = ['PROVIDER', 'ADMIN', 'OPS_ADMIN', 'SUPER_ADMIN'] as const;

export default function App() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';



  return (
    <BrowserRouter>
      <AuthProvider>
        <div 
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white ${
            isRtl ? 'font-arabic' : 'font-sans'
          }`}
        >
          <Header />
          <CoastalOfflineBanner />
          <PushNotificationToast />
          
          <main className="flex-1">
            <Routes>
              {/* Guest Authentication Routes */}
              <Route path="/login" element={<GuestRoute><SignInPage /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

              {/* Public Legal / Info Routes */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Public / Landing Route */}
              <Route path="/" element={<CustomerHome />} />
              <Route path="/home" element={<CustomerHome />} />
              <Route path="/services" element={<ServicesCatalog />} />
              <Route path="/support" element={<CustomerSupport />} />

              {/* Protected Customer Routes */}
              <Route 
                path="/request" 
                element={
                  <ProtectedRoute>
                    <RequestWizard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <ProtectedRoute>
                    <RequestsList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests/:id" 
                element={
                  <ProtectedRoute>
                    <WorkOrderDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <CustomerProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Operations Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminWorkOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/orders/:id" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminWorkOrderDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/quote-builder" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminQuoteBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/calendar" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminCalendar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/providers" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminProviders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/services" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/cities" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminCities />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/audit" 
                element={
                  <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
                    <AdminAuditLog />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Provider Field Routes */}
              <Route 
                path="/provider" 
                element={
                  <ProtectedRoute allowedRoles={[...PROVIDER_ROLES]}>
                    <ProviderHome />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/provider/jobs" 
                element={
                  <ProtectedRoute allowedRoles={[...PROVIDER_ROLES]}>
                    <ProviderHome />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/provider/profile" 
                element={
                  <ProtectedRoute allowedRoles={[...PROVIDER_ROLES]}>
                    <CustomerProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
