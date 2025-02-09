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
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setIsFeaturesDropdownOpen(true);
    }, 100); // Reduced delay to 100ms
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setIsFeaturesDropdownOpen(false);
    }, 100); // Reduced delay to 100ms
    setHoverTimeout(timeout);
  };

  const features = [
    {
      category: 'Analytics',
      items: [
        { name: 'Real-time Stats', path: '/features/real-time-stats' },
        { name: 'Dashboards', path: '/features/dashboards' },
      ],
    },
    {
      category: 'Customization',
      items: [
        { name: 'Custom Branding', path: '/features/custom-branding' },
        { name: 'Custom Questions', path: '/features/custom-questions' },
      ],
    },
    {
      category: 'Tools',
      items: [
        { name: 'QR Codes', path: '/features/qr-codes' },
        { name: 'NPS Score', path: '/features/nps-score' },
      ],
    },
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
                className={`z-1000 lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:w-[600px] rounded-lg shadow-lg border border-gray-200 bg-white ${isMobileMenuOpen ? "static mt-2 w-full" : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ zIndex: 1000 }}
              >
                <div className={`${isMobileMenuOpen ? "flex flex-col space-y-2 p-2" : "p-6"}`}>
                  <div className="grid grid-cols-3 gap-6">
                    {features.map((category, index) => (
                      <div key={index} className="space-y-4">
                        <h3 className="font-semibold text-gray-900">{category.category}</h3>
                        <ul className="space-y-2">
                          {category.items.map((item, idx) => (
                            <li key={idx}>
                              <Link
                                to={item.path}
                                className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {/* Optional: Add a CTA or additional content */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <Link
                      to="/features"
                      className="block text-center text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Explore All Features →
                    </Link>
                  </div>
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
            to="https://chatters.canny.io/changelog"
            className={`font-inter rounded-lg lg:px-6 lg:py-4 lg:hover:text-gray-800 ${isActive('https://chatters.canny.io/changelog') ? 'font-semibold' : ''}`}
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