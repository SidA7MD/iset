// frontend/src/pages/user/DeviceDetailsPage.jsx
// Enhanced device details page with dark/light mode support

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Droplets,
  MapPin,
  Menu,
  RefreshCw,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wind,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { sensorDataApi } from '../../api/sensorDataApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HistoricalChart from '../../components/user/HistoricalChart';
import SensorGauge from '../../components/user/SensorGauge';
import { useDeviceData } from '../../contexts/DeviceDataContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { downloadCSV, formatTimestamp, timeAgo } from '../../utils/helpers';

export default function DeviceDetailsPage() {
  const { MAC } = useParams();
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { getDeviceData } = useDeviceData();
  const { socket, isConnected } = useWebSocket();
  const liveData = getDeviceData(MAC);

  // Color scheme functions matching SensorVisualization
  const getSectorColor = (value, type) => {
    if (type === "gas") {
      if (value < 22) return "#10b981"; // green
      if (value < 25) return "#f59e0b"; // amber
      return "#ef4444"; // red
    }
    if (type === "humidity") {
      if (value >= 35 && value <= 55) return "#3b82f6"; // blue
      return "#6366f1"; // indigo
    }
    if (type === "temperature") {
      if (value < 65) return "#f97316"; // orange
      if (value < 70) return "#fb923c";
      return "#dc2626"; // red
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    fetchDeviceDetails();
    fetchHistoricalData(timeRange);
  }, [MAC]);

  // Subscribe to device when socket is ready
  useEffect(() => {
    if (socket?.isConnected()) {
      socket.subscribeToDevice(MAC);
      console.log(`🔔 Subscribed to device: ${MAC}`);
    }
  }, [socket, MAC]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await deviceApi.getDeviceByMAC(MAC);
      setDevice(response.data.device);
    } catch (error) {
      console.error('Error fetching device:', error);
      toast.error('Failed to load device details');
    }
  };

  const fetchHistoricalData = async (range) => {
    try {
      setRefreshing(true);
      const endDate = new Date();
      let startDate;

      switch (range) {
        case '1h':
          startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          startDate = new Date(endDate.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      }

      const [historyResponse, statsResponse] = await Promise.all([
        sensorDataApi.getHistory(MAC, startDate.toISOString(), endDate.toISOString(), 100),
        sensorDataApi.getStatistics(MAC, startDate.toISOString(), endDate.toISOString()),
      ]);

      setHistory(historyResponse.data.readings || []);
      setStats(statsResponse.data.stats || null);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to load historical data');
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
    toast.success('Data refreshed');
  };

  const handleExport = () => {
    if (history.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = history.map(reading => ({
      MAC: reading.MAC,
      Temperature: reading.temp || reading.temperature,
      Humidity: reading.hmdt || reading.humidity,
      Gas: reading.gaz || reading.gas,
      Timestamp: formatTimestamp(reading.timestamp),
    }));

    downloadCSV(exportData, `${MAC}_data_${new Date().toISOString().split('T')[0]}`);
    toast.success('Data exported successfully');
  };

  const isOnline = () => {
    if (!liveData?.timestamp) return false;
    const age = Date.now() - new Date(liveData.timestamp).getTime();
    return age < 5 * 60 * 1000;
  };

  if (loading && !device) {
    return <LoadingSpinner message="Loading device details..." />;
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-700 p-6 sm:p-12 text-center shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 max-w-md w-full mx-4">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 text-gray-400 dark:text-slate-400">🔍</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-200 mb-3 sm:mb-4">Device Not Found</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">The device {MAC} could not be found.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-200 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 dark:border-slate-600 transition-all duration-200 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 text-gray-900 dark:text-slate-200 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <Link
              to="/dashboard"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-300 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all duration-200 hover:scale-105 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white truncate">
                {device.deviceName || device.MAC}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 font-mono text-sm sm:text-lg truncate">{device.MAC}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden bg-gray-200 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-300 rounded-lg p-2 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Connection Status */}
            <div
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-2 border backdrop-blur-sm flex-shrink-0 ${isOnline()
                ? 'bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-300'
                : 'bg-gray-200 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400'
                }`}
            >
              <div
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isOnline()
                  ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                  : 'bg-slate-500'
                  }`}
              ></div>
              <span className="font-semibold text-xs sm:text-sm">
                {isOnline() ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Export Button - Hidden on mobile in menu */}
            <button
              onClick={handleExport}
              className="hidden sm:flex bg-gray-200 hover:bg-gray-300 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl items-center gap-2 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex flex-col gap-2">
            <button
              onClick={handleExport}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        )}
      </div>

      {/* Device Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="bg-blue-500/20 rounded-lg p-1.5 sm:p-2 border border-blue-500/30 flex-shrink-0">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-400" />
            </div>
            <span className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">Status</span>
          </div>
          <span
            className="inline-flex px-2 py-1 rounded-full text-xs sm:text-sm font-semibold border truncate"
            style={{
              backgroundColor: `${getStatusColor(device.status)}20`,
              borderColor: `${getStatusColor(device.status)}30`,
              color: getStatusColor(device.status)
            }}
          >
            {device.status}
          </span>
        </div>

        {device.location && (
          <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="bg-purple-500/20 rounded-lg p-1.5 sm:p-2 border border-purple-500/30 flex-shrink-0">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-400" />
              </div>
              <span className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">Location</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{device.location}</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="bg-amber-500/20 rounded-lg p-1.5 sm:p-2 border border-amber-500/30 flex-shrink-0">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-400" />
            </div>
            <span className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">Last Seen</span>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {liveData?.timestamp ? timeAgo(liveData.timestamp) : 'N/A'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="bg-green-500/20 rounded-lg p-1.5 sm:p-2 border border-green-500/30 flex-shrink-0">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-400" />
            </div>
            <span className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">Data Points</span>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{history.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {['overview', 'charts', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 capitalize whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm flex-shrink-0"
          disabled={refreshing}
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Real-time Gauges */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Real-time Readings</h2>
            {liveData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <SensorGauge
                  icon={<Thermometer className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Temperature"
                  value={liveData.temp || liveData.temperature}
                  unit="°C"
                  type="temp"
                  max={50}
                />
                <SensorGauge
                  icon={<Droplets className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Humidity"
                  value={liveData.hmdt || liveData.humidity}
                  unit="%"
                  type="hmdt"
                  max={100}
                />
                <SensorGauge
                  icon={<Wind className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Gas Level"
                  value={liveData.gaz || liveData.gas}
                  unit="ppm"
                  type="gaz"
                  max={1000}
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 md:p-12 text-center shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
                <div className="loading loading-spinner loading-lg text-blue-400 mb-3 sm:mb-4"></div>
                <p className="text-gray-900 dark:text-slate-300 font-medium text-sm sm:text-base">Waiting for real-time data...</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-500 mt-1 sm:mt-2">Send data to {MAC}</p>
              </div>
            )}
          </div>

          {/* Mini Charts */}
          {history.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Temperature</span>
                    </div>
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {(liveData?.temp || liveData?.temperature || 0).toFixed(1)}°C
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                    Last {timeRange}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Humidity</span>
                    </div>
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {(liveData?.hmdt || liveData?.humidity || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                    Last {timeRange}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Gas Level</span>
                    </div>
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {(liveData?.gaz || liveData?.gas || 0).toFixed(0)} ppm
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                    Last {timeRange}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Time Range</h3>
              <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                {['1h', '6h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-slate-600/50'
                      }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Charts */}
          {history.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              <HistoricalChart
                data={history}
                dataKey="temp"
                label="Temperature"
                color="#ef4444"
                unit="°C"
              />
              <HistoricalChart
                data={history}
                dataKey="hmdt"
                label="Humidity"
                color="#3b82f6"
                unit="%"
              />
              <HistoricalChart
                data={history}
                dataKey="gaz"
                label="Gas Level"
                color="#f59e0b"
                unit="ppm"
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 md:p-12 text-center shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-900 dark:text-slate-300 font-medium text-sm sm:text-base">No historical data available</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-500 mt-1 sm:mt-2">Data will appear here once available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="space-y-4 sm:space-y-6">
          {stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Temperature Stats */}
                <div
                  className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    borderColor: 'rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div
                      className="rounded-lg p-2 sm:p-3"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Temperature</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-slate-300 font-medium text-sm sm:text-base">Average</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">
                        {(stats.avgTemperature || stats.avgTemp || 0).toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Minimum</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {(stats.minTemperature || stats.minTemp || 0).toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Maximum</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {(stats.maxTemperature || stats.maxTemp || 0).toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* Humidity Stats */}
                <div
                  className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    borderColor: 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div
                      className="rounded-lg p-2 sm:p-3"
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                    >
                      <Droplets className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Humidity</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-slate-300 font-medium text-sm sm:text-base">Average</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                        {(stats.avgHumidity || stats.avgHmdt || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Minimum</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {(stats.minHumidity || stats.minHmdt || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Maximum</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {(stats.maxHumidity || stats.maxHmdt || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gas Stats */}
                <div
                  className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    borderColor: 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div
                      className="rounded-lg p-2 sm:p-3"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
                    >
                      <Wind className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Gas Level</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-slate-300 font-medium text-sm sm:text-base">Average</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-amber-400">
                        {(stats.avgGas || stats.avgGaz || 0).toFixed(0)} ppm
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Minimum</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {(stats.minGas || stats.minGaz || 0).toFixed(0)} ppm
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Maximum</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {(stats.maxGas || stats.maxGaz || 0).toFixed(0)} ppm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Summary */}
              <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Data Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Total Readings</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.count || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Time Period</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{timeRange.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Device Status</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">
                      {isOnline() ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Last Updated</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">
                      {liveData?.timestamp ? timeAgo(liveData.timestamp) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 md:p-12 text-center shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
              <Activity className="h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-900 dark:text-slate-300 font-medium text-sm sm:text-base">No statistics available</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-500 mt-1 sm:mt-2">Statistics will appear once data is collected</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
