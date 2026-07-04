import React, { useState, useEffect } from 'react';
// useParams extracts parameters from the route path (e.g. /events/:id -> useParams().id).
// useNavigate is used to programmatically redirect users.
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import SeatSelectionModal from '../components/SeatSelectionModal';

function EventDetails() {
  const { id } = useParams(); // Extract event ID from URL
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Seating and modal states
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;

  const fetchReservedSeats = async () => {
    try {
      const response = await API.get(`/registrations/event/${id}/reserved`);
      setReservedSeats(response.data);
    } catch (err) {
      console.error("Failed to load reserved seats:", err);
    }
  };

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
    fetchReservedSeats();
  }, [id]);

  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to register for events!');
      navigate('/login');
      return;
    }
    // Open the seat selection modal instead of direct booking
    setIsSeatModalOpen(true);
  };

  const handleBookSeats = async () => {
    try {
      await API.post(`/registrations/book/${event.id}`, {
        seats: selectedSeats
      });
      toast.success('Ticket booked successfully! Redirecting to your dashboard...');
      setIsSeatModalOpen(false);
      
      setTimeout(() => {
        navigate('/my-registrations');
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data || 'Failed to book ticket.';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Booking failed.');
    }
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
    <div className="max-w-6xl mx-auto py-4 px-4 animate-fade-in-up">
      {/* Back Link */}
      <Link to="/events" className="text-slate-500 hover:text-indigo-600 text-xs font-semibold transition flex items-center gap-1.5 mb-4">
        ← Back to Events Feed
      </Link>

      {/* Detail Layout: Responsive two-column grid */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        
        {/* Left Column: Event Information (occupies 60% width) */}
        <div className="flex-[6] bg-white rounded-2xl border border-slate-150 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                {event.category}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: #{event.id}</span>
            </div>

            <h1 className="mt-4 text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-snug">
              {event.title}
            </h1>

            {/* Description box: Compact and scrollable for very long text, keeping page height fixed */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-2">About the Event</h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto pr-2 scrollbar-thin">
                {event.description}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-400">
            Make sure to read seating terms before selecting coordinates.
          </div>
        </div>

        {/* Right Column: Transaction & Action Card (occupies 40% width / fixed w-96) */}
        <div className="w-full md:w-[380px] bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Event Image Banner */}
            <div className="w-full h-44 rounded-xl overflow-hidden mb-5 bg-slate-100 border border-slate-100 shadow-inner">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
              )}
            </div>

            {/* Logistics Grid */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <div>
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Date & Schedule</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700">
                  📅 {new Date(event.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  🕒 {new Date(event.date).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}
                </p>
              </div>
              
              <div>
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Location / Venue</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700">📍 {event.location}</p>
              </div>
            </div>
          </div>

          {/* Pricing and Action button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Ticket Price</span>
              <span className="text-2xl font-black text-slate-800">₹{event.price.toFixed(2)}</span>
            </div>
            <button
              onClick={handleRegisterClick}
              className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-bold rounded-xl shadow-md transition duration-150 text-xs text-center uppercase tracking-wider"
            >
              Select Seats & Register
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Seat Selection Modal Window */}
      <SeatSelectionModal
        isOpen={isSeatModalOpen}
        onClose={() => {
          setIsSeatModalOpen(false);
          setSelectedSeats([]);
        }}
        event={event}
        reservedSeats={reservedSeats}
        selectedSeats={selectedSeats}
        setSelectedSeats={setSelectedSeats}
        onConfirm={handleBookSeats}
      />
    </div>
  );
}

export default EventDetails;
