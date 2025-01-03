import React from 'react';
import { Link } from 'react-router-dom';

const DashboardFrame = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="block text-gray-700 hover:text-blue-500">
                Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard/questions" className="block text-gray-700 hover:text-blue-500">
                Manage Questions
              </Link>
            </li>
            <li>
              <Link to="/dashboard/feedback" className="block text-gray-700 hover:text-blue-500">
                View Feedback
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardFrame;