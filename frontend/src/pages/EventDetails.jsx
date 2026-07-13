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
  const [waitlistStatus, setWaitlistStatus] = useState({ isWaitlisted: false, position: -1, totalWaitlisted: 0 });

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Review states
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReservedSeats = async () => {
    try {
      const response = await API.get(`/registrations/event/${id}/reserved`);
      const newReserved = response.data;
      
      setSelectedSeats(prevSelected => {
        const stillAvailable = prevSelected.filter(seat => !newReserved.includes(seat));
        if (stillAvailable.length !== prevSelected.length) {
          toast.error("One or more of your selected seats have just been booked by another user! Deselecting them.");
        }
        return stillAvailable;
      });

      setReservedSeats(newReserved);
    } catch (err) {
      console.error("Failed to load reserved seats:", err);
    }
  };

  // Real-time seat updates: Poll reserved seats every 3 seconds while the seat selection modal is open
  useEffect(() => {
    let intervalId;
    if (isSeatModalOpen) {
      fetchReservedSeats();
      intervalId = setInterval(() => {
        fetchReservedSeats();
      }, 3000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSeatModalOpen, id]);

  const fetchWaitlistStatus = async () => {
    try {
      const response = await API.get(`/events/${id}/waitlist/status`);
      setWaitlistStatus(response.data);
    } catch (err) {
      console.error("Failed to load waitlist status:", err);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to join the waitlist.');
      navigate('/login');
      return;
    }
    try {
      await API.post(`/events/${id}/waitlist`);
      toast.success('Waitlist entry initialized! Redirecting to pay upfront to activate your waitlist spot...');
      setTimeout(() => {
        navigate('/my-registrations');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to join waitlist.');
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      await API.delete(`/events/${id}/waitlist`);
      toast.success('Successfully left the waitlist queue. Refund has been initiated.');
      fetchWaitlistStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to leave waitlist.');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/events/${id}/reviews`);
      setReviews(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to load reviews:", err);
      return [];
    }
  };

  const checkUserBookingAndReviewStatus = async (userEmail, reviewsList) => {
    try {
      const res = await API.get('/registrations/my');
      const bookings = res.data;
      const verified = bookings.some(b => b.event.id === parseInt(id) && b.status === 'CONFIRMED');
      setHasConfirmedBooking(verified);
      
      const userReviewExists = reviewsList.some(r => r.user?.email === userEmail);
      setHasReviewed(userReviewExists);
    } catch (err) {
      console.error("Failed to check booking/review status:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (userRating < 1 || userRating > 5) return;
    setSubmittingReview(true);
    try {
      await API.post(`/events/${id}/reviews`, {
        rating: userRating,
        comment: userComment
      });
      toast.success('Thank you for your feedback review!');
      setUserComment('');
      const updatedReviews = await fetchReviews();
      setHasReviewed(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
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
    fetchWaitlistStatus();
    fetchReviews().then((reviewsList) => {
      if (user) {
        checkUserBookingAndReviewStatus(user.email, reviewsList || []);
      }
    });
  }, [id]);

  const handleRegisterClick = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to register for events!');
      navigate('/login');
      return;
    }
    // Fetch latest reserved seats first to ensure modal opens with fresh data
    await fetchReservedSeats();
    setIsSeatModalOpen(true);
  };

  const handleBookSeats = async (couponCode, attendeesList) => {
    try {
      await API.post(`/registrations/book/${event.id}`, {
        seats: selectedSeats,
        couponCode: couponCode,
        attendees: attendeesList
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
              {reviews.length > 0 && (
                <span className="text-xs text-amber-600 font-black flex items-center gap-1">
                  ⭐ {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length})
                </span>
              )}
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
            {reservedSeats.length >= event.totalCapacity ? (
              waitlistStatus.isWaitlisted ? (
                <div className="flex-1 flex flex-col gap-1.5">
                  {waitlistStatus.isPaid ? (
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                      <span className="block text-[8px] font-black text-emerald-600 uppercase tracking-wider">Waitlist Active (Paid)</span>
                      <span className="text-[10px] font-bold text-emerald-800">
                        Position: {waitlistStatus.position > 0 ? `#${waitlistStatus.position}` : 'Processing'} of {waitlistStatus.totalWaitlisted}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-center">
                      <span className="block text-[8px] font-black text-amber-600 uppercase tracking-wider">Waitlist Queue (Unpaid)</span>
                      <span className="text-[10px] font-bold text-amber-800">Please pay from your dashboard to activate your queue spot.</span>
                    </div>
                  )}
                  <button
                    onClick={handleLeaveWaitlist}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition text-[10px] uppercase tracking-wider cursor-pointer border border-slate-200"
                  >
                    Leave Waitlist
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Queue Position Info</span>
                    <span className="text-[10px] font-bold text-slate-600">
                      Current queue: {waitlistStatus.totalWaitlisted || 0} people. You will join at position #{ (waitlistStatus.totalWaitlisted || 0) + 1 }.
                    </span>
                  </div>
                  <button
                    onClick={handleJoinWaitlist}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition duration-150 text-xs text-center uppercase tracking-wider cursor-pointer"
                  >
                    💳 Pay Upfront & Join Waitlist
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={handleRegisterClick}
                className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-bold rounded-xl shadow-md transition duration-150 text-xs text-center uppercase tracking-wider cursor-pointer"
              >
                Select Seats & Register
              </button>
            )}
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

      {/* Reviews Section */}
      <div className="mt-8 border-t border-slate-200/60 pt-8 animate-fade-in-up">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-6 text-left">
          Attendee Feedback ({reviews.length})
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Form to Write a Review */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-150 text-left">
            <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider mb-2">Write a Review</h3>
            {user ? (
              hasConfirmedBooking ? (
                hasReviewed ? (
                  <p className="text-xs text-slate-500 font-medium italic">✅ You have already submitted feedback for this event. Thank you!</p>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Rating (Stars)</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="text-lg focus:outline-none transition cursor-pointer"
                          >
                            {star <= userRating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Comments</label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Share your experience attending this event..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-700 font-medium"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-[11px] text-slate-550 font-semibold leading-relaxed">
                  🔒 Verified Purchase Required: Only registered attendees who have completed payment are eligible to leave reviews.
                </div>
              )
            ) : (
              <p className="text-xs text-slate-500 font-medium">Please <Link to="/login" className="text-indigo-600 font-bold hover:underline">login</Link> to write a verified review.</p>
            )}
          </div>

          {/* Right Column: Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-150 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-black text-slate-800">{rev.user?.name}</span>
                      <span className="block text-[9px] text-slate-450 uppercase font-mono font-bold">Verified Attendee</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{'⭐'.repeat(rev.rating)}</span>
                      <span className="text-[10px] text-slate-450 font-bold ml-1">({rev.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                  <span className="block text-[8px] text-slate-400 font-bold">
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-white py-12 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-xs font-semibold">
                ⭐ No feedback comments posted yet for this event.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetails;
