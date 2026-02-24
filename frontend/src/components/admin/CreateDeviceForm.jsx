// frontend/src/components/admin/CreateDeviceForm.jsx
// ══════════════════════════════════════════════════════════════════════════════
// CREATE DEVICE FORM - Enterprise-grade device creation modal
// ══════════════════════════════════════════════════════════════════════════════

import { HardDrive, MapPin, Tag } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { deviceApi } from '../../api/deviceApi';
import Modal from '../common/Modal';

export default function CreateDeviceForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    MAC: '',
    deviceName: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.MAC.trim()) {
      newErrors.MAC = 'L\'identifiant est requis';
    } else if (formData.MAC.trim().length < 2) {
      newErrors.MAC = 'Minimum 2 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await deviceApi.createDevice({
        MAC: formData.MAC.trim(),
        deviceName: formData.deviceName.trim() || null,
        location: formData.location.trim() || null,
      });
      toast.success('Appareil créé avec succès');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Échec de la création';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="md" showCloseButton={false}>
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-300">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                        flex items-center justify-center shadow-lg shadow-teal-500/20">
          <HardDrive className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-base-content">Nouvel appareil</h2>
          <p className="text-sm text-base-content/50">Enregistrer un appareil dans le système</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── MAC/ID Field ─────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Identifiant de l'appareil <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
              <Tag className="w-[18px] h-[18px]" />
            </div>
            <input
              type="text"
              name="MAC"
              placeholder="ex: SENSOR-001, AA:BB:CC:DD:EE:FF"
              className={`form-input ${errors.MAC ? 'form-input--error' : ''}`}
              value={formData.MAC}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
          </div>
          <p className="text-xs text-base-content/40">
            Adresse MAC, numéro de série ou identifiant unique
          </p>
          {errors.MAC && (
            <p className="text-xs text-red-500">{errors.MAC}</p>
          )}
        </div>

        {/* ── Device Name Field ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Nom de l'appareil
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
              <HardDrive className="w-[18px] h-[18px]" />
            </div>
            <input
              type="text"
              name="deviceName"
              placeholder="ex: Capteur température salle A"
              className="form-input"
              value={formData.deviceName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <p className="text-xs text-base-content/40">
            Optionnel — nom descriptif pour identifier facilement l'appareil
          </p>
        </div>

        {/* ── Location Field ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Emplacement
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
              <MapPin className="w-[18px] h-[18px]" />
            </div>
            <input
              type="text"
              name="location"
              placeholder="ex: Bâtiment A, Étage 2"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <p className="text-xs text-base-content/40">
            Optionnel — emplacement physique de l'appareil
          </p>
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
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Création...
              </span>
            ) : (
              'Créer l\'appareil'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
