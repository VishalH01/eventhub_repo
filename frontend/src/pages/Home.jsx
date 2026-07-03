import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  Calendar, 
  Users, 
  Cpu
} from 'lucide-react';

function Home() {
  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden bg-slate-50/50">
      
      {/* ===================================================================
          BACKGROUND DECORATIONS: Ambient glowing circles for premium glassmorphism
          =================================================================== */}
      <div className="absolute top-10 left-10 w-72 h-72 md:w-96 md:h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 md:w-96 md:h-96 bg-violet-300/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-500"></div>
      
      <div className="max-w-5xl w-full px-6 py-12 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Subtle top pill button */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Discover the next event</span>
        </div>

        {/* ===================================================================
            HERO MAIN HEADING & SUBTITLE
            =================================================================== */}
        <h1 className="text-4xl md:text-7xl font-black text-slate-800 tracking-tight leading-[1.05] max-w-4xl">
          Connect, Register & scan <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            Extraordinary Events
          </span>
        </h1>

        {user ? (
          <p className="mt-6 text-sm md:text-base text-slate-500 font-bold tracking-wide uppercase">
            👋 Welcome back, <span className="text-indigo-600">{user.name}</span>
          </p>
        ) : null}

        <p className="mt-6 text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
          The ultimate platform to browse conferences, book seats, complete seamless sandbox transactions, and generate secure boarding tickets equipped with scan-ready QR codes.
        </p>

        {/* ===================================================================
            CTA BUTTONS: Context-aware paths depending on auth status
            =================================================================== */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center items-center w-full">
          {user ? (
            // User is logged in
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/events"
                className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition duration-150 flex items-center gap-2"
              >
                <span>Browse Events Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              
              <Link
                to={isAdmin ? "/admin" : "/registrations"}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-0.5 transition duration-150"
              >
                {isAdmin ? "Manage Dashboard" : "My Bookings & Tickets"}
              </Link>
            </div>
          ) : (
            // User is not logged in
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/events"
                className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition duration-150 flex items-center gap-2"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/register"
                className="px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-0.5 transition duration-150"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>

        {/* ===================================================================
            PREMIUM INTERACTIVE FEATURES GRID
            =================================================================== */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          
          {/* Card 1: Browse Events */}
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-150 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition duration-200 text-left group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Browse Live Catalog</h3>
            <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed">
              Find technical conferences, workshop classes, and local meetups using real-time search queries and category filters.
            </p>
          </div>

          {/* Card 2: Secure Payments */}
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-150 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition duration-200 text-left group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Secure Transactions</h3>
            <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed">
              Complete registrations safely using the integrated Razorpay Checkout SDK dialog, verifying HMAC signature hashes cryptographically.
            </p>
          </div>

          {/* Card 3: Scan Tickets */}
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-150 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition duration-200 text-left group">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:bg-violet-600 group-hover:text-white transition duration-200">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Entry QR Passes</h3>
            <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed">
              Generate Base64-encoded tickets dynamically utilizing backend ZXing compilation, ready to be printed or scanned at the entry gate.
            </p>
          </div>

        </div>

        {/* Subtle Trust Footer */}
        <div className="mt-20 flex flex-wrap gap-8 justify-center items-center opacity-60 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span>Spring Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Role RBAC</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Razorpay Verify</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
