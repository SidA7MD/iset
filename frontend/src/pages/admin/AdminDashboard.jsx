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
    return <LoadingSpinner message="Chargement du tableau de bord..." />;
  }

  const metricCards = [
    {
      icon: Users,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      label: 'Total Utilisateurs',
      value: stats.totalUsers,
      sub: `${stats.activeUsers} actifs`,
      subColor: 'text-emerald-400',
    },
    {
      icon: Monitor,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
      label: 'Total Appareils',
      value: stats.totalDevices,
      sub: `${stats.activeDevices} en ligne`,
      subColor: 'text-emerald-400',
    },
    {
      icon: Activity,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      label: 'Appareils actifs',
      value: stats.activeDevices,
      sub: 'Surveillance en temps réel',
      subColor: 'text-base-content/40',
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      label: 'État du système',
      value: null,
      display: 'OK',
      sub: 'Tous les systèmes normaux',
      subColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-base-content tracking-tight">Tableau de bord Admin</h1>
        <p className="text-sm text-base-content/40 mt-0.5">Vue d'ensemble et gestion du système</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="metric-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-base-content tracking-tight">
                {card.value !== null ? card.value : card.display}
              </div>
              <div className="section-label mt-2">{card.label}</div>
              <div className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* All Devices panel */}
      <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-base-content">Tous les appareils</h2>
            <p className="section-label mt-0.5">{devices.length} total</p>
          </div>
        </div>
        <div className="p-5">
          <UserDevicesList devices={devices} />
        </div>
      </div>
    </div>
  );
}
