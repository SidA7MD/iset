// frontend/src/components/admin/DeviceAssignment.jsx
import { Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import Modal from '../common/Modal';

export default function DeviceAssignment({ user, onClose }) {
  const [devices, setDevices] = useState([...user.assignedDevices]);
  const [newDevice, setNewDevice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDevice = () => {
    const mac = newDevice.trim().toUpperCase();

    if (!mac) {
      toast.error('Please enter a device name/address');
      return;
    }

    // REMOVED: MAC address validation - accept any non-empty string

    if (devices.includes(mac)) {
      toast.error('Device already assigned to this user');
      return;
    }

    setDevices([...devices, mac]);
    setNewDevice('');
  };

  const handleRemoveDevice = (mac) => {
    setDevices(devices.filter(d => d !== mac));
  };

  const handleClearAll = () => {
    if (devices.length === 0) return;
    setDevices([]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await userApi.assignDevices(user._id, devices);
      toast.success('Devices assigned successfully');
      onClose();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to assign devices';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDevice();
    }
  };

  const hasChanges = JSON.stringify(devices) !== JSON.stringify(user.assignedDevices);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Assign Devices - ${user.username}`}
      size="md"
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Add Device Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Add Device Name/ID</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter any device name (e.g., DEV001, MyDevice, AA:BB:CC:DD:EE:GG)"
              className="input input-bordered flex-1"
              value={newDevice}
              onChange={(e) => setNewDevice(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              onClick={handleAddDevice}
              className="btn btn-primary sm:btn-md gap-2 flex-shrink-0"
              type="button"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Enter any device name/ID and press Enter or click Add
            </span>
          </label>
        </div>

        {/* Assigned Devices List */}
        <div className="border-t border-base-300 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-base">
              Assigned Devices ({devices.length})
            </h4>
            {devices.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn btn-sm btn-ghost text-error gap-1"
                disabled={loading}
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto bg-base-100 rounded-lg border border-base-300 p-2">
            {devices.length === 0 ? (
              <div className="text-center text-gray-500 py-6 px-4">
                <div className="text-sm">No devices assigned yet</div>
                <div className="text-xs mt-1">Add devices using the input above</div>
              </div>
            ) : (
              devices.map((mac) => (
                <div
                  key={mac}
                  className="flex justify-between items-center p-3 bg-base-200 rounded-lg group hover:bg-base-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
                    <span className="font-mono text-sm truncate" title={mac}>
                      {mac}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(mac)}
                    className="btn btn-sm btn-ghost btn-circle opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    disabled={loading}
                    title="Remove device"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-info text-sm">
              <div className="w-2 h-2 bg-info rounded-full"></div>
              <span>You have unsaved changes</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-action flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-base-300">
          <button
            onClick={onClose}
            className="btn btn-outline flex-1 sm:flex-none order-2 sm:order-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`btn btn-primary flex-1 sm:flex-none order-1 sm:order-2 ${loading ? 'loading' : ''
              } ${!hasChanges ? 'btn-disabled' : ''}`}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
