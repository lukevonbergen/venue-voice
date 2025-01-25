import React, { useEffect, useState } from 'react';
import { Clock, Users, Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import supabase from '../../utils/supabase';

const MetricsSection = ({ venueId }) => {
  const [feedback, setFeedback] = useState([]);

  // Fetch feedback data from Supabase
  useEffect(() => {
    if (!venueId) return;

    const fetchFeedback = async () => {
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

    // Subscribe to real-time updates
    const feedbackSubscription = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback', filter: `venue_id=eq.${venueId}` },
        (payload) => {
          setFeedback((prevFeedback) => {
            const newFeedback = [...prevFeedback];
            const index = newFeedback.findIndex((f) => f.id === payload.new.id);

            if (payload.eventType === 'INSERT') {
              newFeedback.push(payload.new);
            } else if (payload.eventType === 'UPDATE') {
              if (index !== -1) {
                newFeedback[index] = payload.new;
              }
            } else if (payload.eventType === 'DELETE') {
              if (index !== -1) {
                newFeedback.splice(index, 1);
              }
            }

            return newFeedback;
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      feedbackSubscription.unsubscribe();
    };
  }, [venueId]);

  // Rest of the component code remains the same...
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

  // Render a single metric card
  const renderMetricCard = (title, value, trend, trendValue, compareText, Icon) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {renderMetricCard(
        "Last 30 Minutes",
        last30MinutesMetrics.currentCount,
        last30MinutesMetrics.trend,
        last30MinutesMetrics.trendValue,
        "Compared to previous 30 mins",
        Clock
      )}
      {renderMetricCard(
        "Last Hour",
        lastHourMetrics.currentCount,
        lastHourMetrics.trend,
        lastHourMetrics.trendValue,
        "Compared to previous hour",
        Users
      )}
      {renderMetricCard(
        "Today",
        todayMetrics.currentCount,
        todayMetrics.trend,
        todayMetrics.trendValue,
        "Compared to yesterday",
        Calendar
      )}
      {renderMetricCard(
        "Last 7 Days",
        last7DaysMetrics.currentCount,
        last7DaysMetrics.trend,
        last7DaysMetrics.trendValue,
        "Compared to previous week",
        TrendingUp
      )}
    </div>
  );
};

export default MetricsSection;