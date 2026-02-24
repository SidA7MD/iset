// frontend/src/pages/user/DeviceDetailsPage.jsx
// Restyled to match the iset production SaaS aesthetic.
// All business logic and routing is unchanged.

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Download,
  Droplets,
  MapPin,
  RefreshCw,
  Thermometer,
  Wind,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { sensorDataApi } from '../../api/sensorDataApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EvolutionChart from '../../components/user/EvolutionChart';
import HistoricalChart from '../../components/user/HistoricalChart';
import { useDeviceData } from '../../hooks/useDeviceData';
import { useWebSocket } from '../../hooks/useWebSocket';
import { downloadCSV, formatTimestamp, timeAgo } from '../../utils/helpers';

// ── Shared sub-components ──────────────────────────────────────
function Panel({ children, className = '' }) {
  return (
    <div className={`bg-base-200 border border-base-300 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function StatRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-base-300 last:border-0">
      <span className="text-sm text-base-content/50">{label}</span>
      <span className={`text-sm font-semibold ${accent || 'text-base-content'}`}>{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function DeviceDetailsPage() {
  const { MAC } = useParams();
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  // Archive & Evolution state
  const [archiveDate, setArchiveDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [archiveYear, setArchiveYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [evolutionView, setEvolutionView] = useState('monthly');
  const [archiveHistory, setArchiveHistory] = useState([]);
  const [archiveStats, setArchiveStats] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const { getDeviceData, setDeviceData } = useDeviceData();
  const { socket, isConnected } = useWebSocket();
  const liveData = getDeviceData(MAC);

  // Get the most recent data from history as fallback
  const latestHistoryData = history.length > 0 ? history[0] : null;
  
  // Use liveData if available, otherwise fall back to latest history data
  const displayData = liveData || latestHistoryData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#34d399';
      case 'warning': return '#fbbf24';
      case 'error': return '#f87171';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    fetchDeviceDetails();
    fetchHistoricalData(timeRange);
  }, [MAC]);

  // Subscribe to device updates when socket is connected
  useEffect(() => {
    if (isConnected && socket) {
      console.log(`📱 DeviceDetailsPage: Subscribing to device: ${MAC}`);
      socket.emit('device:subscribe', { MAC });
    }
  }, [socket, isConnected, MAC]);

  useEffect(() => {
    if (activeTab === 'evolution') fetchEvolutionData();
  }, [activeTab, archiveYear, evolutionView]);

  useEffect(() => {
    if (activeTab === 'archive') fetchArchiveData();
  }, [activeTab, archiveDate]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await deviceApi.getDeviceByMAC(MAC);
      setDevice(response.data.device);
    } catch (error) {
      console.error('Error fetching device:', error);
      toast.error('Échec du chargement des détails de l\'appareil');
    }
  };

  const fetchEvolutionData = async () => {
    try {
      setRefreshing(true);
      if (evolutionView === 'monthly') {
        const response = await sensorDataApi.getMonthlyAggregation(MAC, archiveYear);
        setMonthlyData(response.data.monthly || []);
      } else {
        const startDate = new Date(`${archiveYear}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${archiveYear}-12-31T23:59:59.999Z`);
        const response = await sensorDataApi.getDailyAggregation(MAC, startDate.toISOString(), endDate.toISOString());
        setDailyData(response.data.daily || []);
      }
    } catch (error) {
      console.error('Error fetching evolution data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchArchiveData = async () => {
    try {
      setArchiveLoading(true);
      const startDate = new Date(`${archiveDate}T00:00:00.000Z`);
      const endDate = new Date(`${archiveDate}T23:59:59.999Z`);
      const [historyResponse, statsResponse] = await Promise.all([
        sensorDataApi.getHistory(MAC, startDate.toISOString(), endDate.toISOString(), 500),
        sensorDataApi.getStatistics(MAC, startDate.toISOString(), endDate.toISOString()),
      ]);
      setArchiveHistory(historyResponse.data.readings || []);
      setArchiveStats(statsResponse.data.stats || null);
    } catch (error) {
      console.error('Error fetching archive data:', error);
      toast.error('Échec du chargement des données d\'archive');
    } finally {
      setArchiveLoading(false);
    }
  };

  const fetchHistoricalData = async (range) => {
    try {
      setRefreshing(true);
      const endDate = new Date();
      let startDate;
      switch (range) {
        case '1h': startDate = new Date(endDate.getTime() - 1 * 60 * 60 * 1000); break;
        case '6h': startDate = new Date(endDate.getTime() - 6 * 60 * 60 * 1000); break;
        case '7d': startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case '30d': startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        case '90d': startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); break;
        case '365d': startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); break;
        default: startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      }
      const dataLimit = ['90d', '365d'].includes(range) ? 500 : 100;
      const [historyResponse, statsResponse] = await Promise.all([
        sensorDataApi.getHistory(MAC, startDate.toISOString(), endDate.toISOString(), dataLimit),
        sensorDataApi.getStatistics(MAC, startDate.toISOString(), endDate.toISOString()),
      ]);
      const readings = historyResponse.data.readings || [];
      setHistory(readings);
      setStats(statsResponse.data.stats || null);
      
      // Initialize device data store with latest reading if we don't have live data yet
      if (readings.length > 0 && !liveData) {
        const latest = readings[0];
        setDeviceData(MAC, {
          temperature: latest.temperature,
          humidity: latest.humidity,
          gas: latest.gas,
          timestamp: latest.timestamp,
        });
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Échec du chargement des données historiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchHistoricalData(range);
  };

  const handleRefresh = () => {
    fetchHistoricalData(timeRange);
    toast.success('Données actualisées');
  };

  const handleExport = () => {
    if (history.length === 0) { toast.error('Aucune donnée à exporter'); return; }
    const exportData = history.map(r => ({
      MAC: r.MAC,
      Temperature: r.temp || r.temperature,
      Humidity: r.hmdt || r.humidity,
      Gas: r.gaz || r.gas,
      Timestamp: formatTimestamp(r.timestamp),
    }));
    downloadCSV(exportData, `${MAC}_data_${new Date().toISOString().split('T')[0]}`);
    toast.success('Données exportées avec succès');
  };

  const isOnline = () => {
    if (!displayData?.timestamp) return false;
    return Date.now() - new Date(displayData.timestamp).getTime() < 5 * 60 * 1000;
  };

  // ── Loading / not-found states ────────────────────────────────
  if (loading && !device) return <LoadingSpinner message="Chargement des détails de l'appareil..." />;

  if (!device) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4 opacity-30" aria-hidden="true">404</p>
          <h2 className="text-base font-semibold text-base-content">Appareil introuvable</h2>
          <p className="text-sm text-base-content/40 mt-1 mb-6">
            L'appareil <code className="font-mono text-cyan-400">{MAC}</code> n'a pas pu être localisé.
          </p>
          <Link to="/dashboard" className="btn-ghost-custom text-sm">
            <ArrowLeft className="h-4 w-4" /> Retour au Tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const online = isOnline();

  // Tab definitions
  const tabs = [
    { key: 'live', label: 'Données', icon: Activity },
    { key: 'archive', label: 'Archive', icon: Database },
    { key: 'evolution', label: 'Évolution', icon: BarChart3 },
  ];

  // Info card definitions
  const infoCards = [
    {
      icon: Activity,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      label: 'Statut',
      content: (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
          style={{
            backgroundColor: `${getStatusColor(device.status)}14`,
            color: getStatusColor(device.status),
            border: `1px solid ${getStatusColor(device.status)}30`,
          }}
        >
          {device.status}
        </span>
      ),
    },
    ...(device.location ? [{
      icon: MapPin,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
      label: 'Emplacement',
      content: <p className="text-sm font-semibold text-base-content mt-1 truncate">{device.location}</p>,
    }] : []),
    {
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      label: 'Dernière vue',
      content: <p className="text-sm font-semibold text-base-content mt-1">{displayData?.timestamp ? timeAgo(displayData.timestamp) : '—'}</p>,
    },
    {
      icon: Zap,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      label: 'Points de données',
      content: <p className="text-sm font-semibold text-base-content mt-1">{history.length}</p>,
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Page Header ────────────────────────────────────────── */}
      <Panel className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-base-300/60
                         text-base-content/60 hover:text-base-content hover:bg-base-300
                         transition-colors duration-150 flex-shrink-0"
              aria-label="Retour au Tableau de bord"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-base-content truncate">
                {device.deviceName || device.MAC}
              </h1>
              <p className="text-xs font-mono text-base-content/35 mt-0.5 truncate">{device.MAC}</p>
            </div>
          </div>

          {/* Right: status + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Online badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${online
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-base-300/60 text-base-content/30'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${online ? 'bg-emerald-400 animate-pulse' : 'bg-base-content/20'}`} />
              {online ? 'En ligne' : 'Hors ligne'}
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="btn-ghost-custom text-xs px-3 py-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </Panel>

      {/* ── Info Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <Panel key={card.label} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                </div>
                <span className="section-label">{card.label}</span>
              </div>
              {card.content}
            </Panel>
          );
        })}
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────── */}
      <Panel className="p-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium',
                'whitespace-nowrap transition-all duration-150',
                activeTab === key
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-base-content/50 hover:text-base-content hover:bg-base-300/60',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-ghost-custom text-xs px-3 py-1.5 flex-shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </Panel>

      {/* ══ Tab Content ══════════════════════════════════════════ */}

      {/* Live Data tab */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {/* Live sensor data cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Thermometer,
                iconColor: 'text-orange-400',
                bgGradient: 'from-orange-500/20 to-orange-600/5',
                label: 'Température',
                value: displayData?.temperature,
                unit: '°C',
                color: '#f97316',
              },
              {
                icon: Droplets,
                iconColor: 'text-sky-400',
                bgGradient: 'from-sky-500/20 to-sky-600/5',
                label: 'Humidité',
                value: displayData?.humidity,
                unit: '%',
                color: '#0ea5e9',
              },
              {
                icon: Wind,
                iconColor: 'text-emerald-400',
                bgGradient: 'from-emerald-500/20 to-emerald-600/5',
                label: 'Gaz',
                value: displayData?.gas,
                unit: 'ppm',
                color: '#22c55e',
              },
            ].map((sensor) => {
              const Icon = sensor.icon;
              const hasValue = sensor.value !== null && sensor.value !== undefined;
              return (
                <div 
                  key={sensor.label} 
                  className={`bg-gradient-to-br ${sensor.bgGradient} rounded-2xl border border-base-300/50 p-6
                             hover:border-base-300 transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: sensor.color }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-base-content">{sensor.label}</h3>
                      <p className="text-[11px] text-base-content/50">Dernière valeur</p>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: hasValue ? sensor.color : 'inherit' }}
                    >
                      {hasValue ? (sensor.unit === 'ppm' ? sensor.value.toFixed(0) : sensor.value.toFixed(1)) : '--'}
                    </span>
                    <span className="text-lg text-base-content/40">{sensor.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Last update info */}
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-base-content">Dernière mise à jour</h3>
                  <p className="text-xs text-base-content/50">
                    {displayData?.timestamp 
                      ? new Date(displayData.timestamp).toLocaleString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : 'En attente de données...'
                    }
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                online 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-base-300/50 text-base-content/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-base-content/30'}`} />
                {online ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
          </Panel>

          {/* Device info */}
          {device.location && (
            <Panel className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-base-content">Emplacement</h3>
                  <p className="text-xs text-base-content/50">{device.location}</p>
                </div>
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* Archive tab */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          {/* Date picker */}
          <Panel className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Database className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-semibold text-base-content">Archive de données</span>
                </div>
                <p className="section-label">Parcourez les lectures stockées jour par jour</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = new Date(archiveDate);
                    d.setDate(d.getDate() - 1);
                    setArchiveDate(d.toISOString().split('T')[0]);
                  }}
                  className="btn-ghost-custom p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <input
                  type="date"
                  value={archiveDate}
                  onChange={(e) => setArchiveDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field text-xs px-2 py-1.5"
                />

                <button
                  onClick={() => {
                    const d = new Date(archiveDate);
                    d.setDate(d.getDate() + 1);
                    const next = d.toISOString().split('T')[0];
                    const today = new Date().toISOString().split('T')[0];
                    if (next <= today) setArchiveDate(next);
                  }}
                  className="btn-ghost-custom p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setArchiveDate(new Date().toISOString().split('T')[0])}
                  className="btn-primary-custom text-xs px-3 py-1.5"
                >
                  Aujourd'hui
                </button>
              </div>
            </div>
          </Panel>

          {archiveLoading ? (
            <LoadingSpinner message={`Chargement des données pour ${archiveDate}…`} />
          ) : archiveHistory.length > 0 ? (
            <div className="space-y-4">
              {/* Day summary cards */}
              {archiveStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Lectures', value: archiveStats.count || 0, accent: 'text-cyan-400' },
                    { label: 'Temp. moy.', value: `${(archiveStats.avgTemperature || 0).toFixed(1)}°C`, accent: 'text-red-400' },
                    { label: 'Humid. moy.', value: `${(archiveStats.avgHumidity || 0).toFixed(1)}%`, accent: 'text-sky-400' },
                    { label: 'Gaz moy.', value: `${(archiveStats.avgGas || 0).toFixed(0)} ppm`, accent: 'text-amber-400' },
                  ].map(({ label, value, accent }) => (
                    <Panel key={label} className="p-4">
                      <div className="section-label mb-1">{label}</div>
                      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
                    </Panel>
                  ))}
                </div>
              )}

              {/* Archive charts */}
              {(() => {
                const dateLabel = new Date(archiveDate).toLocaleDateString('fr-FR', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                });
                return (
                  <div className="space-y-4">
                    <HistoricalChart data={archiveHistory} dataKey="temperature" label={`Température — ${dateLabel}`} color="#f97316" unit="°C" height={250} />
                    <HistoricalChart data={archiveHistory} dataKey="humidity" label={`Humidité — ${dateLabel}`} color="#0ea5e9" unit="%" height={250} />
                    <HistoricalChart data={archiveHistory} dataKey="gas" label={`Gaz — ${dateLabel}`} color="#22c55e" unit="ppm" height={250} />
                  </div>
                );
              })()}
            </div>
          ) : (
            <Panel className="py-16 text-center">
              <Database className="h-10 w-10 text-base-content/15 mx-auto mb-3" />
              <p className="text-sm text-base-content/40">Aucune donnée pour ce jour</p>
              <p className="text-xs text-base-content/25 mt-1">
                {new Date(archiveDate).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </Panel>
          )}
        </div>
      )}

      {/* Evolution tab */}
      {activeTab === 'evolution' && (
        <div className="space-y-4">
          <Panel className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-base-content">Évolution des données</span>
                </div>
                <p className="section-label">Tendances des capteurs dans le temps</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Year navigation */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setArchiveYear((y) => y - 1)}
                    className="btn-ghost-custom p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-base-content min-w-[52px] text-center">
                    {archiveYear}
                  </span>
                  <button
                    onClick={() => setArchiveYear((y) => Math.min(y + 1, new Date().getFullYear()))}
                    disabled={archiveYear >= new Date().getFullYear()}
                    className="btn-ghost-custom p-2 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* View mode pill toggle */}
                <div className="flex bg-base-300/50 rounded-lg p-1 gap-0.5">
                  {['monthly', 'daily'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setEvolutionView(v)}
                      className={[
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                        evolutionView === v
                          ? 'bg-base-200 text-base-content shadow-sm'
                          : 'text-base-content/40 hover:text-base-content/70',
                      ].join(' ')}
                    >
                      {v === 'monthly' ? 'Mensuel' : 'Journalier'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <EvolutionChart monthlyData={monthlyData} dailyData={dailyData} viewMode={evolutionView} />
        </div>
      )}

    </div>
  );
}
