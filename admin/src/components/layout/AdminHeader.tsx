import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';
import { LogOut, Shield } from 'lucide-react';
import { Button } from '../common/Button.js';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center rounded-lg font-black text-base tracking-wider">
            SH
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 tracking-tight leading-none">SHADDAD</h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mt-0.5">Admin Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200">
            <Shield className="w-3.5 h-3.5 text-neutral-700" />
            <span className="text-xs font-semibold text-neutral-900">{user?.fullName || 'Administrator'}</span>
            <span className="text-[10px] font-bold uppercase bg-black text-white px-1.5 py-0.5 rounded">
              {user?.role || 'ADMIN'}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={logout}
            className="text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
