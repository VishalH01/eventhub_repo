import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  Calendar, 
  Users, 
  Cpu,
  MapPin,
  Clock,
  Ticket
} from 'lucide-react';

function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // Fetch real featured events on component mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await API.get('/events');
        // Take the first 3 events as featured items
        setFeaturedEvents(response.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load featured events for homepage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="relative min-h-[90vh] bg-slate-50/40 overflow-hidden flex flex-col justify-between">
      
      {/* Background neon ambient circles */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none animate-pulse duration-700"></div>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-12 relative z-10 flex-1 flex flex-col gap-20">
        
        {/* ===================================================================
            1. HERO SECTION: Split Layout with copy & interactive ticket card
            =================================================================== */}
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between min-h-[50vh]">
          
          {/* Hero Left: Copy & Actions */}
          <div className="flex-[6] text-left space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
              <span>Discover & Book Seating Live</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-[1.05] max-w-2xl">
              Connect, Register & Scan <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Extraordinary Events
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-500 max-w-xl leading-relaxed font-medium">
              The premium platform to browse conferences, book custom seats (VIP/Standard) on live simulated venue grids, checkout via secure payment sandboxes, and download scan-ready QR boarding passes.
            </p>

            {/* Context-aware CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              {user ? (
                <>
                  <Link
                    to="/events"
                    className="group px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Browse Events Feed</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to={isAdmin ? "/admin" : "/my-registrations"}
                    className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {isAdmin ? "Admin Dashboard" : "My Tickets & Passes"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/events"
                    className="group px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Explore Events Feed</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3.5 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Right: Interactive 3D-effect CSS Boarding Ticket */}
          <div className="flex-[5] w-full flex justify-center lg:justify-end animate-scale-up">
            <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
              
              {/* Glass shine element */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-3xl pointer-events-none group-hover:animate-shine"></div>

              {/* Event Card Info */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-4 mb-4">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md tracking-wider uppercase">Live Pass Preview</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-2">Vite & Spring Boot Conf</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Mumbai convention Center</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">₹1,500.00</span>
                  <span className="text-[8px] text-slate-400 font-black uppercase">Price (VIP)</span>
                </div>
              </div>

              {/* Interactive Seat Map Mock */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>Seating Grid</span>
                  <span className="text-amber-500">Row A-1, A-2</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  <span className="h-4 bg-amber-500 rounded text-[8px] text-white flex items-center justify-center font-black">A1</span>
                  <span className="h-4 bg-amber-500 rounded text-[8px] text-white flex items-center justify-center font-black">A2</span>
                  <span className="h-4 bg-slate-200 rounded"></span>
                  <span className="h-4 bg-slate-200 rounded"></span>
                  <span className="h-4 bg-red-100 text-red-500 text-[8px] flex items-center justify-center font-black">✕</span>
                  <span className="h-4 bg-red-100 text-red-500 text-[8px] flex items-center justify-center font-black">✕</span>
                </div>
              </div>

              {/* Boarding QR Section */}
              <div className="flex justify-between items-center bg-slate-900 text-white p-3.5 rounded-2xl">
                <div>
                  <span className="text-[8px] text-slate-400 font-bold block">SCAN TO ENTER</span>
                  <span className="text-[10px] font-mono font-bold tracking-wider">EVT2026-CONF</span>
                </div>
                <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ===================================================================
            2. STATS BAR: Live Platform Metrics
            =================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-center">
          <div>
            <span className="block text-2xl md:text-3xl font-black text-slate-800">450+</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Events Hosted</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-indigo-600">12k+</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Tickets Scanned</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-slate-800">100%</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Secure Payments</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-emerald-600">₹0</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Failed Checkouts</span>
          </div>
        </div>

        {/* ===================================================================
            3. REAL FEATURED EVENTS: Dynamic grid pulling from MySQL backend
            =================================================================== */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div className="text-left">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Schedule</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-1">🌟 Featured Events Happening Now</h2>
            </div>
            <Link to="/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2 md:mt-0 transition">
              View All Events ({featuredEvents.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {featuredEvents.map(evt => (
                <div key={evt.id} className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-200 flex flex-col justify-between group">
                  <div>
                    {/* Event Cover Image */}
                    <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                      {evt.imageUrl ? (
                        <img 
                          src={evt.imageUrl} 
                          alt={evt.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-[9px] font-black text-indigo-700 rounded-md uppercase tracking-wider">
                        {evt.category}
                      </span>
                    </div>

                    {/* Card Content details */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-slate-850 text-base leading-snug line-clamp-1 group-hover:text-indigo-650 transition">
                        {evt.title}
                      </h3>
                      
                      <div className="mt-3.5 space-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{new Date(evt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom actions */}
                  <div className="p-5 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase">Tickets from</span>
                      <span className="text-sm font-black text-slate-700">₹{evt.price.toFixed(2)}</span>
                    </div>
                    <Link
                      to={`/events/${evt.id}`}
                      className="px-3.5 py-2 bg-slate-100 group-hover:bg-indigo-600 text-slate-650 group-hover:text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-1"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white py-12 px-6 rounded-3xl border border-slate-150 text-center text-slate-400 text-xs font-medium">
              🎟️ No active events found in the database. Seed events inside the Admin panel first!
            </div>
          )}
        </div>

        {/* ===================================================================
            4. PLATFORM HIGHLIGHTS: Technical features
            =================================================================== */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-black text-indigo-650 uppercase tracking-widest">Platform Core Architecture</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-1">Engineered for Event Registration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Seating Simulator */}
            <div className="p-8 bg-white rounded-3xl border border-slate-150 text-left hover:-translate-y-1 transition duration-200 group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Dynamic Seating Simulator</h3>
              <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed">
                Admins configure grid bounds, walkway aisles, and capacity limits. Users choose standard or VIP front rows dynamically with 1.5x pricing multipliers.
              </p>
            </div>

            {/* Cryptographic Security */}
            <div className="p-8 bg-white rounded-3xl border border-slate-150 text-left hover:-translate-y-1 transition duration-200 group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Secure Payment Verification</h3>
              <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed">
                Integrated Razorpay gateway dialog executing secure sandbox orders. HMAC SHA-256 signature hash hashes are verified by backend Spring Boot servers.
              </p>
            </div>

            {/* ZXing Ticket generator */}
            <div className="p-8 bg-white rounded-3xl border border-slate-150 text-left hover:-translate-y-1 transition duration-200 group">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition duration-200">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Scan-Ready Pass Generator</h3>
              <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed">
                ZXing library compiles event data on-demand into Base64 QR-code image payloads, outputting printable passes with dynamic ticket layouts.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            5. GRADIENT CTA BANNER
            =================================================================== */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-650 bg-indigo-600 p-8 md:p-12 rounded-3xl text-white text-center shadow-lg relative overflow-hidden group">
          {/* Shine effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none group-hover:animate-shine"></div>

          <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Get Started Today</span>
          <h2 className="text-2xl md:text-4xl font-black mt-2 leading-tight">Ready to Book Your Next Experience?</h2>
          <p className="text-xs md:text-sm text-indigo-100 max-w-md mx-auto mt-3 leading-relaxed">
            Register a free account, browse featured developer conferences or music festivals, and reserve your seat instantly.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/events"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-indigo-700 font-extrabold rounded-2xl text-xs shadow-md transition hover:-translate-y-0.5"
            >
              Browse Event Catalog
            </Link>
          </div>
        </div>

      </div>

      {/* Subtle Trust Footer */}
      <div className="bg-white border-t border-slate-150 py-6 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-6 justify-center items-center opacity-60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Spring Security JWT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Role-Based RBAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Razorpay Verify</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
