import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
    // Set a timeout to open the dropdown after 100ms (quicker response)
    const timeout = setTimeout(() => {
      setIsFeaturesDropdownOpen(true);
    }, 100); // Reduced delay to 100ms
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Clear any existing timeout to prevent premature opening
    if (hoverTimeout) clearTimeout(hoverTimeout);
    // Set a timeout to close the dropdown after 100ms
    const timeout = setTimeout(() => {
      setIsFeaturesDropdownOpen(false);
    }, 100); // Reduced delay to 100ms
    setHoverTimeout(timeout);
  };

  const features = [
    { name: 'QR Codes', path: '/features/qr-codes' },
    { name: 'NPS Score', path: '/features/nps-score' },
    { name: 'Real-time stats', path: '/features/real-time-stats' },
    { name: 'Custom Branding', path: '/features/custom-branding' },
    { name: 'Custom Questions', path: '/features/custom-questions' },
    { name: 'Dashboards', path: '/features/dashboards' },
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

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          className="absolute right-5 lg:hidden"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation Links */}
        <div className={`mt-14 flex flex-col space-y-8 lg:mt-0 lg:flex lg:flex-row lg:space-x-8 lg:space-y-0 ${isMobileMenuOpen ? "" : "hidden"}`}>
          <div
            className="relative flex flex-col"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
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
              <div
                className={`z-50 lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 ${isMobileMenuOpen ? "static mt-2 w-full" : ""}`}
                onMouseEnter={handleMouseEnter} // Keep dropdown open when hovering over it
                onMouseLeave={handleMouseLeave} // Close dropdown when leaving it
              >
                <div className={`${isMobileMenuOpen ? "flex flex-col space-y-2 p-2" : "p-4"}`}>
                  {features.map((feature, index) => (
                    <Link
                      key={index}
                      to={feature.path}
                      className={`block p-2 rounded-lg hover:bg-gray-50 transition-colors ${isMobileMenuOpen ? "text-left" : ""}`}
                    >
                      {feature.name}
                    </Link>
                  ))}
                </div>
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