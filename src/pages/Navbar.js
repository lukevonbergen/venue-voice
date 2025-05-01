import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Docs', path: 'https://chatters.canny.io/changelog' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/img/Logo.svg" alt="Chatters Logo" className="h-8" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium hover:text-gray-900 ${isActive(link.path) ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link to="/signup" className="text-sm text-gray-600 hover:text-gray-900">
              Sign Up
            </Link>
            <Link to="/signin" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800">
              Login
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm text-gray-700 hover:text-gray-900"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/signup" className="block text-sm text-gray-700 hover:text-gray-900">
              Sign Up
            </Link>
            <Link to="/signin" className="block text-sm text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
