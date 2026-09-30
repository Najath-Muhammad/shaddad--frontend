import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverVerification } from './pages/DriverVerification';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Dummy components for other pages for now
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-2 text-gray-500">Coming soon.</p></div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<PlaceholderPage title="Customers" />} />
          <Route path="drivers" element={<PlaceholderPage title="Drivers" />} />
          <Route path="vehicles" element={<PlaceholderPage title="Vehicles" />} />
          <Route path="driver-verification" element={<DriverVerification />} />
          <Route path="trips" element={<PlaceholderPage title="Trips" />} />
          <Route path="live-trips" element={<PlaceholderPage title="Live Trips Map" />} />
          <Route path="pricing" element={<PlaceholderPage title="Pricing Configuration" />} />
          <Route path="payments" element={<PlaceholderPage title="Payments" />} />
          <Route path="payouts" element={<PlaceholderPage title="Payouts" />} />
          <Route path="reviews" element={<PlaceholderPage title="Reviews" />} />
          <Route path="disputes" element={<PlaceholderPage title="Disputes" />} />
          <Route path="support" element={<PlaceholderPage title="Support Tickets" />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
