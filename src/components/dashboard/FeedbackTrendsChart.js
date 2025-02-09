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
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: 'Feedback Trends Over Time',
        font: {
          size: 18,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
        color: '#1F2937', // Gray-800
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1F2937', // Gray-800
        titleColor: '#F9FAFB', // Gray-50
        bodyColor: '#F9FAFB', // Gray-50
        bodyFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: false, // Hide the color box in tooltip
        callbacks: {
          title: (context) => {
            const date = context[0].label;
            return `Date: ${date}`;
          },
          label: (context) => {
            const value = context.raw;
            return `Average Rating: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        },
        ticks: {
          color: '#6B7280', // Gray-500
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        min: 0,
        max: 5,
        grid: {
          color: '#E5E7EB', // Gray-200
        },
        ticks: {
          color: '#6B7280', // Gray-500
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
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