import React from 'react';

// Matches the shape returned by GET /admin/drivers/pending
interface PendingDriverProfile {
  id: string;          // This IS the driverProfileId — used for verify API
  userId: string;
  user: { fullName: string; phoneNumber: string; email: string | null };
  nationalIdNumber: string | null;
  licenseNumber: string | null;
  verificationStatus: string;
  nationalIdFrontUrl?: string | null;
  nationalIdBackUrl?: string | null;
  licenseUrl?: string | null;
  profilePhotoUrl?: string | null;
  vehicle: {
    vehicleType: string;
    make: string;
    model: string;
    year?: number;
    plateNumber?: string;
    isRefrigerated?: boolean;
    vehiclePhotoUrl?: string | null;
    registrationUrl?: string | null;
    insuranceUrl?: string | null;
  } | null;
  rejectionReason?: string | null;
}

interface DriverDossierModalProps {
  driver: PendingDriverProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (driverProfileId: string, decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reason?: string) => void;
}

export const DriverDossierModal: React.FC<DriverDossierModalProps> = ({ driver, isOpen, onClose, onAction }) => {
  const [reason, setReason] = React.useState('');

  // Guard: driver.id is the driverProfileId from the backend DTO
  if (!isOpen || !driver) return null;

  const vehicle = driver.vehicle;
  
  // Construct absolute URL helper - handles Cloudinary full URLs and legacy local paths
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
  const getFullUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Cloudinary or any absolute URL
    return `${API_BASE}${path}`;             // Legacy /uploads/ local path
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">Driver Dossier</h3>
            <p className="text-sm text-neutral-500">Review documents and approve/reject driver</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors text-2xl font-light">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Identity Section */}
          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-100 pb-2">Identity Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              <div>
                <p className="text-neutral-500">Full Name</p>
                <p className="font-semibold text-neutral-900">{driver.user.fullName}</p>
              </div>
              <div>
                <p className="text-neutral-500">Phone Number</p>
                <p className="font-semibold text-neutral-900">{driver.user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-neutral-500">National ID</p>
                <p className="font-semibold text-neutral-900">{driver.nationalIdNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">License Number</p>
                <p className="font-semibold text-neutral-900">{driver.licenseNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">Profile Photo</p>
                {driver.profilePhotoUrl ? (
                  <img src={getFullUrl(driver.profilePhotoUrl)} alt="Profile" className="w-full h-48 object-cover rounded-lg border border-neutral-200" />
                ) : <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">Not uploaded</div>}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">National ID (Front)</p>
                {driver.nationalIdFrontUrl ? (
                  <img src={getFullUrl(driver.nationalIdFrontUrl)} alt="ID Front" className="w-full h-48 object-cover rounded-lg border border-neutral-200" />
                ) : <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">Not uploaded</div>}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">License Document</p>
                {driver.licenseUrl ? (
                  <img src={getFullUrl(driver.licenseUrl)} alt="License" className="w-full h-48 object-cover rounded-lg border border-neutral-200" />
                ) : <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">Not uploaded</div>}
              </div>
            </div>
          </section>

          {/* Vehicle Section */}
          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-100 pb-2">Vehicle Details</h4>
            {!vehicle ? (
              <p className="text-sm text-neutral-500 italic">No vehicle registered yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-neutral-500">Vehicle Type</p>
                    <p className="font-semibold text-neutral-900">{vehicle.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Make & Model</p>
                    <p className="font-semibold text-neutral-900">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Plate Number</p>
                    <p className="font-semibold text-neutral-900">{vehicle.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Refrigerated</p>
                    <p className="font-semibold text-neutral-900">{vehicle.isRefrigerated ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Vehicle Photo</p>
                    {vehicle.vehiclePhotoUrl ? (
                      <img src={getFullUrl(vehicle.vehiclePhotoUrl)} alt="Vehicle" className="w-full h-48 object-cover rounded-lg border border-neutral-200" />
                    ) : <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">Not uploaded</div>}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Registration (Istimara)</p>
                    {vehicle.registrationUrl ? (
                      <img src={getFullUrl(vehicle.registrationUrl)} alt="Registration" className="w-full h-48 object-cover rounded-lg border border-neutral-200" />
                    ) : <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">Not uploaded</div>}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Insurance</p>
                    {vehicle.insuranceUrl ? (
                      <img src={getFullUrl(vehicle.insuranceUrl)} alt="Insurance" className="w-full h-48 object-cover rounded-lg border border-neutral-200" />
                    ) : <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">Not uploaded</div>}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Action Notes */}
          <section>
             <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2 border-b border-neutral-100 pb-2">Decision Notes</h4>
             <textarea 
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               placeholder="Optional reason for rejection or suspension..."
               className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-black outline-none resize-none"
               rows={3}
             />
          </section>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-100 p-6 bg-neutral-50 rounded-b-2xl flex items-center justify-between">
          <button onClick={() => {
            if (!reason) { alert('Reason required for rejection'); return; }
            onAction(driver.id, 'REJECTED', reason);
          }} className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            Reject Application
          </button>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onAction(driver.id, 'APPROVED')} className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-neutral-800 transition-colors shadow-sm">
              Approve Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
