import React from 'react';
import { AdminHeader } from '../components/layout/AdminHeader.js';
import { MetricCard } from '../components/common/MetricCard.js';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { Users, Truck, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAdminAuth();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-md text-[11px] font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 1 Verified Foundation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Welcome back, {user?.fullName || 'Admin'}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 max-w-2xl">
                SHADDAD administrative control system. Foundation and multi-role authentication active with token rotation and role-based guards.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                System Healthy
              </span>
            </div>
          </div>
        </div>

        {/* Overview KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value="Active"
            subtitle="Customers & Drivers"
            icon={Users}
            badge="Foundation"
          />
          <MetricCard
            title="Driver Verification"
            value="Ready"
            subtitle="Phase 3 Pipeline"
            icon={Truck}
            badge="Phase 3"
          />
          <MetricCard
            title="Security / RBAC"
            value="Enforced"
            subtitle="Access & Refresh Tokens"
            icon={CheckCircle2}
            badge="Active"
          />
          <MetricCard
            title="API Status"
            value="Online"
            subtitle="Node.js + PostgreSQL"
            icon={Activity}
            badge="v1.0.0"
          />
        </div>

        {/* Phase Details Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-3">
            Phase 1 Foundation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="font-bold text-neutral-900 mb-1">🔐 Auth Engine</p>
              <p className="text-neutral-600">Access Token (15m) + Refresh Token rotation (7d) with DB hashing and revoke mechanism.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="font-bold text-neutral-900 mb-1">🛡️ Role Guards</p>
              <p className="text-neutral-600">Role-based authorization middleware protecting Customer, Driver, and Admin endpoints.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="font-bold text-neutral-900 mb-1">📐 Layered Architecture</p>
              <p className="text-neutral-600">Controllers → Services (IServices) → Repositories (IRepositories) with clean Dependency Injection.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
