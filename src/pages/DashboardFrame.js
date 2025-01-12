import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Menu, X, BarChart, Settings } from 'lucide-react';
import supabase from '../utils/supabase';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [venueName, setVenueName] = useState('');
  const [venueId, setVenueId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const fetchVenue = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .eq('email', user.email)
        .single();

      if (!error && data) {
        setVenueName(data.name);
        setVenueId(data.id);
      }
    }
  }, []);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        {Icon && <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
        {children}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 p-2 bg-white rounded-lg shadow-sm z-50"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm fixed h-screen transform transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } z-40`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-2">Manage your venue feedback</p>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Logged in as:</h3>
            <div className="venue-info bg-white p-3 rounded-lg shadow-sm">
              <strong className="text-base font-semibold text-gray-900 block">
                {venueName || 'Loading...'}
              </strong>
              <span className="text-xs text-gray-500 mt-1 block">ID: {venueId || '...'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Menu
          </div>
          <ul className="space-y-2">
            <li>
              <NavLink to="/dashboard" icon={LayoutDashboard}>
                Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/questions" icon={MessageSquare}>
                Manage Questions
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/scores" icon={BarChart}>
                Scores
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/feedbackfeed" icon={MessageSquare}>
                Feedback Feed
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white">
          <NavLink to="/dashboard/settings" icon={Settings}>
            Settings
          </NavLink>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full px-4 py-3 text-left text-red-600 font-medium hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center group mt-2"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 lg:ml-72 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>

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