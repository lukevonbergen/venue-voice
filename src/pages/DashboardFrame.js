import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Menu, X, BarChart } from 'lucide-react';
import supabase from '../utils/supabase';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [venueName, setVenueName] = useState('');
  const [venueId, setVenueId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  useEffect(() => {
    const fetchVenue = async () => {
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
    };

    fetchVenue();
  }, []);

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
        onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile after clicking a link
      >
        {Icon && <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
        {children}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 p-2 bg-white rounded-lg shadow-sm z-50"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm fixed lg:relative h-screen lg:h-auto transform transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } z-40`}
      >
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-2">Manage your venue feedback</p>
        </div>

        {/* Venue Info Section */}
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

        {/* Navigation Section */}
        <nav className="flex-1 p-4">
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

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-red-600 font-medium hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center group"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default DashboardFrame;