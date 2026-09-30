import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';
import { Shield } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { user } = useAdminAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 h-16 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
            <Shield className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">{user?.fullName || 'Administrator'}</span>
            <span className="text-[10px] font-bold uppercase bg-black text-white px-1.5 py-0.5 rounded">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
