// frontend/src/pages/admin/DevicesPage.jsx
// ══════════════════════════════════════════════════════════════════════════════
// DEVICE MANAGEMENT PAGE - Admin device creation and assignment
// ══════════════════════════════════════════════════════════════════════════════

import {
  HardDrive,
  Plus,
  Search,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { deviceApi } from '../../api/deviceApi';
import { userApi } from '../../api/userApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateDeviceForm from '../../components/admin/CreateDeviceForm';
import AssignDeviceModal from '../../components/admin/AssignDeviceModal';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assignDevice, setAssignDevice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devicesRes, usersRes] = await Promise.all([
        deviceApi.getAllDevices(),
        userApi.getAllUsers(),
      ]);
      setDevices(devicesRes.data.devices);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDevice = async () => {
    await fetchData();
    setShowCreateForm(false);
  };

  const handleDeleteDevice = async () => {
    if (!deleteConfirm) return;

    try {
      await deviceApi.deleteDevice(deleteConfirm.MAC);
      setDevices(devices.filter((d) => d.MAC !== deleteConfirm.MAC));
      toast.success('Appareil supprimé');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Échec de la suppression');
    }
  };

  const handleUnassignDevice = async (device) => {
    try {
      await deviceApi.unassignDevice(device.MAC);
      await fetchData();
      toast.success('Appareil désassigné');
    } catch (error) {
      console.error('Error unassigning device:', error);
      toast.error('Échec de la désassignation');
    }
  };

  const handleAssignComplete = async () => {
    await fetchData();
    setAssignDevice(null);
  };

  // Filter devices
  const filteredDevices = devices.filter((device) =>
    device.MAC.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.assignedTo?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Device status helper
  const isOnline = (device) => {
    if (!device.lastSeen) return false;
    const lastSeen = new Date(device.lastSeen);
    const now = new Date();
    const minutesSinceLastSeen = (now - lastSeen) / 1000 / 60;
    return minutesSinceLastSeen < 5;
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des appareils..." />;
  }

  // Metrics
  const metrics = [
    { label: 'Total', value: devices.length, color: 'text-base-content' },
    { label: 'En ligne', value: devices.filter(isOnline).length, color: 'text-emerald-500' },
    { label: 'Assignés', value: devices.filter((d) => d.assignedTo).length, color: 'text-cyan-500' },
    { label: 'Disponibles', value: devices.filter((d) => !d.assignedTo).length, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-content tracking-tight">
            Gestion des appareils
          </h1>
          <p className="text-sm text-base-content/40 mt-0.5">
            Créer et assigner des appareils aux utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary-custom"
        >
          <Plus className="h-4 w-4" />
          Nouvel appareil
        </button>
      </div>

      {/* ── Metrics ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="metric-card py-4">
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="section-label mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Devices Table ──────────────────────────────────────── */}
      <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden">
        {/* Search */}
        <div className="px-5 py-4 border-b border-base-300">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-content/30" />
            <input
              type="text"
              placeholder="Rechercher des appareils…"
              className="input-field pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-300">
                {['Appareil', 'Nom', 'Statut', 'Assigné à', 'Dernière activité', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-base-content/35 font-semibold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-base-content/40">
                    {searchTerm ? 'Aucun appareil trouvé' : 'Aucun appareil enregistré'}
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.MAC} className="hover:bg-base-300/40 transition-colors">
                    {/* MAC */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center">
                          <HardDrive className="w-4 h-4 text-base-content/50" />
                        </div>
                        <span className="font-mono text-xs font-medium">{device.MAC}</span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3.5 text-base-content/70">
                      {device.deviceName || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {isOnline(device) ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                          <Wifi className="w-3 h-3" />
                          En ligne
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-base-300 text-base-content/50">
                          <WifiOff className="w-3 h-3" />
                          Hors ligne
                        </span>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="px-5 py-3.5">
                      {device.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-cyan-600">
                              {device.assignedTo.username[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{device.assignedTo.username}</span>
                        </div>
                      ) : (
                        <span className="text-base-content/40 text-sm">Non assigné</span>
                      )}
                    </td>

                    {/* Last Seen */}
                    <td className="px-5 py-3.5 text-base-content/50 text-xs">
                      {device.lastSeen
                        ? new Date(device.lastSeen).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {device.assignedTo ? (
                          <button
                            onClick={() => handleUnassignDevice(device)}
                            className="p-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Désassigner"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setAssignDevice(device)}
                            className="p-2 rounded-lg text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                            title="Assigner à un utilisateur"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(device)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-base-300">
          {filteredDevices.length === 0 ? (
            <div className="px-5 py-12 text-center text-base-content/40">
              {searchTerm ? 'Aucun appareil trouvé' : 'Aucun appareil enregistré'}
            </div>
          ) : (
            filteredDevices.map((device) => (
              <div key={device.MAC} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-base-content/50" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium">{device.MAC}</p>
                      <p className="text-xs text-base-content/50">{device.deviceName || 'Sans nom'}</p>
                    </div>
                  </div>
                  {isOnline(device) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                      <Wifi className="w-3 h-3" />
                      En ligne
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-base-300 text-base-content/50">
                      <WifiOff className="w-3 h-3" />
                      Hors ligne
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-base-content/30" />
                    {device.assignedTo ? (
                      <span>{device.assignedTo.username}</span>
                    ) : (
                      <span className="text-base-content/40">Non assigné</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {device.assignedTo ? (
                      <button
                        onClick={() => handleUnassignDevice(device)}
                        className="p-2 rounded-lg text-amber-500 hover:bg-amber-500/10"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setAssignDevice(device)}
                        className="p-2 rounded-lg text-cyan-500 hover:bg-cyan-500/10"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(device)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showCreateForm && (
        <CreateDeviceForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateDevice}
        />
      )}

      {assignDevice && (
        <AssignDeviceModal
          device={assignDevice}
          users={users.filter((u) => u.role !== 'admin')}
          onClose={() => setAssignDevice(null)}
          onSuccess={handleAssignComplete}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Supprimer l'appareil"
          message={`Êtes-vous sûr de vouloir supprimer l'appareil ${deleteConfirm.MAC} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          confirmStyle="danger"
          onConfirm={handleDeleteDevice}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
