import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps { children: React.ReactNode; allowedRoles?: UserRole[]; }
const ADMIN_ROLES: UserRole[] = ['ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'];
const Loading = ({ message }: { message: string }) => <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" /><p className="text-xs text-slate-500 font-medium mt-3">{message}</p></div>;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, role } = useAuth(); const location = useLocation();
  if (loading) return <Loading message="Verifying authentication..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles?.length && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname, currentRole: role }} replace />;
  return <>{children}</>;
};

export const GuestRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, loading, role } = useAuth(); const location = useLocation();
  if (loading) return <Loading message="Loading..." />;
  if (!isAuthenticated) return <>{children}</>;
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  if (from) return <Navigate to={from} replace />;
  if (ADMIN_ROLES.includes(role)) return <Navigate to="/admin" replace />;
  return <Navigate to={role === 'PROVIDER' ? '/provider' : '/home'} replace />;
};
