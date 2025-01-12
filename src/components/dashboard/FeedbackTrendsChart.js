import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FeedbackTrendsChart = ({ feedback }) => {
  // Group feedback by day and calculate average rating
  const feedbackByDay = feedback.reduce((acc, f) => {
    const date = new Date(f.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { totalRating: 0, count: 0 };
    }
    acc[date].totalRating += f.rating;
    acc[date].count += 1;
    return acc;
  }, {});

  const labels = Object.keys(feedbackByDay).sort();
  const data = labels.map((date) => (feedbackByDay[date].totalRating / feedbackByDay[date].count).toFixed(2));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average Rating',
        data,
        borderColor: 'rgba(99, 102, 241, 1)', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Feedback Trends Over Time',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FeedbackTrendsChart;