import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, QrCode, BarChart, Gauge, Paintbrush, ClipboardList, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
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

  const features = [
    { name: 'QR Codes', icon: <QrCode className="h-5 w-5 text-blue-500" />, path: '/features/qr-codes' },
    { name: 'NPS Score', icon: <BarChart className="h-5 w-5 text-green-500" />, path: '/features/nps-score' },
    { name: 'Real-time stats', icon: <Gauge className="h-5 w-5 text-purple-500" />, path: '/features/real-time-stats' },
    { name: 'Custom Branding', icon: <Paintbrush className="h-5 w-5 text-yellow-500" />, path: '/features/custom-branding' },
    { name: 'Custom Questions', icon: <ClipboardList className="h-5 w-5 text-red-500" />, path: '/features/custom-questions' },
    { name: 'Dashboards', icon: <LayoutDashboard className="h-5 w-5 text-indigo-500" />, path: '/features/dashboards' },
  ];

  return (
    <nav className="font-inter mx-auto h-auto w-full max-w-screen-2xl lg:relative lg:top-0">
      <div className="flex flex-col px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-4 xl:px-20">
        {/* Logo */}
        <Link to="/">
          <img
            src="/img/getchatters_logo.svg"
            alt="Chatter Logo"
            className="h-8"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`mt-14 flex flex-col space-y-8 lg:mt-0 lg:flex lg:flex-row lg:space-x-8 lg:space-y-0 ${isMobileMenuOpen ? "" : "hidden"}`}>
          <div className="relative flex flex-col">
            <button
              onClick={toggleFeaturesDropdown}
              className={`flex flex-row rounded-lg lg:px-6 lg:py-4 lg:hover:text-gray-800 ${isFeaturesDropdownOpen ? "text-gray-800 lg:border lg:border-gray-600 lg:bg-gray-50" : "text-black lg:border lg:border-white"}`}
            >
              Features
              <svg
                className={`w-6 h-6 fill-current transition-transform duration-300 ${isFeaturesDropdownOpen ? "rotate-180" : "rotate-0"}`}
                viewBox="0 0 24 24"
              >
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path>
              </svg>
            </button>
            {isFeaturesDropdownOpen && (
              <div className="z-50 flex w-full flex-col rounded-lg px-5 py-5 lg:absolute lg:top-20 lg:w-[800px] bg-gray-100 lg:flex-row lg:flex-wrap lg:py-7 xl:w-[950px]">
                {features.map((feature, index) => (
                  <Link
                    key={index}
                    to={feature.path}
                    className="flex grow flex-col rounded-lg px-5 py-5 lg:basis-60 xl:px-8"
                  >
                    <div className="relative">
                      {feature.icon}
                    </div>
                    <h2 className="font-inter mb-1 mt-5 text-lg font-medium text-black">
                      {feature.name}
                    </h2>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/pricing"
            className={`font-inter rounded-lg lg:px-6 lg:py-4 lg:hover:text-gray-800 ${isActive('/pricing') ? 'font-semibold' : ''}`}
          >
            Pricing
          </Link>
          <Link
            to="/docs"
            className={`font-inter rounded-lg lg:px-6 lg:py-4 lg:hover:text-gray-800 ${isActive('/docs') ? 'font-semibold' : ''}`}
          >
            Docs
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          className="absolute right-5 lg:hidden"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Sign Up and Login Buttons */}
        <div className={`flex flex-col space-y-8 lg:flex lg:flex-row lg:space-x-3 lg:space-y-0 ${isMobileMenuOpen ? "" : "hidden"}`}>
          <Link
            to="/signup"
            className="font-inter rounded-lg lg:px-6 lg:py-4 lg:hover:text-gray-800"
          >
            Sign Up
          </Link>
          <Link
            to="/signin"
            className="font-inter rounded-lg bg-black px-8 py-4 text-center text-white hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;