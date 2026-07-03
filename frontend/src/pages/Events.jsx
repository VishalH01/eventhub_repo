import React, { useState } from 'react';

// Mock list of events to display initially for layout demonstration
const MOCK_EVENTS = [
  {
    id: 1,
    title: 'National Tech Summit 2026',
    description: 'Explore the latest advancements in AI, full stack web engineering, and cloud platforms.',
    date: 'August 15, 2026',
    location: 'Mumbai, India',
    price: 499.00,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'Creative Design Workshop',
    description: 'Learn UI/UX best practices, typography rules, and modern design principles from leading designers.',
    date: 'September 02, 2026',
    location: 'Pune, India',
    price: 299.00,
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'Global Music Festival',
    description: 'An evening of live concerts featuring top local bands and electronic music producers.',
    date: 'October 10, 2026',
    location: 'Goa, India',
    price: 999.00,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=60'
  }
];

function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter logic for search and category select
  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center md:text-left mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800">Browse Events</h2>
        <p className="mt-2 text-slate-500">Discover and register for amazing sessions happening near you.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by event title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Design">Design</option>
            <option value="Music">Music</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-150 overflow-hidden flex flex-col hover:shadow-md transition duration-150">
              {/* Event Image */}
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              
              {/* Event Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {event.category}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-800 leading-snug">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-slate-500 text-sm line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>📅 {event.date}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-extrabold text-slate-800">
                      ₹{event.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => alert(`Registration clicked for: ${event.title}`)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default Events;
