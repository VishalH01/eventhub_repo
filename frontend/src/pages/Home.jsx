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
  Ticket,
  Search,
  Zap,
  Lock
} from 'lucide-react';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');

  // Retrieve user session info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get('/events');
        setEvents(response.data);
      } catch (err) {
        console.error("Failed to load events for homepage bento:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on quick search
  const filteredEvents = events.filter(evt => 
    evt.title.toLowerCase().includes(quickSearch.toLowerCase()) ||
    evt.category.toLowerCase().includes(quickSearch.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="relative min-h-[90vh] bg-[#090d16] text-slate-100 overflow-hidden flex flex-col justify-between font-sans">
      
      {/* Cinematic grid backdrop and colored ambient spheres */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none animate-blob [animation-delay:6s]"></div>

      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 py-12 relative z-10 flex-1 flex flex-col gap-12">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-8">
          <div className="text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[9px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 text-violet-400 animate-bounce" />
              <span>EventHub Engine v2.0</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Interactive Event Console</h2>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-xs font-semibold text-slate-400">
                Logged in as: <span className="text-violet-400 font-bold">{user.name}</span>
              </span>
            ) : (
              <Link to="/register" className="px-4 py-2 bg-violet-650 hover:bg-violet-600 bg-violet-600 text-white text-xs font-bold rounded-xl transition">
                Create Free Account
              </Link>
            )}
          </div>
        </div>

        {/* ===================================================================
            BENTO GRID LAYOUT (3 columns, responsive grid)
            =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box 1: Main Welcome & Search Hub (Col span 2, Row span 2) */}
          <div className="md:col-span-2 md:row-span-2 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between hover:border-violet-500/20 transition duration-300 relative overflow-hidden group">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none text-left">
                Discover, Select Seats <br />
                & Book <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Instantly</span>
              </h1>
              <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-lg text-left">
                A unified dashboard built on Spring Boot & React. Search live listings, plan VIP coordinate seatings, and capture Base64 QR-code boarding tickets.
              </p>
            </div>

            {/* In-Bento Live Search Box */}
            <div className="mt-8 space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Quick search events catalog..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-xs md:text-sm font-medium placeholder-slate-500"
                />
              </div>
              <div className="flex gap-2.5">
                <Link to="/events" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                  <span>Open Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {user && (
                  <Link to={isAdmin ? "/admin" : "/my-registrations"} className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-350 hover:text-white font-bold rounded-xl text-xs transition">
                    {isAdmin ? "Manage Dashboard" : "My Bookings"}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Box 2: Visual Seating Status Widget (Col span 1) */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 hover:border-violet-500/20 transition duration-300 flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block mb-2">Simulated Grids</span>
              <h3 className="font-extrabold text-white text-base">VIP Row Seat Maps</h3>
              <p className="text-slate-550 text-slate-450 text-[11px] leading-relaxed mt-1">
                Verify seating rules (VIP front rows 1.5x premium, walkway aisle blockings) dynamically.
              </p>
            </div>
            
            {/* Seating mini preview layout */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 mt-4">
              <div className="grid grid-cols-5 gap-1">
                <span className="h-4 bg-amber-500 rounded text-[7px] text-white flex items-center justify-center font-black">A1</span>
                <span className="h-4 bg-amber-500 rounded text-[7px] text-white flex items-center justify-center font-black">A2</span>
                <span className="h-4 bg-slate-800 rounded"></span>
                <span className="h-4 bg-slate-850 text-slate-600 text-[7px] flex items-center justify-center font-black">✕</span>
                <span className="h-4 bg-slate-850 text-slate-600 text-[7px] flex items-center justify-center font-black">✕</span>
              </div>
            </div>
          </div>

          {/* Box 3: Cryptographic Razorpay Payments Widget (Col span 1) */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 hover:border-violet-500/20 transition duration-300 flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Secure Sandbox</span>
              <h3 className="font-extrabold text-white text-base">Razorpay Payments</h3>
              <p className="text-slate-450 text-[11px] leading-relaxed mt-1">
                Order IDs compiled on backend nodes and cryptographically verified on callback via SHA-256 signatures.
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-450 border-t border-slate-800/60 pt-3">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-450 text-emerald-400" /> SECURE</span>
              <span className="text-[10px] text-emerald-400 font-black tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">VERIFIED</span>
            </div>
          </div>

          {/* Box 4: Interactive Live Events Catalog Slider (Col span 3) */}
          <div className="md:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 hover:border-violet-500/20 transition duration-300 flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div>
                <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block">Real-Time Data Feed</span>
                <h3 className="font-extrabold text-white text-base mt-0.5">Upcoming Live Events</h3>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                FOUND: {filteredEvents.length}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 bg-slate-800/40 border border-slate-700/30 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {filteredEvents.map(evt => (
                  <div key={evt.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between hover:border-violet-500/20 hover:bg-slate-950/80 transition duration-150 group">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 bg-violet-500/10 text-violet-455 text-violet-400 border border-violet-500/10 text-[8px] font-black rounded-md uppercase tracking-wider">
                          {evt.category}
                        </span>
                        <span className="text-[10px] font-black text-slate-400">₹{evt.price.toFixed(0)}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-violet-400 transition">{evt.title}</h4>
                      
                      <div className="space-y-1 text-[10px] text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(evt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <Link to={`/events/${evt.id}`} className="mt-4 px-3 py-2 bg-slate-900 group-hover:bg-violet-600 text-slate-300 group-hover:text-white text-[10px] font-black rounded-xl text-center transition flex items-center justify-center gap-1">
                      <span>Get Passes</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-semibold">
                No active events match your quick search criteria.
              </div>
            )}
          </div>

          {/* Box 5: QR Ticketer Boarding Pass Pass Wallet (Col span 1) */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 hover:border-violet-500/20 transition duration-300 flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block mb-2">Dynamic Compilation</span>
              <h3 className="font-extrabold text-white text-base">QR Boarding Tickets</h3>
              <p className="text-slate-450 text-[11px] leading-relaxed mt-1">
                ZXing engine compiles attendee registration metrics on-demand into base64 data image arrays.
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
              <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
            </div>
          </div>

          {/* Box 6: Modular System Architecture (Col span 2) */}
          <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 hover:border-violet-500/20 transition duration-300 flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block mb-2">Core Pipeline</span>
              <h3 className="font-extrabold text-white text-base">Full-Stack Framework Integration</h3>
              <p className="text-slate-450 text-[11px] leading-relaxed mt-1">
                Engineered with Spring Boot Security (JWT authentication filters, CORS mapping matrices), Maven dependency management, and React Router bindings.
              </p>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-black text-slate-450 uppercase tracking-widest border-t border-slate-800/60 pt-4">
              <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-slate-500" /> SPRING SECURITY</div>
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-500" /> RBAC ROLES</div>
              <div className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-slate-500" /> SEATING ENGINE</div>
            </div>
          </div>

        </div>

      </div>

      {/* Trust Footer */}
      <div className="bg-slate-950 border-t border-slate-850 py-6 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-6 justify-center items-center opacity-40 text-[9px] font-black text-slate-500 uppercase tracking-widest">
          <span>Spring Security JWT</span>
          <span>•</span>
          <span>Role-Based RBAC</span>
          <span>•</span>
          <span>Razorpay Verify</span>
        </div>
      </div>

    </div>
  );
}

export default Home;
