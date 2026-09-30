import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Truck, Car, ShieldCheck, Map, 
  DollarSign, FileText, Star, AlertTriangle, LifeBuoy, BarChart3, Settings, LogOut
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/drivers', label: 'Drivers', icon: Truck },
  { path: '/vehicles', label: 'Vehicles', icon: Car },
  { path: '/driver-verification', label: 'Driver Verification', icon: ShieldCheck },
  { path: '/trips', label: 'Trips', icon: Map },
  { path: '/live-trips', label: 'Live Trips', icon: Map },
  { path: '/pricing', label: 'Pricing', icon: DollarSign },
  { path: '/payments', label: 'Payments', icon: DollarSign },
  { path: '/payouts', label: 'Payouts', icon: FileText },
  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/disputes', label: 'Disputes', icon: AlertTriangle },
  { path: '/support', label: 'Support', icon: LifeBuoy },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">SHADDAD Admin</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
