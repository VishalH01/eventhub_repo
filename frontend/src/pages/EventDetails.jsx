import React, { useState, useEffect } from 'react';
// useParams extracts parameters from the route path (e.g. /events/:id -> useParams().id).
// useNavigate is used to programmatically redirect users.
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function EventDetails() {
  const { id } = useParams(); // Extract event ID from URL
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await API.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to load event details. It might have been deleted.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      alert('Please log in to register for events!');
      navigate('/login');
      return;
    }
    // Proceed to registration flow
    alert(`Registering for: ${event.title}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-12 text-center max-w-xl mx-auto px-4">
        <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-xl mb-6">
          ⚠️ {error || 'Event not found.'}
        </div>
        <Link to="/events" className="text-indigo-600 font-semibold hover:underline">
          Back to Events Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Link */}
      <Link to="/events" className="text-slate-500 hover:text-indigo-600 text-sm font-semibold transition flex items-center gap-1.5 mb-6">
        ← Back to Events Feed
      </Link>

      {/* Detail Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-150 overflow-hidden">
        {/* Banner Image */}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-80 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-slate-100 flex items-center justify-center text-6xl">📅</div>
        )}

        {/* Content Box */}
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              {event.category}
            </span>
            <span className="text-sm font-mono text-slate-400">Event ID: {event.id}</span>
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            {event.title}
          </h1>

          {/* Logistics Box */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Date & Time</p>
              <p className="mt-1 font-bold text-slate-800">
                📅 {new Date(event.date).toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
              </p>
              <p className="text-sm text-slate-500 font-medium">
                🕒 {new Date(event.date).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Event Venue</p>
              <p className="mt-1 font-bold text-slate-800">📍 {event.location}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-800">About the Event</h3>
            <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Footer Action Card */}
          <div className="mt-10 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">Ticket Price</p>
              <p className="text-3xl font-black text-slate-800">₹{event.price.toFixed(2)}</p>
            </div>
            <button
              onClick={handleRegisterClick}
              className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-150 ease-in-out text-center"
            >
              Register & Book Ticket
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetails;
