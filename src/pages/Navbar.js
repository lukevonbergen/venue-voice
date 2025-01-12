import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, QrCode, BarChart, Gauge, Paintbrush, ClipboardList, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
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
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsFeaturesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
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
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-gray-900"
              >
                Pricing
              </Link>
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="text-gray-700 hover:text-gray-900">
                  Features
                </button>
                {isFeaturesDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-[480px] bg-white shadow-lg border border-gray-200"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="p-6 grid grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <Link
                          key={index}
                          to={feature.path}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {feature.icon}
                          <span className="text-gray-700">{feature.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="#"
                className="text-gray-700 hover:text-gray-900"
              >
                Docs
              </Link>
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center space-x-2"
                >
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <Link
                to="/pricing"
                className="block text-gray-700 hover:text-gray-900"
              >
                Pricing
              </Link>
              <button
                onClick={toggleFeaturesDropdown}
                className="block text-gray-700 hover:text-gray-900 w-full text-left"
              >
                Features
              </button>
              {isFeaturesDropdownOpen && (
                <div className="pl-4 space-y-4">
                  {features.map((feature, index) => (
                    <Link
                      key={index}
                      to={feature.path}
                      className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg"
                    >
                      {feature.icon}
                      <span className="text-gray-700">{feature.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                to="/docs"
                className="block text-gray-700 hover:text-gray-900"
              >
                Docs
              </Link>
              <Link
                to="/signin"
                className="block text-gray-700 hover:text-gray-900"
              >
                <span>Login</span>
                <ArrowRight className="h-4 w-4 inline-block ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;