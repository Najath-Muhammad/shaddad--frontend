import React, { useState, useEffect } from 'react';
import { adminDriverApi } from '../api/adminDriver.api.js';
import { DriverDossierModal } from '../components/driver/DriverDossierModal.js';

// Shape returned by GET /admin/drivers/pending
interface PendingDriverProfile {
  id: string;
  userId: string;
  user: { fullName: string; phoneNumber: string; email: string | null };
  nationalIdNumber: string | null;
  licenseNumber: string | null;
  verificationStatus: string;
  vehicle: { vehicleType: string; make: string; model: string } | null;
  rejectionReason?: string | null;
}

export const DriverVerification: React.FC = () => {
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriverProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<PendingDriverProfile | null>(null);

  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      const res = await adminDriverApi.getPendingDrivers();
      if (res.success && res.data) {
        setPendingDrivers(res.data as any as PendingDriverProfile[]);
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Driver Verification</h2>
        <p className="text-gray-500 text-sm mt-1">Review and approve pending driver registrations.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Pending Driver Verifications
          </h3>
          <button onClick={fetchPendingDrivers} disabled={loading} className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Driver</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingDrivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No pending drivers found.
                  </td>
                </tr>
              ) : (
                pendingDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{driver.user.fullName}</p>
                      <p className="text-xs text-gray-500 font-mono">ID: {driver.nationalIdNumber || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{driver.user.phoneNumber}</p>
                      {driver.user.email && <p className="text-xs text-gray-400">{driver.user.email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        {driver.verificationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {driver.vehicle ? (
                        <span className="text-gray-900">
                          {driver.vehicle.vehicleType} — {driver.vehicle.make} {driver.vehicle.model}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-black rounded hover:bg-gray-800 transition-colors"
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
    </div>
  );
};
