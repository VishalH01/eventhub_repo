import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // Handle logout session clearance
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-white/85 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-md px-4 sm:px-6 w-full max-w-6xl mx-auto transition-all duration-350">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between h-14 items-center">
          
          {/* Logo Brand Link */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <Ticket className="w-5 h-5 text-indigo-600 shrink-0 transform -rotate-12 transition duration-300 group-hover:rotate-12" />
              <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-indigo-850 bg-clip-text text-transparent tracking-tight">
                EventHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="relative text-slate-600 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider py-1.5 transition duration-150 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-200 hover:after:w-full"
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className="relative text-slate-600 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider py-1.5 transition duration-150 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-200 hover:after:w-full"
            >
              Events
            </Link>
            
            {/* Show "My Registrations" only if user is logged in */}
            {user && (
              <Link 
                to="/my-registrations" 
                className="relative text-slate-600 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider py-1.5 transition duration-150 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-200 hover:after:w-full"
              >
                My Passes
              </Link>
            )}

            {/* Show "Admin" only if logged-in user is an administrator */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="relative text-slate-600 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider py-1.5 transition duration-150 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-200 hover:after:w-full"
              >
                Admin
              </Link>
            )}
            
            {/* Divider */}
            <span className="h-4 w-px bg-slate-200"></span>

            {/* If logged in, show user profile name and Logout button */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">
                  👋 Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 text-red-650 text-red-600 text-[10px] font-black rounded-xl transition uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-605 text-slate-600 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider transition">
                  Login
                </Link>
                <Link to="/register" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-705 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-sm transition uppercase tracking-wider">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-slate-500 hover:text-slate-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown list */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 rounded-b-2xl mt-1">
          <div className="px-2 pt-2 pb-4 space-y-1.5 text-left">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
            >
              Home
            </Link>
            <Link
              to="/events"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
            >
              Events
            </Link>
            
            {user && (
              <Link
                to="/my-registrations"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                My Passes
              </Link>
            )}
            
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                Admin
              </Link>
            )}

            <div className="border-t border-slate-100 my-2 pt-2"></div>
            
            {user ? (
              <div className="px-3 py-1 space-y-2">
                <span className="block text-xs font-bold text-slate-700">
                  👋 Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-55 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-3 py-1 space-y-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2 bg-indigo-605 bg-indigo-600 text-white text-xs font-bold rounded-xl transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
