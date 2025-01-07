import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Get the current route location

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

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
                    src="/img/getchatter_logo.svg" // Path to your logo in the public folder
                    alt="Chatter Logo"
                    className="h-8" // Adjust the height as needed
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
                <Link
                  to="/features"
                  className={`text-gray-600 hover:text-gray-900 ${
                    isActive('/features') ? 'font-semibold' : ''
                  }`}
                >
                  Features
                </Link>
                <Link
                  to="/docs"
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
                <Link
                  to="/features"
                  className={`block text-gray-600 hover:text-gray-900 ${
                    isActive('/features') ? 'font-semibold' : ''
                  }`}
                >
                  Features
                </Link>
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