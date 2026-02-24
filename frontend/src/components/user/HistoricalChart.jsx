// frontend/src/components/user/HistoricalChart.jsx
// Enhanced chart component with area charts showing evolution
import { Droplets, Flame, TrendingDown, TrendingUp, Wind } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTime } from '../../utils/helpers';

const SENSOR_ICONS = {
  temperature: Flame,
  humidity: Droplets,
  gas: Wind,
};

const SENSOR_GRADIENTS = {
  temperature: 'from-orange-500/20 to-orange-600/5',
  humidity: 'from-sky-500/20 to-sky-600/5',
  gas: 'from-emerald-500/20 to-emerald-600/5',
};

export default function HistoricalChart({ data, dataKey, label, color, unit, height = 200, showArea = true }) {
  // Determine sensor type from dataKey
  const sensorType = dataKey?.toLowerCase() || 'temperature';
  const Icon = SENSOR_ICONS[sensorType] || Flame;
  const bgGradient = SENSOR_GRADIENTS[sensorType] || SENSOR_GRADIENTS.temperature;

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl border border-base-300/50 p-8 text-center`}>
        <div className="w-12 h-12 rounded-xl bg-base-300/50 flex items-center justify-center mx-auto mb-3">
          <Icon className="h-6 w-6 text-base-content/30" />
        </div>
        <p className="text-base-content/40 text-sm">
          Aucune donnée disponible pour {label}
        </p>
      </div>
    );
  }

  const chartData = data
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).getTime(),
      value: reading[dataKey],
      time: formatTime(reading.timestamp),
      fullDate: new Date(reading.timestamp).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))
    .reverse();

  // Calculate stats with proper validation
  const values = chartData.map((d) => d.value).filter((v) => v !== null && v !== undefined && !isNaN(v));
  
  // Handle empty values array
  const hasValidData = values.length > 0;
  const minValue = hasValidData ? Math.min(...values) : 0;
  const maxValue = hasValidData ? Math.max(...values) : 0;
  const avgValue = hasValidData ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const latestValue = hasValidData ? values[values.length - 1] : null;
  const prevValue = values.length > 1 ? values[values.length - 2] : latestValue;
  const trend = latestValue !== null && prevValue !== null ? latestValue - prevValue : 0;
  const trendPercent = prevValue && prevValue !== 0 ? (trend / prevValue) * 100 : 0;
  const padding = hasValidData ? (maxValue - minValue) * 0.15 || 2 : 5;

  // Gradient ID unique per chart
  const gradientId = `gradient-${dataKey}-${color.replace('#', '')}`;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      if (value === null || value === undefined || isNaN(value)) return null;
      
      return (
        <div className="bg-base-100/95 backdrop-blur-sm border border-base-300 rounded-xl shadow-2xl px-4 py-3">
          <p className="text-[10px] text-base-content/50 mb-1.5">
            {payload[0].payload.fullDate}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold" style={{ color }}>
              {value.toFixed(1)}
            </span>
            <span className="text-xs text-base-content/50">{unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl border border-base-300/50 overflow-hidden
                    hover:border-base-300 transition-all duration-300 hover:shadow-lg`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-base-300/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: color }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-base-content">{label}</h3>
              <p className="text-[11px] text-base-content/50">{chartData.length} lectures</p>
            </div>
          </div>
          
          {/* Trend indicator */}
          {hasValidData && trend !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              ${trend > 0 
                ? 'bg-rose-500/10 text-rose-400' 
                : 'bg-emerald-500/10 text-emerald-400'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}{unit}
            </div>
          )}
        </div>

        {/* Current Value Display */}
        {hasValidData && (
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold" style={{ color }}>
              {latestValue?.toFixed(1) ?? '--'}
            </span>
            <span className="text-sm text-base-content/40 mb-1">{unit}</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-3 py-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="50%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-base-300/50"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              className="text-base-content/40"
              interval="preserveStartEnd"
              minTickGap={50}
              height={24}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              className="text-base-content/40"
              width={40}
              domain={hasValidData ? [minValue - padding, maxValue + padding] : ['auto', 'auto']}
              tickFormatter={(value) => isNaN(value) ? '--' : value.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            {showArea && (
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: '#fff',
                  fill: color,
                  className: 'drop-shadow-lg',
                }}
                animationDuration={600}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      {hasValidData && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Min</p>
              <p className="text-sm font-bold text-cyan-400">
                {minValue.toFixed(1)}{unit}
              </p>
            </div>
            <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Moyenne</p>
              <p className="text-sm font-bold" style={{ color }}>
                {avgValue.toFixed(1)}{unit}
              </p>
            </div>
            <div className="bg-base-200/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-base-content/40 uppercase tracking-wide">Max</p>
              <p className="text-sm font-bold text-rose-400">
                {maxValue.toFixed(1)}{unit}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
