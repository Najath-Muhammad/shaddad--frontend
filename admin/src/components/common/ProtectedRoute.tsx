import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, loadProfile } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated && !user) {
      void loadProfile();
    }
  }, [isAuthenticated, user, loadProfile]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <p className="text-sm text-neutral-500 font-medium">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
