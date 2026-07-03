import React, { useState, useEffect } from 'react';
// Link allows navigation to the Event Details page on card click.
import { Link } from 'react-router-dom';
// Import our Axios API client
import API from '../services/api';

function Events() {
  // State to hold the list of events fetched from our database.
  const [events, setEvents] = useState([]);
  // State to hold the current user-entered search string.
  const [searchTerm, setSearchTerm] = useState('');
  // State to hold the currently selected dropdown category filter.
  const [selectedCategory, setSelectedCategory] = useState('All');
  // State to show a loading indicator during API calls.
  const [loading, setLoading] = useState(false);
  // State to capture and display errors from the backend.
  const [error, setError] = useState('');

  // useEffect Hook: Runs code automatically after the component mounts,
  // and re-runs whenever any value in the dependency array ([searchTerm, selectedCategory]) changes.
  useEffect(() => {
    // Declare a function to fetch filtered events from our Spring Boot API
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        // Send a GET request to `/api/events` with search and category parameters.
        // Axios automatically builds the query string: e.g. /api/events?search=summit&category=Technology
        const response = await API.get('/events', {
          params: {
            search: searchTerm,
            category: selectedCategory
          }
        });
        
        // Update the events state with the list returned by the controller
        setEvents(response.data);
      } catch (err) {
        setError('Failed to fetch events from server. Make sure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input to avoid hitting the database on every single keypress
    // (waits 300ms after the user stops typing before making the API request).
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    // Cleanup function: automatically runs to clear the timer when the user types again, resetting the delay.
    return () => clearTimeout(delayDebounceFn);

  }, [searchTerm, selectedCategory]);

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

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : events.length > 0 ? (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-150 overflow-hidden flex flex-col hover:shadow-md transition duration-150">
              {/* Event Image */}
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-4xl">📅</div>
              )}
              
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
                    {/* Format standard ISO datetime into a friendly display */}
                    <span>📅 {new Date(event.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-extrabold text-slate-800">
                      ₹{event.price.toFixed(2)}
                    </span>
                    {/* Link to Event Details Page */}
                    <Link
                      to={`/events/${event.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                      View Details
                    </Link>
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
