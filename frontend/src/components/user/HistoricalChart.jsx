// =====================================================
// frontend/src/components/user/HistoricalChart.jsx
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTime } from '../../utils/helpers';

export default function HistoricalChart({ data, dataKey, label, color, unit, height = 140 }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-700 p-6 text-center">
        <div className="text-gray-400 dark:text-slate-500 text-xs">
          📊 No data available
        </div>
      </div>
    );
  }

  const chartData = data.map(reading => ({
    timestamp: new Date(reading.timestamp).getTime(),
    value: reading[dataKey],
    time: formatTime(reading.timestamp),
  })).reverse();

  // Calculate stats
  const values = chartData.map(d => d.value).filter(v => v !== null && v !== undefined);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const padding = (maxValue - minValue) * 0.1 || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg px-2 py-1.5">
          <p className="text-[10px] text-gray-600 dark:text-slate-400">
            {payload[0].payload.time}
          </p>
          <p className="text-xs font-bold" style={{ color }}>
            {payload[0].value.toFixed(1)}{unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-700 p-3 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-xs">{label}</h3>
        </div>
        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
          {chartData.length} pts
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-200 dark:text-slate-700"
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: 'currentColor' }}
            className="text-gray-500 dark:text-slate-500"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
            height={20}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'currentColor' }}
            className="text-gray-500 dark:text-slate-500"
            tickLine={false}
            axisLine={false}
            width={30}
            domain={[minValue - padding, maxValue + padding]}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{
              r: 3,
              strokeWidth: 1.5,
              stroke: color,
              fill: '#fff'
            }}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Compact Stats */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-[9px] text-gray-500 dark:text-slate-500 uppercase mb-0.5">Min</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            {minValue.toFixed(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-gray-500 dark:text-slate-500 uppercase mb-0.5">Avg</div>
          <div className="text-xs font-bold" style={{ color }}>
            {avgValue.toFixed(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-gray-500 dark:text-slate-500 uppercase mb-0.5">Max</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            {maxValue.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
