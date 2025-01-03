import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardFrame = ({ children }) => {
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 px-4 py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">Manage your venue feedback</p>
        </div>
        <nav>
          <ul className="space-y-1">
            <li>
              <NavLink to="/dashboard">Overview</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/questions">Manage Questions</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/feedback">View Feedback</NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default DashboardFrame;