import React, { useEffect, useState } from 'react';
import { adminEntityApi } from '../api/adminEntity.api';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyModal, setHistoryModal] = useState<any[] | null>(null);

  const fetchDrivers = async () => {
    try {
      const res = await adminEntityApi.getDrivers();
      setDrivers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleBlock = async (userId: string) => {
    try {
      await adminEntityApi.toggleUserBlock(userId);
      fetchDrivers();
    } catch (e) {
      alert('Failed to toggle block status');
    }
  };

  const handleViewRatings = async (driverProfileId: string) => {
    try {
      const res = await adminEntityApi.getDriverRatingHistory(driverProfileId);
      setHistoryModal(res.data);
    } catch (e) {
      alert('Failed to fetch rating history');
    }
  };

  if (loading) return <div>Loading drivers...</div>;

  return (
    <div className="flex flex-col gap-6 relative">
      <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {drivers.map((d) => (
            <li key={d.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{d.user.fullName} <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{d.verificationStatus}</span></p>
                <p className="text-sm text-gray-500">{d.user.phoneNumber}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Trips: {d.totalTripsCount} | Rating: {d.rating?.toFixed(1)} | Wallet: SAR {d.walletBalance}
                </p>
                {d.vehicle && (
                  <p className="text-xs text-gray-500 mt-1">Vehicle: {d.vehicle.make} {d.vehicle.model} ({d.vehicle.plateNumber})</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewRatings(d.id)}
                  className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-100 text-blue-700"
                >
                  Ratings
                </button>
                <button
                  onClick={() => handleToggleBlock(d.user.id, d.user.isActive)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md ${
                    d.user.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {d.user.isActive ? 'Block' : 'Unblock'}
                </button>
              </div>
            </li>
          ))}
          {drivers.length === 0 && <li className="px-6 py-4 text-gray-500">No drivers found.</li>}
        </ul>
      </div>

      {historyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
            <h3 className="text-lg font-bold mb-4">Rating History</h3>
            <button onClick={() => setHistoryModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">Close</button>
            <div className="flex flex-col gap-3">
              {historyModal.length === 0 && <p className="text-gray-500 text-sm">No ratings yet.</p>}
              {historyModal.map(r => (
                <div key={r.id} className="p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-medium">{r.rating} / 5</span>
                    <span className="text-xs text-gray-400">{new Date(r.trip.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-1">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    
      {blockModalOpen.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-red-600">Block User</h3>
            <p className="text-gray-600 mb-4 text-sm">Are you sure you want to block this user? They will be logged out immediately.</p>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4 text-sm"
              rows={3}
              placeholder="Enter reason for blocking (shown to user)..."
              value={blockModalOpen.reason}
              onChange={(e) => setBlockModalOpen({ ...blockModalOpen, reason: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setBlockModalOpen({ isOpen: false, userId: '', isActive: true, reason: '' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-semibold text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBlock}
                disabled={!blockModalOpen.reason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};