import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/common/MetricCard';
import { Users, Truck, Activity, Map, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../api/dashboard.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getMetrics()
      .then(res => {
        setMetrics(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = [
    { name: 'Completed Trips', value: metrics?.completedTrips || 0 },
    { name: 'Active Trips', value: metrics?.activeTrips || 0 },
    { name: 'Cancelled Trips', value: metrics?.cancelledTrips || 0 },
  ];

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

      <div className="bg-white p-6 rounded-lg shadow mt-4">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Trip Overview</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
