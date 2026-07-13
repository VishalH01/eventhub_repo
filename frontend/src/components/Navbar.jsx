import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import API from '../services/api';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Auto-close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await API.post(`/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userJson]);

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

            {/* Notifications Bell Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-650 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center"
                >
                  <span className="sr-only">Notifications</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 text-left py-2 animate-scale-up">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Alerts Drawer</span>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[9px] font-black text-indigo-600 hover:underline uppercase cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 transition-colors ${n.read ? 'bg-white' : 'bg-indigo-50/20'}`}>
                            <p className="text-[11px] font-semibold text-slate-700 leading-normal">{n.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[8px] text-slate-400 font-bold">
                                {new Date(n.timestamp).toLocaleDateString()} {new Date(n.timestamp).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              {!n.read && (
                                <button
                                  onClick={() => markRead(n.id)}
                                  className="text-[8px] font-black text-indigo-650 hover:underline uppercase cursor-pointer"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-[10px] font-bold">
                          🔔 No notifications found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
