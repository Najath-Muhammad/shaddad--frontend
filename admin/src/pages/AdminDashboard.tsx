import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/common/MetricCard';
import { Users, Truck, Activity, Map, DollarSign, FileText, AlertTriangle } from 'lucide-react';
// import { adminMetricsApi } from '../api/admin.api';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real implementation:
    // adminMetricsApi.getDashboardMetrics().then(res => { setMetrics(res.data); setLoading(false); });
    
    // For now we mock the data format until the subagent finishes the API
    setTimeout(() => {
      setMetrics({
        totalCustomers: 154,
        totalDrivers: 42,
        pendingVerifications: 5,
        activeTrips: 12,
        completedTrips: 340,
        cancelledTrips: 15,
        totalPayments: 12500,
        pendingPayouts: 4,
        openDisputes: 1
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">High-level metrics across the SHADDAD platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Customers" value={metrics?.totalCustomers || 0} icon={Users} badge="All time" />
        <MetricCard title="Total Drivers" value={metrics?.totalDrivers || 0} icon={Truck} badge="Approved" />
        <MetricCard title="Pending Verifications" value={metrics?.pendingVerifications || 0} icon={Activity} badge="Action Required" />
        
        <MetricCard title="Active Trips" value={metrics?.activeTrips || 0} icon={Map} badge="Live" />
        <MetricCard title="Completed Trips" value={metrics?.completedTrips || 0} icon={Map} badge="All time" />
        <MetricCard title="Cancelled Trips" value={metrics?.cancelledTrips || 0} icon={Map} badge="All time" />
        
        <MetricCard title="Total Payments" value={`SAR ${metrics?.totalPayments || 0}`} icon={DollarSign} badge="Processed" />
        <MetricCard title="Pending Payouts" value={metrics?.pendingPayouts || 0} icon={FileText} badge="Drivers" />
        
        <MetricCard title="Open Disputes" value={metrics?.openDisputes || 0} icon={AlertTriangle} badge="Attention" />
      </div>
    </div>
  );
};
