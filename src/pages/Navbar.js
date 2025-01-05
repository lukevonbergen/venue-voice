// Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed w-full top-4 z-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200/50">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Feedie.app
                </span>
              </div>

              {/* Desktop Navigation Links (Hidden on Mobile) */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link to="/features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>
                <Link to="/docs" className="text-gray-600 hover:text-gray-900">
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
                <Link to="/pricing" className="block text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link to="/features" className="block text-gray-600 hover:text-gray-900">
                  Features
                </Link>
                <Link to="/docs" className="block text-gray-600 hover:text-gray-900">
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