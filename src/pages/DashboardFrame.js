import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [venueName, setVenueName] = useState('');
  const [venueId, setVenueId] = useState('');

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
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your venue feedback</p>
        </div>

        {/* Venue Info Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Connected Venue:</p>
            <p className="text-base font-semibold text-gray-900">{venueName}</p>
            <p className="text-xs text-gray-500">Venue ID: {venueId}</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink to="/dashboard">Overview</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/questions">Manage Questions</NavLink>
            </li>
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default DashboardFrame;