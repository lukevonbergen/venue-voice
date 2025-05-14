import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, BarChart, Settings, ChevronDown } from 'lucide-react';
import supabase from '../utils/supabase';
import { useVenue } from '../context/VenueContext';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { venueName, venueId, loading } = useVenue();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isFeedbackDropdownOpen, setIsFeedbackDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-all duration-200 ${
          isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Nav */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Logo + Venue Info + Nav */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <img
                src="https://www.getchatters.com/img/Logo.svg"
                alt="Chatters Logo"
                className="h-8 w-auto"
              />
              <span className="text-sm text-gray-500">{venueName || 'Loading venue...'}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/dashboard/questions" icon={MessageSquare}>Questions</NavLink>
              <NavLink to="/dashboard/reports" icon={BarChart}>Reports</NavLink>
              <NavLink to="/dashboard/heatmap" icon={BarChart}>Heatmap</NavLink>
              <NavLink to="/dashboard/templates" icon={BarChart}>QR Templates</NavLink>
              <div className="relative">
                <button
                  onClick={() => setIsFeedbackDropdownOpen(!isFeedbackDropdownOpen)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded text-gray-600 hover:text-blue-600"
                >
                  <MessageSquare className="w-5 h-5" />
                  Feedback
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFeedbackDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFeedbackDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-white border rounded shadow z-50 w-48">
                    <NavLink to="/dashboard/feedbackfeed">Comments</NavLink>
                    <NavLink to="/dashboard/tablefeedback">Tables</NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Avatar + Logout */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">ID: {venueId || '...'}</div>
            <img
              src="https://ui-avatars.com/api/?name=Luke"
              alt="User"
              className="w-8 h-8 rounded-full border"
            />
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFrame;