// frontend/src/components/admin/UserManagement.jsx
import { CheckCircle, Edit, Plus, Search, Trash2, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateUserForm from './CreateUserForm';
import DeviceAssignment from './DeviceAssignment';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeviceAssignment, setShowDeviceAssignment] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Échec du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    await fetchUsers();
    setShowCreateForm(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;

    try {
      await userApi.deleteUser(deleteConfirm._id);
      setUsers(users.filter(u => u._id !== deleteConfirm._id));
      toast.success('Utilisateur supprimé définitivement');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error?.response?.data?.message || 'Échec de la suppression de l\'utilisateur');
    }
  };

  const handleAssignDevices = (user) => {
    setSelectedUser(user);
    setShowDeviceAssignment(true);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Chargement des utilisateurs..." />;
  }

  // Metric cards data
  const metrics = [
    { label: 'Total', value: users.length, color: 'text-base-content' },
    { label: 'Actifs', value: users.filter(u => u.isActive).length, color: 'text-emerald-400' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-cyan-400' },
    { label: 'Standard', value: users.filter(u => u.role === 'user').length, color: 'text-sky-400' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-content tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-sm text-base-content/40 mt-0.5">Gérer les comptes et les assignations d'appareils</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary-custom"
        >
          <Plus className="h-4 w-4" />
          Créer un utilisateur
        </button>
      </div>

      {/* ── Metrics row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="metric-card py-4">
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="section-label mt-1">{m.label} Utilisateurs</div>
          </div>
        ))}
      </div>

      {/* ── Search + Table ─────────────────────────────────────── */}
      <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden">

        {/* Search bar */}
        <div className="px-5 py-4 border-b border-base-300">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-content/30" />
            <input
              type="text"
              placeholder="Rechercher des utilisateurs…"
              className="input-field pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── Desktop Table ─── */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-300">
                {['Utilisateur', 'Email', 'Rôle', 'Appareils', 'Statut', 'Actions'].map((col) => (
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
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-base-300/40 transition-colors duration-100">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/15 text-cyan-300
                                      flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-base-content">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-base-content/50">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium ${user.role === 'admin'
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'bg-base-300/80 text-base-content/50'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-base-content/40">
                      {user.assignedDevices?.length || 0} appareils
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.isActive ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-base-content/30">
                        <XCircle className="h-3.5 w-3.5" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAssignDevices(user)}
                        className="btn-ghost-custom px-2 py-1.5 text-xs"
                        title="Assigner des appareils"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="btn-danger-custom px-2 py-1.5 text-xs"
                        title="Supprimer l'utilisateur"
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Tablet Table ─── */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-300">
                {['Utilisateur', 'Rôle', 'Appareils', 'Statut', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-base-content/35 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-base-300/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-base-content">{user.username}</div>
                    <div className="text-xs text-base-content/40">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium ${user.role === 'admin' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-base-300/80 text-base-content/50'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-base-content/40">
                    {user.assignedDevices?.length || 0} appareils
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="h-3.5 w-3.5" />Actif</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-base-content/30"><XCircle className="h-3.5 w-3.5" />Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleAssignDevices(user)} className="btn-ghost-custom px-2 py-1.5 text-xs" title="Assign Devices">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(user)} className="btn-danger-custom px-2 py-1.5 text-xs" disabled={user.role === 'admin'}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ─── */}
        <div className="md:hidden divide-y divide-base-300">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-base-content/30">Aucun utilisateur trouvé</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-300
                                    flex items-center justify-center text-sm font-semibold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-content">{user.username}</p>
                      <p className="text-xs text-base-content/40">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium ${user.role === 'admin' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-base-300/80 text-base-content/50'
                    }`}>
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/40">{user.assignedDevices?.length || 0} appareils</span>
                  {user.isActive ? (
                    <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="h-3.5 w-3.5" />Actif</span>
                  ) : (
                    <span className="flex items-center gap-1 text-base-content/30"><XCircle className="h-3.5 w-3.5" />Inactif</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleAssignDevices(user)} className="btn-ghost-custom flex-1 justify-center text-xs py-1.5">
                    <Edit className="h-3.5 w-3.5" /> Assigner des appareils
                  </button>
                  <button onClick={() => setDeleteConfirm(user)} className="btn-danger-custom flex-1 justify-center text-xs py-1.5" disabled={user.role === 'admin'}>
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty states */}
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="hidden md:flex flex-col items-center py-12 text-center">
            <Search className="h-8 w-8 text-base-content/15 mb-3" />
            <p className="text-sm text-base-content/40">Aucun résultat pour "{searchTerm}"</p>
            <p className="text-xs text-base-content/25 mt-1">Essayez un autre terme de recherche</p>
          </div>
        )}

        {users.length === 0 && (
          <div className="hidden md:flex flex-col items-center py-12 text-center">
            <Users className="h-8 w-8 text-base-content/15 mb-3" />
            <p className="text-sm text-base-content/40">Aucun utilisateur</p>
            <p className="text-xs text-base-content/25 mt-1 mb-4">Créez votre premier utilisateur pour commencer</p>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary-custom text-xs">
              <Plus className="h-3.5 w-3.5" /> Créer le premier utilisateur
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showCreateForm && (
        <CreateUserForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateUser}
        />
      )}

      {showDeviceAssignment && selectedUser && (
        <DeviceAssignment
          user={selectedUser}
          onClose={() => {
            setShowDeviceAssignment(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteUser}
        title="Supprimer l'utilisateur définitivement"
        message={`Êtes-vous sûr de vouloir supprimer définitivement ${deleteConfirm?.username} ? Cela supprimera l'utilisateur et désassignera tous ses appareils. Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
      />
    </div>
  );
}
