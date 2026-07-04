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
  Ticket
} from 'lucide-react';

function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // Fetch real events from database
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
    <div className="relative min-h-[85vh] bg-slate-50/20 overflow-hidden flex flex-col justify-between animate-fade-in-up">
      
      {/* Clean matching background with no multi-colored ambient blobs */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 py-12 relative z-10 flex-1 flex flex-col gap-20">
        
        {/* ===================================================================
            1. HERO SECTION: Split Layout (Indigo Branding)
            =================================================================== */}
        <div className="flex flex-col lg:flex-row gap-16 items-center justify-between min-h-[55vh]">
          
          {/* Hero Left: Copy & Actions */}
          <div className="flex-[6] text-left space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real-Time Seating Engine</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-[1.05] max-w-2xl">
              Connect, Register <br />
              & Scan <span className="text-indigo-600">EventHub</span> Passes
            </h1>

            <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              A premium, streamlined event workspace. Search catalog listings, select VIP or Standard seat rows on active grids, complete payments, and download QR boarding tickets.
            </p>

            {/* Context-aware Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              {user ? (
                <>
                  <Link
                    to="/events"
                    className="hover-shine-parent group px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Browse Events Feed</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to={isAdmin ? "/admin" : "/my-registrations"}
                    className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {isAdmin ? "Admin Console" : "My Boarding Passes"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/events"
                    className="hover-shine-parent group px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Explore Event Catalog</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3.5 bg-white hover:bg-slate-100 text-indigo-650 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Right: Premium Glassmorphic Ticket Mockup (Indigo-toned) */}
          <div className="flex-[5] w-full flex justify-center lg:justify-end">
            <div className="animate-float w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-lg p-6 relative hover-shine-parent cursor-default">
              
              {/* Header details */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-4 mb-4">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md tracking-wider uppercase border border-indigo-100">Boarding Pass</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-2">Vite & Spring Boot Conf</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Hall 1, Convention Center</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600 block">₹1,500.00</span>
                  <span className="text-[8px] text-slate-400 font-black uppercase">Price (VIP)</span>
                </div>
              </div>

              {/* Graphic Seat Selection Layout preview (Indigo theme) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>Selected Seats</span>
                  <span className="text-indigo-600 font-bold">Row A-1, A-2</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  <span className="h-4 bg-indigo-600 rounded text-[8px] text-white flex items-center justify-center font-black">A1</span>
                  <span className="h-4 bg-indigo-600 rounded text-[8px] text-white flex items-center justify-center font-black">A2</span>
                  <span className="h-4 bg-slate-200 rounded"></span>
                  <span className="h-4 bg-slate-200 rounded"></span>
                  <span className="h-4 bg-slate-100 text-slate-400 text-[8px] flex items-center justify-center font-black">✕</span>
                  <span className="h-4 bg-slate-100 text-slate-400 text-[8px] flex items-center justify-center font-black">✕</span>
                </div>
              </div>

              {/* Boarding QR Section */}
              <div className="flex justify-between items-center bg-slate-900 text-white p-3.5 rounded-2xl">
                <div>
                  <span className="text-[8px] text-slate-400 font-bold block">SCAN TO ENTER</span>
                  <span className="text-[10px] font-mono font-bold tracking-wider">EVT2026-BOARD</span>
                </div>
                <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center border border-slate-800">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ===================================================================
            2. STATS BAR: Live Platform Metrics (Monochrome slate/indigo)
            =================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
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
            <span className="block text-2xl md:text-3xl font-black text-indigo-650 text-indigo-600">99.9%</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Uptime SLA</span>
          </div>
        </div>

        {/* ===================================================================
            3. FEATURED EVENTS: Real Data (Indigo tags, no multi-color badges)
            =================================================================== */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Schedule</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Featured Event Listings</h2>
            </div>
            <Link to="/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-755 flex items-center gap-1 mt-2 md:mt-0 transition">
              Browse Entire Feed ({featuredEvents.length}) <ArrowRight className="w-3.5 h-3.5" />
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
                <div key={evt.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-150 hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group">
                  <div>
                    {/* Event Cover Image */}
                    <div className="h-40 w-full overflow-hidden bg-slate-105 relative border-b border-slate-100">
                      {evt.imageUrl ? (
                        <img 
                          src={evt.imageUrl} 
                          alt={evt.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100">📅</div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-[9px] font-black text-indigo-700 rounded-md uppercase tracking-wider border border-indigo-100">
                        {evt.category}
                      </span>
                    </div>

                    {/* Card Content details */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-slate-805 text-slate-800 text-base leading-snug line-clamp-1 group-hover:text-indigo-650 transition">
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
                      <span className="text-[8px] text-slate-450 font-bold block uppercase">Tickets from</span>
                      <span className="text-sm font-black text-slate-705 text-slate-700">₹{evt.price.toFixed(2)}</span>
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
            <div className="bg-white py-12 px-6 rounded-3xl border border-slate-150 text-center text-slate-455 text-xs font-medium">
              🎟️ No active events found in the database. Seed events inside the Admin panel first!
            </div>
          )}
        </div>

        {/* ===================================================================
            4. WORKFLOW: How it works step-by-step
            =================================================================== */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-1">
            <span className="text-[10px] font-black text-indigo-650 uppercase tracking-widest">Interactive Steps</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">How the Platform Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500/20 transition group shadow-sm">
              <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-600/10 transition duration-200">01</span>
              <h4 className="font-extrabold text-slate-800 text-sm">Discover Events</h4>
              <p className="text-slate-450 text-xs leading-relaxed font-medium">
                Filter through live conferences, category tags, and layout specifications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500/20 transition group shadow-sm">
              <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-600/10 transition duration-200">02</span>
              <h4 className="font-extrabold text-slate-800 text-sm">Choose Seats</h4>
              <p className="text-slate-455 text-slate-450 text-xs leading-relaxed font-medium">
                Select coordinate bounds including VIP front rows and walkway aisle blockings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500/20 transition group shadow-sm">
              <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-600/10 transition duration-200">03</span>
              <h4 className="font-extrabold text-slate-800 text-sm">Secure Payment</h4>
              <p className="text-slate-450 text-xs leading-relaxed font-medium">
                Checkout with secure Razorpay test accounts, validated on backend server layers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-4 text-left p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500/20 transition group shadow-sm">
              <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-600/10 transition duration-200">04</span>
              <h4 className="font-extrabold text-slate-805 text-slate-800 text-sm">Download Ticket</h4>
              <p className="text-slate-450 text-xs leading-relaxed font-medium">
                Claim scan-ready entrance passes compiled dynamically via backend ZXing algorithms.
              </p>
            </div>

          </div>
        </div>

        {/* ===================================================================
            5. GRADIENT CALL-TO-ACTION CARD
            =================================================================== */}
        <div className="bg-indigo-600 p-8 md:p-12 rounded-3xl text-white text-center shadow-lg relative overflow-hidden group">
          {/* Subtle grid background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

          <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Join Instantly</span>
          <h2 className="text-2xl md:text-4xl font-black mt-2 leading-tight">Ready to Book Your Next Experience?</h2>
          <p className="text-xs md:text-sm text-indigo-100 max-w-md mx-auto mt-3 leading-relaxed">
            Register a free account, browse featured developer conferences, and claim your tickets.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/events"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-indigo-700 font-extrabold rounded-2xl text-xs shadow-md transition hover:-translate-y-0.5"
            >
              Browse Event Feed
            </Link>
          </div>
        </div>

      </div>

      {/* Trust Footer */}
      <div className="bg-white border-t border-slate-200 py-6 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-6 justify-center items-center opacity-50 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-450" />
            <span>Spring Security JWT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-455 text-slate-450" />
            <span>Role-Based RBAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-450" />
            <span>Razorpay Verify</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
