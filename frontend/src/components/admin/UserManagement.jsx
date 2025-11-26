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
      toast.error('Failed to load users');
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
      toast.success('User deactivated successfully');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
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
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage user accounts and device assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary btn-sm sm:btn-md gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Total Users</div>
          <div className="stat-value text-lg sm:text-xl md:text-2xl">{users.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Active Users</div>
          <div className="stat-value text-success text-lg sm:text-xl md:text-2xl">
            {users.filter(u => u.isActive).length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Admin Users</div>
          <div className="stat-value text-info text-lg sm:text-xl md:text-2xl">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Regular Users</div>
          <div className="stat-value text-warning text-lg sm:text-xl md:text-2xl">
            {users.filter(u => u.role === 'user').length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-base-100 rounded-lg border border-base-300 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table/Cards */}
      <div className="bg-base-100 rounded-lg border border-base-300">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Devices</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="font-semibold">{user.username}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {user.assignedDevices?.length || 0} devices
                    </span>
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-error">
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssignDevices(user)}
                        className="btn btn-sm btn-outline btn-info"
                        title="Assign Devices"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="btn btn-sm btn-outline btn-error"
                        title="Delete User"
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet View */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Devices</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {user.assignedDevices?.length || 0} devices
                    </span>
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-error">
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAssignDevices(user)}
                        className="btn btn-sm btn-outline btn-info"
                        title="Assign Devices"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="btn btn-sm btn-outline btn-error"
                        title="Delete User"
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="bg-base-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                    {user.role}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="badge badge-outline">
                    {user.assignedDevices?.length || 0} devices
                  </span>
                  {user.isActive ? (
                    <span className="flex items-center gap-1 text-success text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-error text-sm">
                      <XCircle className="h-4 w-4" />
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAssignDevices(user)}
                    className="btn btn-sm btn-outline btn-info flex-1 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Assign Devices
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(user)}
                    className="btn btn-sm btn-outline btn-error flex-1 gap-2"
                    disabled={user.role === 'admin'}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-8 px-4">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No users found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search term</p>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-8 px-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No users yet</h3>
            <p className="text-gray-400 text-sm mb-4">Get started by creating your first user</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First User
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
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
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${deleteConfirm?.username}? This action can be reversed.`}
        confirmText="Deactivate"
      />
    </div>
  );
}
