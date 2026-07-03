import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch logged-in user's registrations from backend
  const fetchRegistrations = async () => {
    try {
      const response = await API.get('/registrations/my');
      setRegistrations(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your event registrations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle cancellation request
  const handleCancelClick = async (id, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your booking for "${eventTitle}"?`)) {
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await API.delete(`/registrations/${id}`);
      setSuccessMsg('Booking cancelled successfully!');
      fetchRegistrations(); // Refresh list
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to cancel registration.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800">My Registrations</h2>
        <p className="mt-2 text-slate-500">View your ticket history, payment status, and download attendance QR codes.</p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Registrations List */}
      {registrations.length > 0 ? (
        <div className="space-y-6">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-xl shadow-sm border border-slate-150 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              
              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-medium text-slate-400">ID: {reg.registrationNumber}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    reg.status === 'CONFIRMED' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : reg.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {reg.status}
                  </span>
                </div>
                
                {/* Event Name Link to Details */}
                <h3 className="mt-2 text-xl font-bold text-slate-800 hover:text-indigo-600 transition">
                  <Link to={`/events/${reg.event.id}`}>{reg.event.title}</Link>
                </h3>
                
                <p className="mt-1 text-sm text-slate-500">
                  📅 Event Date: {new Date(reg.event.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Booked on: {new Date(reg.registrationDate).toLocaleString()}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 items-center">
                  <span className="text-sm text-slate-700 font-medium">
                    Ticket Amount: <span className="text-slate-900 font-bold">₹{reg.event.price.toFixed(2)}</span>
                  </span>
                  
                  {/* Actions for Pending Booking */}
                  {reg.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`Redirecting to Razorpay checkout for ticket price: ₹${reg.event.price}`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-sm transition"
                      >
                        Pay Now
                      </button>
                      <button
                        onClick={() => handleCancelClick(reg.id, reg.event.title)}
                        className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded transition"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Section */}
              <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[180px]">
                {reg.status === 'CONFIRMED' ? (
                  <>
                    {/* Render visual QR Code containing the unique booking registration code */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${reg.registrationNumber}`} 
                      alt="Ticket QR Code" 
                      className="w-28 h-28 bg-white p-1 rounded-lg border border-slate-200"
                    />
                    <span className="mt-2.5 text-[10px] font-mono text-slate-400">Scan at Entry Gate</span>
                  </>
                ) : (
                  <div className="text-center p-3">
                    <span className="text-2xl">⏳</span>
                    <p className="mt-2 text-xs font-medium text-slate-500 max-w-[160px] mx-auto">
                      Awaiting payment confirmation to generate entry QR code.
                    </p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100 shadow-sm">
          <span className="text-4xl">🎟️</span>
          <p className="mt-4 text-slate-500 font-medium">You haven't registered for any events yet.</p>
          <Link
            to="/events"
            className="mt-4 inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition"
          >
            Explore Events Feed
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyRegistrations;
