import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve user session info from localStorage (populated on successful login)
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Check if the logged-in user has the ROLE_ADMIN permission
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // Handle logout session clearance
  const handleLogout = () => {
    // Clear both JWT token and user profile details from client storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close mobile menu if open
    setIsOpen(false);
    
    // Redirect to login page
    navigate('/login');
    
    // Reload window to refresh global components state
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand Link */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                EventHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition">
              Home
            </Link>
            <Link to="/events" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition">
              Events
            </Link>
            
            {/* Show "My Registrations" only if user is logged in */}
            {user && (
              <Link to="/my-registrations" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition">
                My Registrations
              </Link>
            )}

            {/* Show "Admin" only if logged-in user is an administrator */}
            {isAdmin && (
              <Link to="/admin" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition">
                Admin
              </Link>
            )}
            
            {/* Divider */}
            <span className="h-4 w-px bg-slate-200"></span>

            {/* If logged in, show user profile name and Logout button. Else, show Login & Register */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">
                  👋 Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center定位 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-slate-500 hover:text-slate-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown list */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-50 bg-white">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
            >
              Home
            </Link>
            <Link
              to="/events"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
            >
              Events
            </Link>
            
            {user && (
              <Link
                to="/my-registrations"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                My Registrations
              </Link>
            )}
            
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                Admin
              </Link>
            )}

            <div className="border-t border-slate-100 my-2 pt-2"></div>
            
            {user ? (
              <div className="px-3 py-2 space-y-2">
                <span className="block text-sm font-semibold text-slate-700">
                  👋 Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-md shadow-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 mt-1 rounded-md text-base font-medium bg-indigo-600 text-white text-center hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
