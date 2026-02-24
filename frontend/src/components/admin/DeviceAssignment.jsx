// frontend/src/components/admin/DeviceAssignment.jsx
// ══════════════════════════════════════════════════════════════════════════════
// DEVICE ASSIGNMENT - Enterprise-grade device management modal
// ══════════════════════════════════════════════════════════════════════════════
// Design System:
// - Tag-style device chips with smooth animations
// - Visual empty state with helpful guidance
// - Inline add with keyboard support
// - Clear visual feedback for unsaved changes
// ══════════════════════════════════════════════════════════════════════════════

import { AlertCircle, HardDrive, Plus, Router, Trash2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import Modal from '../common/Modal';

export default function DeviceAssignment({ user, onClose }) {
  const [devices, setDevices] = useState([...user.assignedDevices]);
  const [newDevice, setNewDevice] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddDevice = () => {
    const deviceId = newDevice.trim().toUpperCase();

    if (!deviceId) {
      toast.error('Veuillez entrer un identifiant d\'appareil');
      return;
    }

    if (devices.includes(deviceId)) {
      toast.error('Cet appareil est déjà assigné');
      inputRef.current?.select();
      return;
    }

    setDevices([...devices, deviceId]);
    setNewDevice('');
    inputRef.current?.focus();
  };

  const handleRemoveDevice = (deviceId) => {
    setDevices(devices.filter(d => d !== deviceId));
  };

  const handleClearAll = () => {
    if (devices.length === 0) return;
    setDevices([]);
    inputRef.current?.focus();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await userApi.assignDevices(user._id, devices);
      toast.success('Appareils mis à jour avec succès');
      onClose();
    } catch (error) {
      const message = error.response?.data?.error || 'Échec de la mise à jour';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDevice();
    }
    // Allow backspace to remove last device when input is empty
    if (e.key === 'Backspace' && !newDevice && devices.length > 0) {
      e.preventDefault();
      handleRemoveDevice(devices[devices.length - 1]);
    }
  };

  const hasChanges = JSON.stringify(devices) !== JSON.stringify(user.assignedDevices);
  const addedCount = devices.filter(d => !user.assignedDevices.includes(d)).length;
  const removedCount = user.assignedDevices.filter(d => !devices.includes(d)).length;

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="md" showCloseButton={false}>
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-300">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 
                        flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Router className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-base-content">Assigner des appareils</h2>
          <p className="text-sm text-base-content/50 truncate">
            Pour <span className="font-medium text-base-content/70">{user.username}</span>
          </p>
        </div>
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border-2 border-cyan-500/20
                        flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-cyan-600">
            {user.username[0].toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Device Input ─────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content flex items-center justify-between">
            <span>Ajouter un appareil</span>
            <span className="text-xs font-normal text-base-content/40">
              Entrée pour ajouter • Backspace pour supprimer
            </span>
          </label>

          <div className="device-input-container">
            {/* Existing devices as chips inside input area */}
            <div className="device-chips-wrapper">
              {devices.map((deviceId, index) => {
                const isNew = !user.assignedDevices.includes(deviceId);
                return (
                  <span
                    key={deviceId}
                    className={`device-chip ${isNew ? 'device-chip--new' : ''}`}
                  >
                    <HardDrive className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{deviceId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDevice(deviceId)}
                      className="device-chip-remove"
                      disabled={loading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {/* Input field */}
              <input
                ref={inputRef}
                type="text"
                placeholder={devices.length === 0 ? "ex: SENSOR-001, AA:BB:CC:DD:EE:FF" : "Ajouter..."}
                className="device-input"
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>

            {/* Add button */}
            <button
              type="button"
              onClick={handleAddDevice}
              disabled={loading || !newDevice.trim()}
              className="device-add-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Device Count & Clear ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-base-content/60">
              <span className="font-semibold text-base-content">{devices.length}</span> appareil{devices.length !== 1 ? 's' : ''} assigné{devices.length !== 1 ? 's' : ''}
            </span>
            {hasChanges && (
              <div className="flex items-center gap-2 text-xs">
                {addedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                    +{addedCount}
                  </span>
                )}
                {removedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-medium">
                    -{removedCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {devices.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={loading}
              className="text-xs text-red-500 hover:text-red-600 font-medium 
                         flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Tout supprimer
            </button>
          )}
        </div>

        {/* ── Empty State ──────────────────────────────────────────────────────── */}
        {devices.length === 0 && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-base-200 
                            flex items-center justify-center mb-4">
              <HardDrive className="w-8 h-8 text-base-content/20" />
            </div>
            <p className="text-sm font-medium text-base-content/60 mb-1">
              Aucun appareil assigné
            </p>
            <p className="text-xs text-base-content/40">
              Saisissez un identifiant ci-dessus pour commencer
            </p>
          </div>
        )}

        {/* ── Unsaved Changes Warning ──────────────────────────────────────────── */}
        {hasChanges && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg 
                          bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Vous avez des modifications non enregistrées
            </p>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-4 border-t border-base-300">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Enregistrement...
              </span>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
