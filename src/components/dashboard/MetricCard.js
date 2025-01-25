import React, { useEffect, useState } from 'react';
import { Clock, Users, Calendar, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import supabase from '../utils/supabase'; // Import Supabase client

const MetricsCards = ({ venueId }) => {
  const [feedback, setFeedback] = useState([]);

  // Fetch feedback data from Supabase
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!venueId) return;

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('venue_id', venueId);

      if (error) {
        console.error('Error fetching feedback:', error);
      } else {
        setFeedback(data);
      }
    };

    fetchFeedback();
  }, [venueId]);

  // Filter feedback by time range
  const filterFeedbackByTime = (startTime, endTime) => {
    return feedback.filter((f) => {
      const feedbackTime = new Date(f.timestamp).getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      return feedbackTime >= start && feedbackTime <= end;
    });
  };

  // Calculate feedback metrics for a given time range
  const calculateFeedbackMetrics = (startTime, endTime, previousStartTime, previousEndTime) => {
    const currentFeedback = filterFeedbackByTime(startTime, endTime);
    const previousFeedback = filterFeedbackByTime(previousStartTime, previousEndTime);

    const currentCount = currentFeedback.length;
    const previousCount = previousFeedback.length;

    const calculatePercentageChange = (currentCount, previousCount) => {
      if (previousCount === 0) return 0;
      return (((currentCount - previousCount) / previousCount) * 100).toFixed(1);
    };

    const trendValue = calculatePercentageChange(currentCount, previousCount);
    const trend = trendValue >= 0 ? 'up' : 'down';

    return {
      currentCount,
      trendValue: Math.abs(trendValue),
      trend,
      hasDataToCompare: previousCount !== 0,
    };
  };

  const now = new Date();

  // Calculate metrics for each timeframe
  const last30MinutesMetrics = calculateFeedbackMetrics(
    new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    now.toISOString(),
    new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 30 * 60 * 1000).toISOString()
  );

  const lastHourMetrics = calculateFeedbackMetrics(
    new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    now.toISOString(),
    new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  );

  const todayMetrics = calculateFeedbackMetrics(
    new Date(now.setHours(0, 0, 0, 0)).toISOString(), // Start of today
    now.toISOString(),
    new Date(new Date(now).setDate(now.getDate() - 1)).toISOString(), // Start of yesterday
    new Date(now.setHours(0, 0, 0, 0)).toISOString() // End of yesterday
  );

  const last7DaysMetrics = calculateFeedbackMetrics(
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    now.toISOString(),
    new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <MetricCard
        title="Last 30 Minutes"
        value={last30MinutesMetrics.currentCount}
        trend={last30MinutesMetrics.trend}
        trendValue={last30MinutesMetrics.trendValue}
        compareText="Compared to previous 30 mins"
        icon={Clock}
      />
      <MetricCard
        title="Last Hour"
        value={lastHourMetrics.currentCount}
        trend={lastHourMetrics.trend}
        trendValue={lastHourMetrics.trendValue}
        compareText="Compared to previous hour"
        icon={Users}
      />
      <MetricCard
        title="Today"
        value={todayMetrics.currentCount}
        trend={todayMetrics.trend}
        trendValue={todayMetrics.trendValue}
        compareText="Compared to yesterday"
        icon={Calendar}
      />
      <MetricCard
        title="Last 7 Days"
        value={last7DaysMetrics.currentCount}
        trend={last7DaysMetrics.trend}
        trendValue={last7DaysMetrics.trendValue}
        compareText="Compared to previous week"
        icon={TrendingUp}
      />
    </div>
  );
};

export default MetricsCards;