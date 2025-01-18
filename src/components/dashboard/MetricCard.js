import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const MetricCard = ({ title, value, trend, trendValue, compareText, icon: Icon }) => {
  const hasDataToCompare = trendValue !== 0 && trendValue !== undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            <div className={`flex items-center ${hasDataToCompare ? (trend === 'up' ? 'text-green-600' : 'text-red-600') : 'text-amber-500'}`}>
              {hasDataToCompare ? (
                trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span className="ml-1 text-sm font-medium">
                {hasDataToCompare ? `${trendValue}%` : 'N/A'}
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-xs">{compareText}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;