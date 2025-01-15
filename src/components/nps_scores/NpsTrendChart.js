import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NpsTrendChart = ({ dailyNpsData }) => {
  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-bold">{label}</p>
          <p className="text-blue-600">NPS Score: {payload[0].value}</p>
          <p className="text-green-600">Promoters: {payload[1].value}</p>
          <p className="text-yellow-600">Passives: {payload[2].value}</p>
          <p className="text-red-600">Detractors: {payload[3].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* NPS Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">NPS History</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={dailyNpsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="day"
              stroke="#666"
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
            />
            <YAxis
              domain={[-100, 100]} // Set Y-axis range from -100 to +100
              stroke="#666"
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="linear" // Straight lines instead of curved
              dataKey="NPS Score"
              stroke="#3B82F6"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="linear"
              dataKey="Promoters"
              stroke="#10B981"
              strokeWidth={2}
            />
            <Line
              type="linear"
              dataKey="Passives"
              stroke="#FBBF24"
              strokeWidth={2}
            />
            <Line
              type="linear"
              dataKey="Detractors"
              stroke="#EF4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NpsTrendChart;