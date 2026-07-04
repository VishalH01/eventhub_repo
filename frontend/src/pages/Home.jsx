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
  Ticket,
  ChevronRight
} from 'lucide-react';

function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // Fetch real events for the catalog on mount
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
    <div className="relative min-h-[90vh] bg-slate-900 text-slate-100 overflow-hidden flex flex-col justify-between">
      
      {/* ===================================================================
          BACKGROUND CANVAS: Glowing gradient blobs for tech-startup aesthetics
          =================================================================== */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-blob [animation-delay:4s]"></div>
      
      {/* Decorative Grid Line System */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 py-16 relative z-10 flex-1 flex flex-col gap-24">
        
        {/* ===================================================================
            1. HERO SECTION: Split Layout (Copy left, Floating glass pass right)
            =================================================================== */}
        <div className="flex flex-col lg:flex-row gap-16 items-center justify-between min-h-[60vh]">
          
          {/* Hero Copy (Left) */}
          <div className="flex-[6] text-left space-y-6 animate-fade-in">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span>Real-Time Venue Seating Engine</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-2xl">
              Connect, Register <br className="hidden md:inline" />
              & Scan <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Extraordinary</span> Events
            </h1>

            <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              An all-in-one developer & audience experience platform. Browse global events, select seating grids dynamically, complete sandbox payments, and fetch secure scan-ready boarding passes instantly.
            </p>

            {/* Context-aware CTA Actions */}
            <div className="flex flex-wrap gap-4 pt-2">
              {user ? (
                <>
                  <Link
                    to="/events"
                    className="hover-shine-parent group px-6 py-3.5 bg-gradient-to-r from-violet-650 to-indigo-650 bg-violet-600 hover:from-violet-600 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/10 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Browse Events Feed</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to={isAdmin ? "/admin" : "/my-registrations"}
                    className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {isAdmin ? "Admin Console" : "My Boarding Passes"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/events"
                    className="hover-shine-parent group px-6 py-3.5 bg-gradient-to-r from-violet-650 to-indigo-650 bg-violet-600 hover:from-violet-600 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/10 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Explore Event Catalog</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Graphic: Floating Glassmorphic Ticket Pass (Right) */}
          <div className="flex-[5] w-full flex justify-center lg:justify-end">
            <div className="animate-float w-full max-w-sm bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl p-6 relative hover-shine-parent cursor-default">
              
              {/* Header details */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-700 pb-4 mb-4">
                <div>
                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[9px] font-black rounded-md tracking-wider uppercase border border-violet-500/10">Boarding Pass</span>
                  <h4 className="font-extrabold text-white text-sm mt-2">Vite & Spring Boot Conf</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Hall 3, Mumbai Center</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-violet-400 block">₹1,500.00</span>
                  <span className="text-[8px] text-slate-500 font-black uppercase">Price (VIP)</span>
                </div>
              </div>

              {/* Graphic Seat Selection Layout preview */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 mb-4">
                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  <span>Selected Seats</span>
                  <span className="text-amber-500 font-bold">Row A-1, A-2</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5 opacity-80">
                  <span className="h-4 bg-amber-500 rounded text-[8px] text-white flex items-center justify-center font-black">A1</span>
                  <span className="h-4 bg-amber-500 rounded text-[8px] text-white flex items-center justify-center font-black">A2</span>
                  <span className="h-4 bg-slate-800 rounded"></span>
                  <span className="h-4 bg-slate-800 rounded"></span>
                  <span className="h-4 bg-slate-750 text-slate-600 text-[8px] flex items-center justify-center font-black">✕</span>
                  <span className="h-4 bg-slate-750 text-slate-600 text-[8px] flex items-center justify-center font-black">✕</span>
                </div>
              </div>

              {/* Barcode / Scan Indicator */}
              <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800/40">
                <div>
                  <span className="text-[8px] text-slate-500 font-bold block">SCAN FOR ENTRANCE</span>
                  <span className="text-[10px] font-mono font-bold text-slate-350 tracking-wider">EVT2026-BOARD</span>
                </div>
                <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ===================================================================
            2. STATS BAR: Live Platform Metrics
            =================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-850/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-800/60 shadow-sm text-center">
          <div>
            <span className="block text-2xl md:text-3xl font-black text-white">450+</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Events Hosted</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-violet-400">12k+</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Tickets Scanned</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-white">100%</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Secure Payments</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-emerald-450 text-emerald-400">99.9%</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Uptime SLA</span>
          </div>
        </div>

        {/* ===================================================================
            3. FEATURED EVENTS: Real Data binds from backend
            =================================================================== */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Live Schedule</span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Featured Event Listings</h2>
            </div>
            <Link to="/events" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-2 md:mt-0 transition">
              Browse Entire Feed ({featuredEvents.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-slate-800/40 border border-slate-700/30 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {featuredEvents.map(evt => (
                <div key={evt.id} className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-500/30 hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group">
                  <div>
                    {/* Event Cover Image */}
                    <div className="h-40 w-full overflow-hidden bg-slate-900 relative">
                      {evt.imageUrl ? (
                        <img 
                          src={evt.imageUrl} 
                          alt={evt.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-800">📅</div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-900/90 backdrop-blur-sm text-[9px] font-black text-violet-455 text-violet-400 rounded-md uppercase tracking-wider border border-violet-500/10">
                        {evt.category}
                      </span>
                    </div>

                    {/* Card Content details */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-white text-base leading-snug line-clamp-1 group-hover:text-violet-400 transition">
                        {evt.title}
                      </h3>
                      
                      <div className="mt-3.5 space-y-2 text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-400" />
                          <span>{new Date(evt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom actions */}
                  <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-500 font-bold block uppercase">Tickets from</span>
                      <span className="text-sm font-black text-white">₹{evt.price.toFixed(2)}</span>
                    </div>
                    <Link
                      to={`/events/${evt.id}`}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-1"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/20 py-12 px-6 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs font-medium">
              🎟️ No active events found in the database. Seed events inside the Admin panel first!
            </div>
          )}
        </div>

        {/* ===================================================================
            4. WORKFLOW: How it works step-by-step
            =================================================================== */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-1">
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Interactive Blueprint</span>
            <h2 className="text-2xl md:text-3xl font-black text-white">How the Platform Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-slate-850/20 border border-slate-800/80 rounded-3xl hover:border-violet-500/20 transition group">
              <span className="text-3xl font-black text-slate-700 group-hover:text-violet-500/20 transition duration-200">01</span>
              <h4 className="font-extrabold text-white text-sm">Discover Sessions</h4>
              <p className="text-slate-450 text-xs leading-relaxed">
                Filter through live technographic summits, music stages, and layout specs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-slate-850/20 border border-slate-800/80 rounded-3xl hover:border-violet-500/20 transition group">
              <span className="text-3xl font-black text-slate-700 group-hover:text-violet-500/20 transition duration-200">02</span>
              <h4 className="font-extrabold text-white text-sm">Interactive Seating</h4>
              <p className="text-slate-450 text-xs leading-relaxed">
                Select coordinate bounds including VIP front rows, walkway blockings, and real-time status.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-slate-850/20 border border-slate-800/80 rounded-3xl hover:border-violet-500/20 transition group">
              <span className="text-3xl font-black text-slate-700 group-hover:text-violet-500/20 transition duration-200">03</span>
              <h4 className="font-extrabold text-white text-sm">Sandbox Checkout</h4>
              <p className="text-slate-450 text-xs leading-relaxed">
                Execute sandboxed test payments via Razorpay verify, validated securely on backend layers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-slate-850/20 border border-slate-800/80 rounded-3xl hover:border-violet-500/20 transition group">
              <span className="text-3xl font-black text-slate-700 group-hover:text-violet-500/20 transition duration-200">04</span>
              <h4 className="font-extrabold text-white text-sm">Download pass</h4>
              <p className="text-slate-450 text-xs leading-relaxed">
                Fetch scan-ready boarding cards compiled dynamically via backend ZXing QR algorithms.
              </p>
            </div>

          </div>
        </div>

        {/* ===================================================================
            5. GRADIENT CALL-TO-ACTION CARD
            =================================================================== */}
        <div className="bg-gradient-to-r from-violet-750 via-indigo-700 to-indigo-850 bg-violet-700 p-8 md:p-12 rounded-3xl text-white text-center shadow-2xl relative overflow-hidden group border border-violet-500/20">
          {/* Glass shine hover effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

          <span className="text-[10px] font-black text-violet-200 uppercase tracking-widest">Connect Instantly</span>
          <h2 className="text-2xl md:text-4xl font-black mt-2 leading-tight">Ready to Book Your Next Session?</h2>
          <p className="text-xs md:text-sm text-indigo-150 max-w-md mx-auto mt-3 leading-relaxed">
            Create an attendee account in seconds, select live seating configurations, and claim your entrance QR passes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/events"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-indigo-800 font-extrabold rounded-2xl text-xs shadow-md transition hover:-translate-y-0.5"
            >
              Browse Live Feed
            </Link>
          </div>
        </div>

      </div>

      {/* Trust Footer */}
      <div className="bg-slate-950 border-t border-slate-850 py-6 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-6 justify-center items-center opacity-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>Spring Security JWT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Role-Based RBAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Razorpay Verify</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
