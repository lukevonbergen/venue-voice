import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, QrCode, BarChart, Gauge, Paintbrush, ClipboardList, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null); // Timeout for hover delay
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleFeaturesDropdown = () => {
    setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout to prevent premature closing
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsFeaturesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout to close the dropdown after 300ms
    const timeout = setTimeout(() => {
      setIsFeaturesDropdownOpen(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const features = [
    { name: 'QR Codes', icon: <QrCode className="h-5 w-5 text-blue-500" />, path: '/features/qr-codes' },
    { name: 'NPS Score', icon: <BarChart className="h-5 w-5 text-green-500" />, path: '/features/nps-score' },
    { name: 'Real-time stats', icon: <Gauge className="h-5 w-5 text-purple-500" />, path: '/features/real-time-stats' },
    { name: 'Custom Branding', icon: <Paintbrush className="h-5 w-5 text-yellow-500" />, path: '/features/custom-branding' },
    { name: 'Custom Questions', icon: <ClipboardList className="h-5 w-5 text-red-500" />, path: '/features/custom-questions' },
    { name: 'Dashboards', icon: <LayoutDashboard className="h-5 w-5 text-indigo-500" />, path: '/features/dashboards' },
  ];

  return (
    <nav className="fixed w-full top-4 z-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200/50">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/">
                  <img
                    src="/img/getchatters_logo.svg"
                    alt="Chatter Logo"
                    className="h-8"
                  />
                </Link>
              </div>

              {/* Desktop Navigation Links (Hidden on Mobile) */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/pricing"
                  className={`text-gray-600 hover:text-gray-900 ${
                    isActive('/pricing') ? 'font-semibold' : ''
                  }`}
                >
                  Pricing
                </Link>
                <div
                  className="relative group"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`text-gray-600 hover:text-gray-900 ${
                      isActive('/features') ? 'font-semibold' : ''
                    }`}
                  >
                    Features
                  </button>
                  {isFeaturesDropdownOpen && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[500px] bg-white rounded-lg shadow-lg border border-gray-200"
                      onMouseEnter={handleMouseEnter} // Keep dropdown open when hovering over it
                      onMouseLeave={handleMouseLeave} // Close dropdown when leaving it
                    >
                      <div className="p-6 grid grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                          <Link
                            key={index}
                            to={feature.path}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {feature.icon}
                            <span className="text-gray-700 whitespace-nowrap">{feature.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="#"
                  className={`text-gray-600 hover:text-gray-900 ${
                    isActive('/docs') ? 'font-semibold' : ''
                  }`}
                >
                  Docs
                </Link>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Mobile Menu Toggle Button (Visible on Mobile) */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Menu (Dropdown) */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 space-y-4">
                <Link
                  to="/pricing"
                  className={`block text-gray-600 hover:text-gray-900 ${
                    isActive('/pricing') ? 'font-semibold' : ''
                  }`}
                >
                  Pricing
                </Link>
                <button
                  onClick={toggleFeaturesDropdown}
                  className={`block text-gray-600 hover:text-gray-900 ${
                    isActive('/features') ? 'font-semibold' : ''
                  }`}
                >
                  Features
                </button>
                {isFeaturesDropdownOpen && (
                  <div className="pl-4 space-y-4">
                    {features.map((feature, index) => (
                      <Link
                        key={index}
                        to={feature.path}
                        className="flex items-center space-x-3"
                      >
                        {feature.icon}
                        <span className="text-gray-700">{feature.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  to="/docs"
                  className={`block text-gray-600 hover:text-gray-900 ${
                    isActive('/docs') ? 'font-semibold' : ''
                  }`}
                >
                  Docs
                </Link>
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;