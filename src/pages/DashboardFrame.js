import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  BarChart,
  Settings,
  Map,
  QrCode,
  User,
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { venueName, venueId } = useVenue();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ first_name: '', last_name: '', email: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
  const fetchUserInfo = async () => {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      navigate('/signin');
      return;
    }

    const { data: venue, error } = await supabase
      .from('venues')
      .select('first_name, last_name, email, is_paid, trial_ends_at')
      .eq('email', email)
      .single();

    if (venue) {
      setUserInfo(venue);

      const trialExpired =
        !venue.is_paid && new Date() > new Date(venue.trial_ends_at);

      if (trialExpired && location.pathname !== '/settings/billing') {
        navigate('/settings/billing');
      }
    } else {
      navigate('/signin');
    }
  };

  fetchUserInfo();
}, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const NavLink = ({ to, children, icon: Icon }) => {
  const isExactMatch = location.pathname === to;
  const isNestedMatch = to !== '/' && location.pathname.startsWith(to);
  const isActive = isExactMatch || isNestedMatch;

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
      {!userInfo.is_paid && new Date() <= new Date(userInfo.trial_ends_at) && (
      <div className="bg-yellow-100 text-yellow-800 p-3 text-sm text-center">
        You're on a free trial. You have {Math.ceil((new Date(userInfo.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))} day(s) left. 
        <a href="/settings/billing" className="underline ml-1">Upgrade now</a>
      </div>
)}
      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img
              src="https://www.getchatters.com/img/Logo.svg"
              alt="Chatters Logo"
              className="h-7 w-auto"
            />
            <span className="text-sm text-gray-500">{venueName || 'Loading venue...'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">ID: {venueId || '...'}</div>
            <div className="relative" ref={dropdownRef}>
              <img
                src={`https://ui-avatars.com/api/?name=${userInfo.first_name || 'User'}`}
                alt="User"
                className="w-8 h-8 rounded-full border cursor-pointer"
                onClick={() => setDropdownOpen(prev => !prev)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 top-10 flex flex-col bg-white border shadow-lg rounded-md min-w-[180px] z-50">
                  <div className="px-4 py-3 text-sm text-gray-700 border-b">
                    <div className="font-medium">{userInfo.first_name} {userInfo.last_name}</div>
                    <div className="text-xs text-gray-500">{userInfo.email}</div>
                  </div>
                  <Link
                    to="/settings"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center">
          <NavLink to="/" icon={LayoutDashboard}>Overview</NavLink>
          <NavLink to="/questions" icon={MessageSquare}>Questions</NavLink>
          <NavLink to="/reports" icon={BarChart}>Reports</NavLink>
          <NavLink to="/heatmap" icon={Map}>Heatmap</NavLink>
          <NavLink to="/templates" icon={QrCode}>QR Templates</NavLink>
          <NavLink to="/staff" icon={User}>Staff</NavLink>
          <NavLink to="/settings" icon={Settings}>Settings</NavLink>
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
