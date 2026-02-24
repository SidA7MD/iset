// frontend/src/components/user/EvolutionChart.jsx
// Enhanced evolution chart with modern design, stats cards, and smooth animations
import { Activity, BarChart3, Droplets, Flame, TrendingDown, TrendingUp, Wind } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const MONTH_NAMES = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

const SENSOR_CONFIG = {
  temperature: {
    color: '#f97316',
    gradient: ['#fdba74', '#ea580c'],
    bgGradient: 'from-orange-500/20 to-orange-600/5',
    icon: Flame,
    label: 'Température',
    unit: '°C',
    minColor: '#3b82f6',
    maxColor: '#ef4444',
  },
  humidity: {
    color: '#0ea5e9',
    gradient: ['#7dd3fc', '#0284c7'],
    bgGradient: 'from-sky-500/20 to-sky-600/5',
    icon: Droplets,
    label: 'Humidité',
    unit: '%',
    minColor: '#06b6d4',
    maxColor: '#8b5cf6',
  },
  gas: {
    color: '#22c55e',
    gradient: ['#86efac', '#16a34a'],
    bgGradient: 'from-emerald-500/20 to-emerald-600/5',
    icon: Wind,
    label: 'Gaz',
    unit: 'ppm',
    minColor: '#10b981',
    maxColor: '#f59e0b',
  },
};

// Calculate stats from data
function calculateStats(data, avgKey, minKey, maxKey) {
  if (!data || data.length === 0) return null;
  
  const validData = data.filter(d => d[avgKey] != null);
  if (validData.length === 0) return null;
  
  const avgValues = validData.map(d => d[avgKey]);
  const minValues = validData.map(d => d[minKey]).filter(v => v != null);
  const maxValues = validData.map(d => d[maxKey]).filter(v => v != null);
  
  const currentAvg = avgValues[avgValues.length - 1];
  const previousAvg = avgValues.length > 1 ? avgValues[avgValues.length - 2] : currentAvg;
  const trend = currentAvg - previousAvg;
  
  return {
    current: currentAvg,
    avg: avgValues.reduce((a, b) => a + b, 0) / avgValues.length,
    min: minValues.length > 0 ? Math.min(...minValues) : 0,
    max: maxValues.length > 0 ? Math.max(...maxValues) : 0,
    trend,
    trendPercent: previousAvg !== 0 ? ((trend / previousAvg) * 100) : 0,
  };
}

function EvolutionAreaChart({ data, sensorType, avgKey, minKey, maxKey }) {
  const config = SENSOR_CONFIG[sensorType];
  const stats = calculateStats(data, avgKey, minKey, maxKey);
  const Icon = config.icon;
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-base-200 rounded-2xl border border-base-300 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-base-300/50 flex items-center justify-center mx-auto mb-3">
          <Icon className="h-6 w-6 text-base-content/30" />
        </div>
        <p className="text-base-content/40 text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  const gradientId = `gradient-${sensorType}`;
  const areaGradientId = `area-gradient-${sensorType}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100/95 backdrop-blur-sm border border-base-300 rounded-xl shadow-2xl px-4 py-3 min-w-[160px]">
          <p className="text-xs font-bold text-base-content mb-2 pb-2 border-b border-base-300">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] text-base-content/60">{entry.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: entry.color }}>
                  {entry.value?.toFixed(1)}{config.unit}
                </span>
              </div>
            ))}
          </div>
          {payload[0]?.payload?.count && (
            <p className="text-[10px] text-base-content/40 mt-2 pt-2 border-t border-base-300 text-center">
              {payload[0].payload.count} lectures
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex items-center justify-center gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-0.5 rounded" style={{ backgroundColor: config.maxColor, opacity: 0.8 }} />
        <span className="text-[10px] text-base-content/50">Max</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-1 rounded" style={{ backgroundColor: config.color }} />
        <span className="text-[10px] text-base-content/50">Moyenne</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-0.5 rounded" style={{ backgroundColor: config.minColor, opacity: 0.8 }} />
        <span className="text-[10px] text-base-content/50">Min</span>
      </div>
    </div>
  );

  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl border border-base-300/50 overflow-hidden
                    hover:border-base-300 transition-all duration-300 hover:shadow-lg`}>
      {/* Header with stats */}
      <div className="px-5 py-4 border-b border-base-300/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})` }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-base-content">{config.label}</h3>
              <p className="text-[11px] text-base-content/50">Évolution temporelle</p>
            </div>
          </div>
          
          {/* Trend indicator */}
          {stats && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              ${stats.trend >= 0 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-rose-500/10 text-rose-400'}`}>
              {stats.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(stats.trendPercent).toFixed(1)}%
            </div>
          )}
        </div>
        
        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Min</p>
              <p className="text-sm font-bold" style={{ color: config.minColor }}>
                {stats.min.toFixed(1)}{config.unit}
              </p>
            </div>
            <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Moyenne</p>
              <p className="text-sm font-bold" style={{ color: config.color }}>
                {stats.avg.toFixed(1)}{config.unit}
              </p>
            </div>
            <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Max</p>
              <p className="text-sm font-bold" style={{ color: config.maxColor }}>
                {stats.max.toFixed(1)}{config.unit}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-3 py-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.4} />
                <stop offset="50%" stopColor={config.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-base-300/50" 
              vertical={false} 
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              className="text-base-content/40"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              className="text-base-content/40"
              width={40}
              tickFormatter={(v) => `${v.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={maxKey}
              name="Max"
              stroke={config.maxColor}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill="transparent"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey={avgKey}
              name="Moyenne"
              stroke={config.color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: config.color, stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey={minKey}
              name="Min"
              stroke={config.minColor}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill="transparent"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <CustomLegend />
      </div>
    </div>
  );
}

function ReadingsCountChart({ data }) {
  if (!data || data.length === 0) return null;

  const totalReadings = data.reduce((sum, d) => sum + (d.count || 0), 0);
  const totalAlerts = data.reduce((sum, d) => sum + (d.alerts || 0), 0);
  const avgReadingsPerPeriod = totalReadings / data.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100/95 backdrop-blur-sm border border-base-300 rounded-xl shadow-2xl px-4 py-3">
          <p className="text-xs font-bold text-base-content mb-2 pb-2 border-b border-base-300">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-[11px] text-base-content/60">Lectures</span>
              </div>
              <span className="text-xs font-bold text-cyan-500">{payload[0]?.value?.toLocaleString()}</span>
            </div>
            {payload[1]?.value > 0 && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[11px] text-base-content/60">Alertes</span>
                </div>
                <span className="text-xs font-bold text-rose-500">{payload[1]?.value}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/15 to-purple-600/5 rounded-2xl border border-base-300/50 overflow-hidden
                    hover:border-base-300 transition-all duration-300 hover:shadow-lg">
      {/* Header with stats */}
      <div className="px-5 py-4 border-b border-base-300/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-base-content">Activité</h3>
              <p className="text-[11px] text-base-content/50">Lectures & alertes</p>
            </div>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
            <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Total</p>
            <p className="text-sm font-bold text-cyan-400">{totalReadings.toLocaleString()}</p>
          </div>
          <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
            <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Moyenne</p>
            <p className="text-sm font-bold text-indigo-400">{avgReadingsPerPeriod.toFixed(0)}</p>
          </div>
          <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
            <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Alertes</p>
            <p className={`text-sm font-bold ${totalAlerts > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {totalAlerts}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-3 py-4">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity={1} />
                <stop offset="100%" stopColor="#e11d48" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-base-300/50" 
              vertical={false} 
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              className="text-base-content/40"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              className="text-base-content/40"
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              name="Lectures"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="alerts"
              name="Alertes"
              fill="url(#alertGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-cyan-400 to-cyan-600" />
            <span className="text-[10px] text-base-content/50">Lectures</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-rose-400 to-rose-600" />
            <span className="text-[10px] text-base-content/50">Alertes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvolutionChart({ monthlyData, dailyData, viewMode = 'monthly' }) {
  // Format data based on view mode
  const formattedData = viewMode === 'monthly'
    ? (monthlyData || []).map((d) => ({
        label: MONTH_NAMES[(d._id?.month || 1) - 1],
        avgTemperature: d.avgTemperature,
        minTemperature: d.minTemperature,
        maxTemperature: d.maxTemperature,
        avgHumidity: d.avgHumidity,
        minHumidity: d.minHumidity,
        maxHumidity: d.maxHumidity,
        avgGas: d.avgGas,
        minGas: d.minGas,
        maxGas: d.maxGas,
        count: d.count,
        alerts: d.alerts || 0,
      }))
    : (dailyData || []).map((d) => ({
        label: `${d._id?.day || 1}/${d._id?.month || 1}`,
        avgTemperature: d.avgTemperature,
        minTemperature: d.minTemperature,
        maxTemperature: d.maxTemperature,
        avgHumidity: d.avgHumidity,
        minHumidity: d.minHumidity,
        maxHumidity: d.maxHumidity,
        avgGas: d.avgGas,
        minGas: d.minGas,
        maxGas: d.maxGas,
        count: d.count,
        alerts: d.alerts || 0,
      }));

  if (formattedData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-base-200 to-base-300/30 rounded-2xl border border-base-300 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-base-300/50 flex items-center justify-center mx-auto mb-4">
          <Activity className="h-8 w-8 text-base-content/20" />
        </div>
        <h3 className="text-base font-bold text-base-content mb-2">Aucune donnée d'évolution</h3>
        <p className="text-sm text-base-content/40 max-w-xs mx-auto">
          Les graphiques d'évolution apparaîtront ici une fois que des données seront collectées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sensor Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Temperature */}
        <EvolutionAreaChart
          data={formattedData}
          sensorType="temperature"
          avgKey="avgTemperature"
          minKey="minTemperature"
          maxKey="maxTemperature"
        />

        {/* Humidity */}
        <EvolutionAreaChart
          data={formattedData}
          sensorType="humidity"
          avgKey="avgHumidity"
          minKey="minHumidity"
          maxKey="maxHumidity"
        />

        {/* Gas */}
        <EvolutionAreaChart
          data={formattedData}
          sensorType="gas"
          avgKey="avgGas"
          minKey="minGas"
          maxKey="maxGas"
        />
      </div>

      {/* Activity Chart - Full Width */}
      <ReadingsCountChart data={formattedData} />
    </div>
  );
}
