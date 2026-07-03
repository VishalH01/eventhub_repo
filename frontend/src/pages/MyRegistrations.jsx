import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Retrieve user session info from localStorage for checkout prefilling
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // 1. Dynamic Script Injection:
  // Dynamically load the Razorpay Checkout SDK script inside the document body
  // when this component mounts, and clean it up when the component unmounts.
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch user registrations initially
    fetchRegistrations();

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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

  // 2. Handle Razorpay Checkout Payment Flow
  const handlePaymentClick = async (registrationId, event) => {
    setError('');
    setSuccessMsg('');
    try {
      // Step A: Request our Spring Boot backend to initialize an order on Razorpay
      const response = await API.post(`/payments/create-order/${registrationId}`);
      const { orderId } = response.data; // Retrieve Order ID

      // Step B: Check if the backend fell back to a simulated order ID
      if (orderId.startsWith('order_simulated_')) {
        alert('[Simulation Mode] Initiating simulated payment success. Click OK to confirm.');
        
        // POST simulated confirmation details to backend verification endpoint
        await API.post(`/payments/verify/${registrationId}`, {
          razorpayOrderId: orderId,
          razorpayPaymentId: 'pay_simulated_' + Date.now(),
          razorpaySignature: 'sig_simulated_dummy_hash'
        });

        setSuccessMsg('Payment simulated successfully! Your ticket is confirmed.');
        fetchRegistrations();
      } else {
        // Step C: Trigger real Razorpay Checkout modal popup using user credentials
        if (!window.Razorpay) {
          alert('Razorpay Payment Gateway SDK failed to load. Please refresh the page.');
          return;
        }

        const options = {
          key: 'rzp_test_T95EFtiOkqEW3D', // Razorpay Test Key ID
          amount: event.price * 100,      // Amount in Paise
          currency: 'INR',
          name: 'EventHub Tickets',
          description: `Ticket Purchase for "${event.title}"`,
          order_id: orderId,              // Linked Order ID
          
          // Handler Callback function: Triggered automatically by Razorpay when payment succeeds
          handler: async function (paymentResponse) {
            try {
              // POST verification details (paymentId, orderId, signature) to Spring Boot
              await API.post(`/payments/verify/${registrationId}`, {
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature
              });

              setSuccessMsg('Payment successful! Your ticket has been confirmed.');
              fetchRegistrations(); // Refresh registrations to display QR Code
            } catch (verErr) {
              console.error(verErr);
              setError(verErr.response?.data || 'Signature verification failed. Contact support.');
            }
          },
          prefill: {
            name: user ? user.name : '',
            email: user ? user.email : ''
          },
          theme: {
            color: '#4F46E5' // Indigo color theme matching the navbar
          }
        };

        const razorpayPopup = new window.Razorpay(options);
        
        // Handle checkout failure events (e.g. payment failed / modal closed)
        razorpayPopup.on('payment.failed', function (response) {
          alert(`Payment Failed: ${response.error.description}`);
        });

        // Open checkout modal
        razorpayPopup.open();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to initialize payment gateway.');
    }
  };

  // Open a new printable viewport representing the ticket voucher card and trigger print
  const handleDownloadTicket = (reg) => {
    const printWindow = window.open('', '_blank', 'width=800,height=650');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Voucher - ${reg.registrationNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #334155; background-color: #f8fafc; }
            .ticket-card { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 30px; max-width: 500px; margin: 0 auto; background: #fff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 5px; }
            .title { font-size: 22px; font-weight: 800; color: #1e293b; margin: 15px 0 5px 0; text-align: center; }
            .meta-row { display: flex; justify-content: space-between; margin: 15px 0; font-size: 14px; }
            .meta-col { flex: 1; }
            .meta-label { font-weight: 600; color: #94a3b8; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
            .meta-val { font-weight: 700; color: #334155; margin-top: 2px; }
            .qr-sec { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
            .qr-img { width: 140px; height: 140px; border: 1px solid #e2e8f0; padding: 5px; border-radius: 8px; }
            .footer-msg { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 15px; font-weight: 500; }
            @media print {
              body { padding: 0; background: none; }
              .ticket-card { box-shadow: none; border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">
              <div class="logo">🎟️ EventHub Boarding Pass</div>
              <div style="font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase;">Ticket Status: CONFIRMED</div>
            </div>
            
            <div class="title">${reg.event.title}</div>
            
            <div class="meta-row">
              <div class="meta-col">
                <div class="meta-label">Ticket Number</div>
                <div class="meta-val">${reg.registrationNumber}</div>
              </div>
              <div class="meta-col" style="text-align: right;">
                <div class="meta-label">Attendee Name</div>
                <div class="meta-val">${user ? user.name : 'Attendee'}</div>
              </div>
            </div>
            
            <div class="meta-row">
              <div class="meta-col">
                <div class="meta-label">Event Date & Time</div>
                <div class="meta-val">${new Date(reg.event.date).toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'})}</div>
              </div>
              <div class="meta-col" style="text-align: right;">
                <div class="meta-label">Venue Location</div>
                <div class="meta-val">📍 ${reg.event.location}</div>
              </div>
            </div>

            <div class="meta-row">
              <div class="meta-col">
                <div class="meta-label">Category</div>
                <div class="meta-val">${reg.event.category}</div>
              </div>
              <div class="meta-col" style="text-align: right;">
                <div class="meta-label">Price Paid</div>
                <div class="meta-val">INR ${reg.event.price.toFixed(2)}</div>
              </div>
            </div>
            
            <div class="qr-sec">
              <img class="qr-img" src="data:image/png;base64,${reg.qrCodeBase64}" alt="Entry Pass QR" />
              <div class="footer-msg">Present this barcode at the entry gate for scanning verification.</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                        onClick={() => handlePaymentClick(reg.id, reg.event)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        Pay Now (Razorpay)
                      </button>
                      <button
                        onClick={() => handleCancelClick(reg.id, reg.event.title)}
                        className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition"
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
                    {/* Render dynamic backend-generated Base64 QR code image */}
                    <img 
                      src={`data:image/png;base64,${reg.qrCodeBase64}`} 
                      alt="Ticket QR Code" 
                      className="w-28 h-28 bg-white p-1 rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => handleDownloadTicket(reg)}
                      className="mt-3.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                    >
                      Print Ticket PDF
                    </button>
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
