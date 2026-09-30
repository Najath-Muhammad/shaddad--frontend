import React, { useEffect, useState } from 'react';
import { adminEntityApi } from '../api/adminEntity.api';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await adminEntityApi.getTrips();
      setTrips(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading) return <div>Loading trips...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-900">Trips</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {trips.map((t) => (
            <li key={t.id} className="px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1">{t.status}</p>
                <div className="flex flex-col md:flex-row md:gap-8 text-sm text-gray-500">
                  <div>
                    <span className="font-semibold text-gray-700">Customer:</span> {t.customer.user.fullName} ({t.customer.user.phoneNumber})
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Driver:</span> {t.driver.user.fullName} ({t.driver.user.phoneNumber})
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  <p>From: {t.pickupAddress}</p>
                  <p>To: {t.destinationAddress}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">SAR {t.totalPrice}</p>
                <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
            </li>
          ))}
          {trips.length === 0 && <li className="px-6 py-4 text-gray-500">No trips found.</li>}
        </ul>
      </div>
    </div>
  );
};
