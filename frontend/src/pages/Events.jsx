import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  Search, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['All', 'Tech', 'Music', 'Design'];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await API.get('/events', {
          params: {
            search: searchTerm,
            category: selectedCategory
          }
        });
        setEvents(response.data);
      } catch (err) {
        setError('Failed to load events. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="relative min-h-[85vh] py-8 max-w-6xl mx-auto px-4">
      {/* Background ambient decorations */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative z-10 space-y-8">
        {/* Page Header */}
        <div className="text-left space-y-2 animate-fade-in">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-widest">
            Events Feed
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Explore Live Catalog</h2>
          <p className="text-slate-500 text-sm font-medium">Discover technical conferences, workshop classes, and local concerts happening near you.</p>
        </div>

        {/* Search & Interactive Category Chips Panel */}
        <div className="flex flex-col gap-5 p-5 bg-white border border-slate-150 shadow-sm rounded-3xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input Box */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by title, description or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
              />
            </div>
            
            {/* Category Pill Selection */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2 text-xs font-bold rounded-xl border transition-all duration-150 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-150 text-red-650 rounded-2xl text-xs font-semibold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group">
                
                <div>
                  {/* Event Image */}
                  <div className="w-full h-48 overflow-hidden bg-slate-50 relative border-b border-slate-100">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-[9px] font-black text-indigo-700 rounded-md uppercase tracking-wider">
                      {event.category}
                    </span>
                  </div>
                  
                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-indigo-650 transition line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-slate-450 text-xs md:text-sm leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-2">
                  <div className="flex justify-between items-center text-[10px] md:text-xs text-slate-500 border-t border-slate-50 pt-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {new Date(event.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                    <span className="flex items-center gap-1 max-w-[140px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {event.location}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase">Ticket Price</span>
                      <span className="text-base font-black text-slate-700">
                        ₹{event.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <Link
                      to={`/events/${event.id}`}
                      className="px-4 py-2 bg-slate-100 group-hover:bg-indigo-600 text-slate-650 group-hover:text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-1"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-150 shadow-sm max-w-lg mx-auto">
            <span className="text-5xl">🔍</span>
            <h3 className="mt-4 text-sm font-extrabold text-slate-800 uppercase tracking-wider">No Events Found</h3>
            <p className="mt-2 text-slate-500 text-xs font-medium">Try broadening your search term or select another category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
