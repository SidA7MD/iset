
// =====================================================

// frontend/src/pages/admin/AdminDashboard.jsx
import { Activity, AlertTriangle, Monitor, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deviceApi } from '../../api/deviceApi';
import { userApi } from '../../api/userApi';
import UserDevicesList from '../../components/admin/UserDevicesList';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
  });
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersResponse, devicesResponse] = await Promise.all([
        userApi.getAllUsers(),
        deviceApi.getAllDevices(),
      ]);

      const users = usersResponse.data.users;
      const devicesData = devicesResponse.data.devices;

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalDevices: devicesData.length,
        activeDevices: devicesData.filter(d => d.status === 'active').length,
      });

      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Users className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{stats.totalUsers}</div>
            <div className="stat-desc">{stats.activeUsers} active</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Monitor className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Devices</div>
            <div className="stat-value text-secondary">{stats.totalDevices}</div>
            <div className="stat-desc">{stats.activeDevices} online</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <Activity className="h-8 w-8" />
            </div>
            <div className="stat-title">Active Devices</div>
            <div className="stat-value text-success">{stats.activeDevices}</div>
            <div className="stat-desc">Real-time monitoring</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-warning">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="stat-title">System Status</div>
            <div className="stat-value text-sm">Operational</div>
            <div className="stat-desc">All systems normal</div>
          </div>
        </div>
      </div>

      {/* Recent Devices */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">All Devices ({devices.length})</h2>
          <UserDevicesList devices={devices} />
        </div>
      </div>
    </div>
  );
}
