// frontend/src/components/admin/AssignDeviceModal.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ASSIGN DEVICE MODAL - Select user to assign device to
// ══════════════════════════════════════════════════════════════════════════════

import { Check, HardDrive, Search, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { deviceApi } from '../../api/deviceApi';
import Modal from '../common/Modal';

export default function AssignDeviceModal({ device, users, onClose, onSuccess }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setLoading(true);
      await deviceApi.assignDevice(device.MAC, selectedUser._id);
      toast.success(`Appareil assigné à ${selectedUser.username}`);
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Échec de l\'assignation';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="md" showCloseButton={false}>
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-300">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 
                        flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-base-content">Assigner l'appareil</h2>
          <div className="flex items-center gap-2 mt-1">
            <HardDrive className="w-3.5 h-3.5 text-base-content/40" />
            <span className="text-sm text-base-content/50 font-mono truncate">{device.MAC}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── Search ───────────────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {/* ── User List ────────────────────────────────────────────────────────── */}
        <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1">
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-base-content/40">
              {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={`user-select-card ${isSelected ? 'user-select-card--selected' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`user-select-avatar ${isSelected ? 'user-select-avatar--selected' : ''}`}>
                    {user.username[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-cyan-600' : 'text-base-content'}`}>
                      {user.username}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">{user.email}</p>
                  </div>

                  {/* Device count */}
                  <div className="text-xs text-base-content/40 flex-shrink-0">
                    {user.assignedDevices?.length || 0} appareil{(user.assignedDevices?.length || 0) !== 1 ? 's' : ''}
                  </div>

                  {/* Check */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

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
            onClick={handleAssign}
            disabled={loading || !selectedUser}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Assignation...
              </span>
            ) : (
              'Assigner'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
