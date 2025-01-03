import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

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
      <div className="w-64 bg-white border-r border-gray-200 px-4 py-6 flex flex-col">
        <div className="px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">Manage your venue feedback</p>
        </div>
        <nav className="flex-1">
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
        <div className="pt-6 px-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default DashboardFrame;