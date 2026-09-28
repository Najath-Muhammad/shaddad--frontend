import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../components/layout/AdminHeader.js';
import { MetricCard } from '../components/common/MetricCard.js';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { Users, Truck, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { adminDriverApi } from '../api/adminDriver.api.js';
import { User } from '../../shared/types/auth.types.js';
import { DriverDossierModal } from '../components/driver/DriverDossierModal.js';

export const AdminDashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const [pendingDrivers, setPendingDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);

  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      const res = await adminDriverApi.getPendingDrivers();
      if (res.success && res.data) {
        setPendingDrivers(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending drivers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const handleVerifyAction = async (driverProfileId: string, decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reason?: string) => {
    try {
      await adminDriverApi.verifyDriver(driverProfileId, decision, reason);
      setSelectedDriver(null);
      fetchPendingDrivers();
    } catch (error) {
      console.error('Failed to verify driver', error);
      alert('Action failed. Please try again.');
    }
  };

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

        {/* Pending Drivers Verification Table */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Pending Driver Verifications
            </h3>
            <button onClick={fetchPendingDrivers} disabled={loading} className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase">
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-white border-b border-neutral-200 text-xs uppercase text-neutral-500 font-semibold">
                <tr>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pendingDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                      No pending drivers found.
                    </td>
                  </tr>
                ) : (
                  pendingDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-900">{driver.fullName}</p>
                        <p className="text-xs text-neutral-500 font-mono">ID: {driver.driverProfile?.nationalIdNumber || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{driver.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          {driver.driverProfile?.verificationStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {driver.driverProfile?.vehicle ? (
                          <span className="text-neutral-900">{driver.driverProfile.vehicle.vehicleType}</span>
                        ) : (
                          <span className="text-neutral-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedDriver(driver)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-black rounded hover:bg-neutral-800 transition-colors"
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DriverDossierModal
          driver={selectedDriver}
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onAction={handleVerifyAction}
        />
      </main>
    </div>
  );
};
