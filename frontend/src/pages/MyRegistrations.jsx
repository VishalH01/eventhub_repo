import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import EventTicket from '../components/EventTicket';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelTargetTitle, setCancelTargetTitle] = useState('');

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
      toast.error('Failed to load your event registrations from server.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Razorpay Checkout Payment Flow
  const handlePaymentClick = async (registrationId, event) => {
    try {
      // Step A: Request our Spring Boot backend to initialize an order on Razorpay
      const response = await API.post(`/payments/create-order/${registrationId}`);
      const { orderId } = response.data; // Retrieve Order ID

      // Step B: Check if the backend fell back to a simulated order ID
      if (orderId.startsWith('order_simulated_')) {
        toast.loading('Confirming simulated transaction...', { id: 'payment' });
        
        // POST simulated confirmation details to backend verification endpoint
        const verifyRes = await API.post(`/payments/verify/${registrationId}`, {
          razorpayOrderId: orderId,
          razorpayPaymentId: 'pay_simulated_' + Date.now(),
          razorpaySignature: 'sig_simulated_dummy_hash'
        });

        toast.success('Payment simulated successfully! Your ticket is confirmed.', { id: 'payment' });
        // Update React registrations state list immediately with the updated record returned from backend
        setRegistrations(prev => prev.map(reg => reg.id === registrationId ? { ...reg, status: 'CONFIRMED', qrCodeBase64: verifyRes.data.qrCodeBase64 } : reg));
      } else {
        // Step C: Trigger real Razorpay Checkout modal popup using user credentials
        if (!window.Razorpay) {
          toast.error('Razorpay Payment Gateway SDK failed to load. Please refresh the page.');
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
              const verifyRes = await API.post(`/payments/verify/${registrationId}`, {
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature
              });

              toast.success('Payment successful! Your ticket has been confirmed.');
              // Update React registrations state list immediately with the updated record returned from backend
              setRegistrations(prev => prev.map(reg => reg.id === registrationId ? { ...reg, status: 'CONFIRMED', qrCodeBase64: verifyRes.data.qrCodeBase64 } : reg));
            } catch (verErr) {
              console.error(verErr);
              toast.error(verErr.response?.data || 'Signature verification failed. Contact support.');
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
          toast.error(`Payment Failed: ${response.error.description}`);
        });

        // Open checkout modal
        razorpayPopup.open();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to initialize payment gateway.');
    }
  };

  // Open a new printable viewport representing the ticket voucher card and trigger print
  const handleDownloadTicket = (reg) => {
    const gateVal = "G" + ((reg.id % 3) + 1);
    const rowVal = String.fromCharCode(65 + (reg.id % 6));
    const seatVal = ((reg.id * 13) % 45) + 1;
    const ticketTypeVal = reg.event.price > 499 ? "VIP" : "GENERAL";

    const printWindow = window.open('', '_blank', 'width=1000,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Pass - ${reg.registrationNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { background: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 20px; }
            }
          </style>
        </head>
        <body class="bg-slate-50 p-8 flex items-center justify-center min-h-screen">
          
          <div class="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-row">
            
            <!-- Left section (70%) -->
            <div class="flex-[7] p-6 flex flex-col justify-between relative bg-gradient-to-br from-white to-slate-50/30">
              <div>
                <div class="flex items-center justify-between gap-4">
                  <span class="px-3.5 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full uppercase tracking-widest shadow-sm">
                    Live Event
                  </span>
                  <div class="text-xs text-slate-400 font-medium">
                    <span>${new Date(reg.event.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    <span class="mx-1">•</span>
                    <span>${new Date(reg.event.date).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                </div>

                <div class="mt-4">
                  <h3 class="text-xl font-black text-slate-800 tracking-tight leading-snug">
                    ${reg.event.title}
                  </h3>
                  <p class="mt-1 text-xs font-semibold text-slate-400 tracking-wide">
                    ${reg.event.category}
                  </p>
                </div>

                <div class="mt-3.5 flex items-center gap-2 text-xs text-slate-600 font-bold">
                  <span>📍 ${reg.event.location}</span>
                </div>

                <div class="grid grid-cols-4 gap-3 mt-6">
                  <div class="p-3 rounded-xl border border-slate-100 bg-white">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gate</span>
                    <p class="mt-0.5 text-sm font-black text-slate-800">${gateVal}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-slate-100 bg-white">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Row</span>
                    <p class="mt-0.5 text-sm font-black text-slate-800">${rowVal}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-slate-100 bg-white">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seat</span>
                    <p class="mt-0.5 text-sm font-black text-slate-800">${seatVal}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-slate-100 bg-white">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
                    <p class="mt-0.5 text-sm font-black text-indigo-600 uppercase">${ticketTypeVal}</p>
                  </div>
                </div>
              </div>

              <div class="mt-6 -mx-6 -mb-6 bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div class="flex gap-x-6">
                  <div>
                    <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booking ID</span>
                    <span class="text-xs font-mono font-bold text-white">${reg.registrationNumber}</span>
                  </div>
                  <div>
                    <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booking Date</span>
                    <span class="text-xs font-bold text-white">${new Date(reg.registrationDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  </div>
                  <div>
                    <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
                    <span class="text-xs font-black text-emerald-400">₹${reg.event.price.toFixed(2)}</span>
                  </div>
                </div>
                <span class="text-[10px] font-semibold text-slate-400">Thank you for registering!</span>
              </div>
            </div>

            <!-- Dashed divider -->
            <div class="relative flex flex-col justify-center items-center px-2 bg-white select-none">
              <div class="h-full border-l-2 border-dashed border-slate-200"></div>
              <div class="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80"></div>
              <div class="absolute bottom-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80"></div>
            </div>

            <!-- Right section (30%) -->
            <div class="flex-[3] p-6 bg-slate-50/50 flex flex-col justify-between items-center text-center">
              <div>
                <span class="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase">Admit One</span>
              </div>
              
              <div class="my-4 p-2 bg-white rounded-2xl border border-slate-150 shadow-md">
                <img class="w-28 h-28 object-contain" src="data:image/png;base64,${reg.qrCodeBase64}" alt="Entry QR" />
              </div>

              <div class="w-full">
                <div class="px-3 py-1.5 bg-slate-100 rounded-xl inline-block border border-slate-200/60">
                  <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Registration ID</span>
                  <span class="text-[10px] font-mono font-extrabold text-slate-700">${reg.registrationNumber}</span>
                </div>
                <div class="mt-3">
                  <span class="inline-block px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Paid
                  </span>
                </div>
              </div>
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

  // Handle cancellation request via custom modal
  const handleCancelClick = (id, eventTitle) => {
    setCancelTargetId(id);
    setCancelTargetTitle(eventTitle);
    setShowConfirmModal(true);
  };

  const executeCancel = async (id) => {
    try {
      await API.delete(`/registrations/${id}`);
      toast.success('Booking cancelled successfully!');
      fetchRegistrations(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to cancel registration.');
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



      {/* Registrations List */}
      {registrations.length > 0 ? (
        <div className="space-y-8">
          {registrations.map((reg) => {
            const eventDate = new Date(reg.event.date);
            const formattedDate = eventDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
            const formattedTime = eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            
            // Generate deterministic mock seatings for design requirements
            const gateVal = "G" + ((reg.id % 3) + 1);
            const rowVal = String.fromCharCode(65 + (reg.id % 6));
            const seatVal = ((reg.id * 13) % 45) + 1;
            const ticketTypeVal = reg.event.price > 499 ? "VIP" : "GENERAL";

            return (
              <div key={reg.id} className="space-y-3">
                <EventTicket
                  eventName={reg.event.title}
                  eventType={reg.event.category}
                  venue={reg.event.location}
                  date={formattedDate}
                  time={formattedTime}
                  gate={gateVal}
                  row={rowVal}
                  seat={seatVal}
                  ticketType={ticketTypeVal}
                  bookingId={reg.registrationNumber}
                  registrationId={reg.registrationNumber}
                  price={reg.event.price.toString()}
                  paymentStatus={reg.status}
                  qrImage={reg.qrCodeBase64}
                  onPrint={reg.status === 'CONFIRMED' ? () => handleDownloadTicket(reg) : null}
                />
                
                {/* Actions for Pending Booking */}
                {reg.status === 'PENDING' && (
                  <div className="flex gap-2.5 justify-end max-w-4xl mx-auto px-1">
                    <button
                      onClick={() => handlePaymentClick(reg.id, reg.event)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      Pay Now (Razorpay)
                    </button>
                    <button
                      onClick={() => handleCancelClick(reg.id, reg.event.title)}
                      className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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

      {/* Glassmorphic Centered Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800">Cancel Registration Booking</h3>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed">
              Are you sure you want to cancel your booking for <strong className="text-slate-800">"{cancelTargetTitle}"</strong>? This will release your seat reservation.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition"
              >
                No, Keep Booking
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await executeCancel(cancelTargetId);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRegistrations;
