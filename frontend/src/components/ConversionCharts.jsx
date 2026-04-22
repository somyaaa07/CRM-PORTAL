import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-800 mb-2">📅 {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 capitalize">{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ConversionChart({ data }) {
  const [chartType, setChartType] = useState('area'); // area | bar

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-center text-gray-400 py-8">
          📊 Chart ke liye data nahi hai abhi
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">

      {/* Chart Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-800">
            📈 Conversion Trends
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Last 14 days  data
          </p>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {[
            { key: 'area', icon: '📈', label: 'Area' },
            { key: 'bar',  icon: '📊', label: 'Bar'  },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setChartType(t.key)}
              className={`text-xs px-3 py-1.5 rounded-md transition ${
                chartType === t.key
                  ? 'bg-white text-blue-600 font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        {chartType === 'area' ? (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />

            <Area
              type="monotone"
              dataKey="calls"
              name="Calls"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorCalls)"
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="answered"
              name="Answered"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#colorAnswered)"
              dot={{ fill: '#a855f7', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="converted"
              name="Converted"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorConverted)"
              dot={{ fill: '#22c55e', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />

            <Bar dataKey="calls"     name="Calls"     fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="answered"  name="Answered"  fill="#a855f7" radius={[4,4,0,0]} />
            <Bar dataKey="converted" name="Converted" fill="#22c55e" radius={[4,4,0,0]} />
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
        {[
          {
            label: 'Total Calls',
            value: data.reduce((s, d) => s + d.calls, 0),
            color: 'text-blue-600',
            bg:    'bg-blue-50',
          },
          {
            label: 'Answered',
            value: data.reduce((s, d) => s + d.answered, 0),
            color: 'text-purple-600',
            bg:    'bg-purple-50',
          },
          {
            label: 'Converted',
            value: data.reduce((s, d) => s + d.converted, 0),
            color: 'text-green-600',
            bg:    'bg-green-50',
          },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-lg p-3 text-center`}>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}