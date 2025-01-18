import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const MetricCard = ({ title, feedback, startTime, endTime, previousStartTime, previousEndTime, icon: Icon }) => {
  // Calculate feedback count for the given time range
  const calculateFeedbackCount = (feedback, startTime, endTime) => {
    return feedback.filter((f) => {
      const feedbackTime = new Date(f.timestamp); // Convert to Date object
      return feedbackTime >= new Date(startTime) && feedbackTime < new Date(endTime);
    }).length;
  };

  // Calculate percentage change between two feedback counts
  const calculatePercentageChange = (currentCount, previousCount) => {
    if (previousCount === 0) return 0;
    return (((currentCount - previousCount) / previousCount) * 100).toFixed(1);
  };

  // Calculate current and previous feedback counts
  const currentCount = calculateFeedbackCount(feedback, startTime, endTime);
  const previousCount = calculateFeedbackCount(feedback, previousStartTime, previousEndTime);
  const trendValue = calculatePercentageChange(currentCount, previousCount);
  const trend = trendValue >= 0 ? 'up' : 'down';

  // Determine if there is data to compare
  const hasDataToCompare = previousCount !== 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{currentCount}</h2>
            <div className={`flex items-center ${hasDataToCompare ? (trend === 'up' ? 'text-green-600' : 'text-red-600') : 'text-amber-500'}`}>
              {hasDataToCompare ? (
                trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span className="ml-1 text-sm font-medium">
                {hasDataToCompare ? `${Math.abs(trendValue)}%` : 'N/A'}
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            {hasDataToCompare ? `Compared to previous period` : 'No data to compare'}
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;