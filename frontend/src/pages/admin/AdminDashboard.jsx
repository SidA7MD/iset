// frontend/src/pages/admin/AdminDashboard.jsx
// ══════════════════════════════════════════════════════════════════════════════
// Admin Dashboard — polished overview with live metrics, health ring,
// recent activity feed, user summary, quick actions, and device grid.
// ══════════════════════════════════════════════════════════════════════════════

import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HardDrive,
  MapPin,
  Monitor,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { userApi } from '../../api/userApi';
import UserDevicesList from '../../components/admin/UserDevicesList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers';

const REFRESH_INTERVAL = 30;

// ── Tiny health ring (pure CSS) ─────────────────────────────────────────────
function HealthRing({ percent, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color =
    percent >= 80 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="flex-shrink-0 -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-base-300"
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const timerRef = useRef(null);

  const isOnline = useCallback((device) => {
    if (!device.lastSeen) return false;
    return Date.now() - new Date(device.lastSeen).getTime() < 5 * 60 * 1000;
  }, []);

  // ── Data fetching ──────────────────────────────────────────
  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const [usersRes, devicesRes] = await Promise.all([
        userApi.getAllUsers(),
        deviceApi.getAllDevices(),
      ]);
      setUsers(usersRes.data.users);
      setDevices(devicesRes.data.devices);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(REFRESH_INTERVAL);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { fetchDashboardData(true); return REFRESH_INTERVAL; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fetchDashboardData]);

  // ── Computed stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const online = devices.filter(isOnline);
    const offline = devices.filter((d) => !isOnline(d));
    const assigned = devices.filter((d) => d.assignedTo);
    const unassigned = devices.filter((d) => !d.assignedTo);
    const active = users.filter((u) => u.isActive);
    const admins = users.filter((u) => u.role === 'admin');
    const regular = users.filter((u) => u.role !== 'admin');

    const recentDevices = [...devices]
      .filter((d) => d.lastSeen)
      .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
      .slice(0, 6);

    const usersRanked = regular
      .map((u) => ({
        ...u,
        deviceCount: devices.filter(
          (d) => d.assignedTo && (d.assignedTo._id === u._id || d.assignedTo === u._id)
        ).length,
      }))
      .sort((a, b) => b.deviceCount - a.deviceCount)
      .slice(0, 5);

    const healthPct = devices.length > 0
      ? Math.round((online.length / devices.length) * 100)
      : 100;

    return {
      online, offline, assigned, unassigned,
      active, admins, regular, recentDevices, usersRanked,
      healthPct,
      onlinePct: devices.length > 0 ? (online.length / devices.length) * 100 : 0,
      assignedPct: devices.length > 0 ? (assigned.length / devices.length) * 100 : 0,
    };
  }, [devices, users, isOnline]);

  if (loading) return <LoadingSpinner message="Chargement du tableau de bord..." />;

  // Current time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">

      {/* ═══ HEADER ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-base-content tracking-tight">
            {greeting}, {user?.username || 'Admin'}
          </h1>
          <p className="text-sm text-base-content/40 mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-medium text-base-content/25 tabular-nums">
            MAJ dans {countdown}s
          </span>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="btn-ghost-custom text-xs gap-1.5 px-3 py-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ═══ TOP ROW: 3 METRIC CARDS + HEALTH RING ════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <Link to="/admin/users" className="block group">
          <div className="metric-card hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-base-content/15 group-hover:text-cyan-500 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-base-content tracking-tight">{users.length}</div>
            <div className="section-label mt-1.5">Utilisateurs</div>
            <div className="text-xs mt-1 text-base-content/40">
              <span className="text-emerald-400 font-medium">{stats.active.length} actifs</span> · {stats.admins.length} admin
            </div>
          </div>
        </Link>

        {/* Devices */}
        <Link to="/admin/devices" className="block group">
          <div className="metric-card hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-sky-400" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-base-content/15 group-hover:text-cyan-500 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-base-content tracking-tight">{devices.length}</div>
            <div className="section-label mt-1.5">Appareils</div>
            <div className="text-xs mt-1 text-base-content/40">
              <span className="text-emerald-400 font-medium">{stats.online.length} en ligne</span> · {stats.unassigned.length} disponible{stats.unassigned.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Link>

        {/* Online */}
        <div className="metric-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Wifi className="h-4 w-4 text-emerald-400" />
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500/50" />
          </div>
          <div className="text-3xl font-bold text-base-content tracking-tight">
            {stats.online.length}
            <span className="text-base font-medium text-base-content/25 ml-1">/ {devices.length}</span>
          </div>
          <div className="section-label mt-1.5">En ligne</div>
          {/* Mini bar */}
          <div className="mt-2 h-1.5 rounded-full bg-base-300 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${stats.onlinePct}%` }}
            />
          </div>
        </div>

        {/* System Health Ring */}
        <div className="metric-card flex flex-col items-center justify-center text-center relative">
          <div className="relative">
            <HealthRing percent={stats.healthPct} size={88} stroke={7} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-base-content">{stats.healthPct}%</span>
              <span className="text-[9px] text-base-content/35 uppercase tracking-wide font-medium">Santé</span>
            </div>
          </div>
          <div className="section-label mt-2">État du système</div>
          <div className={`text-xs mt-0.5 font-medium ${
            stats.healthPct >= 80 ? 'text-emerald-400' : stats.healthPct >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {stats.healthPct >= 80 ? 'Tous les systèmes normaux' : stats.healthPct >= 50 ? 'Service dégradé' : 'Attention requise'}
          </div>
        </div>
      </div>

      {/* ═══ QUICK ACTIONS ═════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Plus,     label: 'Nouvel appareil', path: '/admin/devices', color: 'text-cyan-500', bg: 'bg-cyan-500/10', hoverBg: 'hover:bg-cyan-500/15' },
          { icon: UserPlus, label: 'Nouvel utilisateur', path: '/admin/users', color: 'text-violet-500', bg: 'bg-violet-500/10', hoverBg: 'hover:bg-violet-500/15' },
          { icon: Settings, label: 'Gérer appareils', path: '/admin/devices', color: 'text-sky-500', bg: 'bg-sky-500/10', hoverBg: 'hover:bg-sky-500/15' },
          { icon: Shield,   label: 'Gérer utilisateurs', path: '/admin/users', color: 'text-emerald-500', bg: 'bg-emerald-500/10', hoverBg: 'hover:bg-emerald-500/15' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border border-base-300 bg-base-200 ${action.hoverBg} hover:border-base-content/10 transition-all duration-150 group`}
            >
              <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="text-xs font-medium text-base-content/60 group-hover:text-base-content transition-colors">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ═══ DISTRIBUTION BAR ══════════════════════════════════════════════════ */}
      {devices.length > 0 && (
        <div className="bg-base-200 border border-base-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-base-content">Répartition du parc</h2>
            <span className="section-label">{devices.length} appareil{devices.length > 1 ? 's' : ''}</span>
          </div>

          {/* Segmented bar */}
          <div className="flex h-3 rounded-full overflow-hidden bg-base-300 mb-4 gap-px">
            {stats.onlinePct > 0 && (
              <div className="bg-emerald-500 rounded-l-full transition-all duration-700" style={{ width: `${stats.onlinePct}%` }} title={`En ligne: ${stats.online.length}`} />
            )}
            {(100 - stats.onlinePct) > 0 && (
              <div className="bg-base-content/15 rounded-r-full transition-all duration-700" style={{ width: `${100 - stats.onlinePct}%` }} title={`Hors ligne: ${stats.offline.length}`} />
            )}
          </div>

          {/* Legend grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { dot: 'bg-emerald-500', label: 'En ligne', value: stats.online.length },
              { dot: 'bg-base-content/20', label: 'Hors ligne', value: stats.offline.length },
              { dot: 'bg-cyan-500', label: 'Assignés', value: stats.assigned.length },
              { dot: 'bg-amber-500', label: 'Disponibles', value: stats.unassigned.length },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${item.dot} flex-shrink-0`} />
                <span className="text-base-content/50">{item.label}</span>
                <span className="font-semibold text-base-content ml-auto tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TWO-COLUMN: ACTIVITY + USERS ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Recent Activity ──────────────────────────────────── */}
        <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-base-content">Activité récente</h2>
                <p className="text-[10px] text-base-content/35 mt-0.5">Dernières communications</p>
              </div>
            </div>
            <Link to="/admin/devices" className="text-[11px] text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium">
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1">
            {stats.recentDevices.length > 0 ? (
              <div className="divide-y divide-base-300">
                {stats.recentDevices.map((device, idx) => {
                  const online = isOnline(device);
                  return (
                    <button
                      key={device.MAC}
                      onClick={() => navigate(`/admin/devices/${device.MAC}`)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-base-300/30 transition-colors text-left group"
                    >
                      {/* Index + device icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-base-300/60 flex items-center justify-center">
                          <HardDrive className="w-4 h-4 text-base-content/40" />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-base-200 ${online ? 'bg-emerald-500' : 'bg-base-content/25'}`} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-base-content truncate group-hover:text-cyan-500 transition-colors">
                          {device.deviceName || device.MAC}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {device.location && (
                            <span className="text-[10px] text-base-content/30 flex items-center gap-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5" /> {device.location}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-base-content/20 truncate">{device.MAC}</span>
                        </div>
                      </div>

                      {/* Status + time */}
                      <div className="text-right flex-shrink-0 space-y-0.5">
                        {online ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En ligne
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-base-content/30">
                            <WifiOff className="w-3 h-3" /> Hors ligne
                          </span>
                        )}
                        <p className="text-[10px] text-base-content/25">{timeAgo(device.lastSeen)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-base-content/30">
                <Clock className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Users Overview ───────────────────────────────────── */}
        <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-base-content">Utilisateurs</h2>
                <p className="text-[10px] text-base-content/35 mt-0.5">{stats.regular.length} utilisateur{stats.regular.length > 1 ? 's' : ''} · {stats.admins.length} admin</p>
              </div>
            </div>
            <Link to="/admin/users" className="text-[11px] text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium">
              Gérer <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1">
            {stats.usersRanked.length > 0 ? (
              <div className="divide-y divide-base-300">
                {stats.usersRanked.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-xs font-semibold text-white">
                        {u.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-base-content truncate">{u.username}</p>
                        {u.isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium flex-shrink-0">Inactif</span>
                        )}
                      </div>
                      <p className="text-[11px] text-base-content/35 truncate">{u.email}</p>
                    </div>

                    {/* Device count chip */}
                    <div className="flex items-center gap-1.5 text-xs bg-base-300/50 px-2.5 py-1 rounded-lg flex-shrink-0">
                      <HardDrive className="w-3 h-3 text-base-content/35" />
                      <span className="font-semibold text-base-content/70 tabular-nums">{u.deviceCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-base-content/30">
                <Users className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">Aucun utilisateur</p>
              </div>
            )}
          </div>

          {/* Summary footer */}
          <div className="px-5 py-2.5 border-t border-base-300 bg-base-300/15 flex items-center justify-between text-[11px] text-base-content/35">
            <span>{stats.active.length} actif{stats.active.length > 1 ? 's' : ''} sur {users.length}</span>
            <span>{devices.length > 0 ? Math.round(stats.assignedPct) : 0}% appareils assignés</span>
          </div>
        </div>
      </div>

      {/* ═══ ALL DEVICES GRID ══════════════════════════════════════════════════ */}
      <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Monitor className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">Tous les appareils</h2>
              <p className="text-[10px] text-base-content/35 mt-0.5">{devices.length} enregistré{devices.length > 1 ? 's' : ''} · {stats.online.length} en ligne</p>
            </div>
          </div>
          <Link to="/admin/devices" className="btn-primary-custom text-xs py-1.5 px-3.5 gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Gérer
          </Link>
        </div>
        <div className="p-4 sm:p-5">
          <UserDevicesList devices={devices} />
        </div>
      </div>
    </div>
  );
}
