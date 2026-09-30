import React, { useEffect, useState } from 'react';
import { adminEntityApi } from '../api/adminEntity.api';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await adminEntityApi.getCustomers();
      setCustomers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (userId: string) => {
    try {
      await adminEntityApi.toggleUserBlock(userId);
      fetchCustomers();
    } catch (e) {
      alert('Failed to toggle block status');
    }
  };

  if (loading) return <div>Loading customers...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {customers.map((c) => (
            <li key={c.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.user.fullName}</p>
                <p className="text-sm text-gray-500">{c.user.phoneNumber}</p>
                <p className="text-xs text-gray-400 mt-1">Trips: {c.totalTripsCount} | Rating: {c.rating?.toFixed(1)}</p>
              </div>
              <div>
                <button
                  onClick={() => handleToggleBlock(c.user.id)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md ${
                    c.user.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {c.user.isActive ? 'Block' : 'Unblock'}
                </button>
              </div>
            </li>
          ))}
          {customers.length === 0 && <li className="px-6 py-4 text-gray-500">No customers found.</li>}
        </ul>
      </div>
    </div>
  );
};
