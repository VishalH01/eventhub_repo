import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import EventTicket from '../components/EventTicket';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelTargetTitle, setCancelTargetTitle] = useState('');
  const [cancelTargetDate, setCancelTargetDate] = useState(null);
  const [cancelTargetStatus, setCancelTargetStatus] = useState('');

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

        const regObj = registrations.find(r => r.id === registrationId);
        const seatCount = (regObj && regObj.seats) ? regObj.seats.split(',').length : 1;
        const totalPaiseAmount = event.price * seatCount * 100;

        const options = {
          key: 'rzp_test_T95EFtiOkqEW3D', // Razorpay Test Key ID
          amount: totalPaiseAmount,       // Amount in Paise
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
  const handleDownloadTicket = async (reg) => {
    const loadingToast = toast.loading("Generating your PDF ticket...");
    
    try {
      // 1. Dynamically load html2canvas if not already loaded
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      // 2. Dynamically load jsPDF if not already loaded
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // 3. Render the ticket layout in a hidden DOM element
      const ticketContainer = document.createElement('div');
      ticketContainer.style.position = 'absolute';
      ticketContainer.style.left = '-9999px';
      ticketContainer.style.top = '-9999px';
      ticketContainer.style.width = '850px';
      
      const hasSeats = reg.seats && reg.seats.trim().length > 0;
      const seatList = hasSeats ? reg.seats.split(',') : [];
      const seatCount = seatList.length;
      const gateVal = "G" + ((reg.id % 3) + 1);
      const rowVal = hasSeats ? [...new Set(seatList.map(s => s.split('-')[0].trim()))].join(', ') : String.fromCharCode(65 + (reg.id % 6));
      const seatVal = hasSeats ? seatList.map(s => s.split('-')[1].trim()).join(', ') : ((reg.id * 13) % 45) + 1;
      const ticketTypeVal = reg.event.price > 499 ? "VIP" : "GENERAL";
      const totalPaidPrice = reg.event.price * seatCount;

      ticketContainer.innerHTML = `
        <div style="background-color: #f8fafc; padding: 24px; display: flex; align-items: center; justify-content: center;">
          <div id="ticket-capture-target" style="width: 800px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); overflow: hidden; display: flex; flex-direction: row; font-family: system-ui, -apple-system, sans-serif;">
            
            <!-- Left section (70%) -->
            <div style="flex: 7; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                  <span style="padding: 4px 14px; font-size: 10px; font-weight: 800; color: #ffffff; background: linear-gradient(to right, #4f46e5, #7c3aed); border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.1em;">
                    Live Event
                  </span>
                  <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">
                    <span>${new Date(reg.event.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    <span style="margin: 0 4px;">•</span>
                    <span>${new Date(reg.event.date).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                </div>

                <div style="margin-top: 16px;">
                  <h3 style="margin: 0; font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.025em; line-height: 1.25;">
                    ${reg.event.title}
                  </h3>
                  <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">
                    ${reg.event.category}
                  </p>
                </div>

                <div style="margin-top: 14px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; font-weight: 700;">
                  <span>📍 ${reg.event.location}</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 24px;">
                  <div style="padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #ffffff; text-align: left;">
                    <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Gate</span>
                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 900; color: #1e293b;">${gateVal}</p>
                  </div>
                  <div style="padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #ffffff; text-align: left;">
                    <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Row</span>
                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 900; color: #1e293b;">${rowVal}</p>
                  </div>
                  <div style="padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #ffffff; text-align: left;">
                    <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Seat</span>
                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 900; color: #1e293b;">${seatVal}</p>
                  </div>
                  <div style="padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #ffffff; text-align: left;">
                    <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Type</span>
                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 900; color: #4f46e5; text-transform: uppercase;">${ticketTypeVal}</p>
                  </div>
                </div>
              </div>

              <div style="margin-top: 24px; margin-left: -24px; margin-right: -24px; margin-bottom: -24px; background-color: #0f172a; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; gap: 24px;">
                  <div>
                    <span style="display: block; font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Booking ID</span>
                    <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: #ffffff;">${reg.registrationNumber}</span>
                  </div>
                  <div>
                    <span style="display: block; font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Booking Date</span>
                    <span style="font-size: 12px; font-weight: 700; color: #ffffff;">${new Date(reg.registrationDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  </div>
                  <div>
                    <span style="display: block; font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Price</span>
                    <span style="font-size: 12px; font-weight: 900; color: #34d399;">₹${totalPaidPrice.toFixed(2)}</span>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 600; color: #94a3b8;">Thank you for registering!</span>
              </div>
            </div>

            <!-- Dashed divider -->
            <div style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 8px; background-color: #ffffff;">
              <div style="height: 100%; border-left: 2px dashed #e2e8f0;"></div>
            </div>

            <!-- Right section (30%) -->
            <div style="flex: 3; padding: 24px; background-color: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center;">
              <div>
                <span style="font-size: 10px; font-weight: 900; color: #94a3b8; letter-spacing: 0.25em; text-transform: uppercase;">Admit One</span>
              </div>
              
              <div style="margin: 16px 0; padding: 8px; background-color: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <img style="width: 112px; height: 112px; object-fit: contain;" src="data:image/png;base64,${reg.qrCodeBase64}" alt="Entry QR" />
              </div>

              <div style="width: 100%;">
                <div style="padding: 6px 12px; background-color: #f1f5f9; border-radius: 12px; display: inline-block; border: 1px solid #e2e8f0;">
                  <span style="display: block; font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Registration ID</span>
                  <span style="font-size: 10px; font-family: monospace; font-weight: 800; color: #334155;">${reg.registrationNumber}</span>
                </div>
                <div style="margin-top: 12px;">
                  <span style="display: inline-block; padding: 2px 14px; border-radius: 9999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; background-color: #ecfdf5; color: #047857; border: 1px solid #d1fae5;">
                    Paid
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;

      document.body.appendChild(ticketContainer);
      await new Promise(resolve => setTimeout(resolve, 600));

      const element = document.getElementById('ticket-capture-target');
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 320]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 800, 320);
      pdf.save(`Ticket-${reg.registrationNumber}.pdf`);

      document.body.removeChild(ticketContainer);
      toast.success("Ticket PDF downloaded successfully!", { id: loadingToast });

    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Direct PDF download failed. Falling back to print view...", { id: loadingToast });
      fallbackPrintTicket(reg);
    }
  };

  // Fallback to open new tab print view if libraries fail
  const fallbackPrintTicket = (reg) => {
    const hasSeats = reg.seats && reg.seats.trim().length > 0;
    const seatList = hasSeats ? reg.seats.split(',') : [];
    const seatCount = seatList.length;
    const gateVal = "G" + ((reg.id % 3) + 1);
    const rowVal = hasSeats ? [...new Set(seatList.map(s => s.split('-')[0].trim()))].join(', ') : String.fromCharCode(65 + (reg.id % 6));
    const seatVal = hasSeats ? seatList.map(s => s.split('-')[1].trim()).join(', ') : ((reg.id * 13) % 45) + 1;
    const ticketTypeVal = reg.event.price > 499 ? "VIP" : "GENERAL";
    const totalPaidPrice = reg.event.price * seatCount;

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
                  <h3 class="text-xl font-black text-slate-800 tracking-tight leading-snug">${reg.event.title}</h3>
                  <p class="mt-1 text-xs font-semibold text-slate-400 tracking-wide">${reg.event.category}</p>
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
                    <span class="text-xs font-black text-emerald-400">₹${totalPaidPrice.toFixed(2)}</span>
                  </div>
                </div>
                <span class="text-[10px] font-semibold text-slate-400">Thank you for registering!</span>
              </div>
            </div>
            <div class="relative flex flex-col justify-center items-center px-2 bg-white select-none">
              <div class="h-full border-l-2 border-dashed border-slate-200"></div>
            </div>
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
                  <span class="inline-block px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>
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
  const handleCancelClick = (id, eventTitle, eventDate, status) => {
    setCancelTargetId(id);
    setCancelTargetTitle(eventTitle);
    setCancelTargetDate(eventDate);
    setCancelTargetStatus(status);
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
    <div className="py-8 max-w-6xl mx-auto px-4 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-left space-y-2 animate-fade-in">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-widest">
          Attendee Hub
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Registrations</h2>
        <p className="text-slate-500 text-sm font-medium">View your ticket history, complete payments, and download entry QR passes.</p>
      </div>



      {/* Registrations List */}
      {registrations.length > 0 ? (
        <div className="space-y-8">
          {registrations.map((reg) => {
            const eventDate = new Date(reg.event.date);
            const formattedDate = eventDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
            const formattedTime = eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            
            // Check if ticket has seat selection or falls back to mock coordinates
            const isWaitlist = reg.status?.startsWith('WAITLIST') || (reg.seats && reg.seats.toLowerCase().includes('waitlist'));
            const hasSeats = reg.seats && reg.seats.trim().length > 0 && !isWaitlist;
            const seatList = hasSeats ? reg.seats.split(',') : [];
            const seatCount = isWaitlist ? 1 : seatList.length;
            const gateVal = isWaitlist ? "Waitlist" : "G" + ((reg.id % 3) + 1);
            const rowVal = isWaitlist ? "Waitlist" : (hasSeats ? [...new Set(seatList.map(s => s.split('-')[0].trim()))].join(', ') : String.fromCharCode(65 + (reg.id % 6)));
            const seatVal = isWaitlist ? "Waitlist" : (hasSeats ? seatList.map(s => s.split('-')[1].trim()).join(', ') : (((reg.id * 13) % 45) + 1).toString());
            const ticketTypeVal = reg.event.price > 499 ? "VIP" : "GENERAL";
            const totalPrice = reg.finalPrice != null ? reg.finalPrice.toString() : (reg.event.price * seatCount).toString();

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
                  price={totalPrice}
                  paymentStatus={reg.status}
                  qrImage={reg.qrCodeBase64}
                  onPrint={reg.status === 'CONFIRMED' ? () => handleDownloadTicket(reg) : null}
                />
                
                {/* Actions for Pending, Confirmed, and Waitlist Bookings */}
                {(reg.status === 'PENDING' || reg.status === 'CONFIRMED' || reg.status === 'WAITLISTED' || reg.status === 'WAITLISTED_PAID') && (
                  <div className="flex gap-2.5 justify-end max-w-4xl mx-auto px-1">
                    {(reg.status === 'PENDING' || reg.status === 'WAITLISTED') && (
                      <button
                        onClick={() => handlePaymentClick(reg.id, reg.event)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                      >
                        {reg.status === 'WAITLISTED' ? 'Pay Upfront & Join Waitlist' : 'Pay Now (Razorpay)'}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelClick(reg.id, reg.event.title, reg.event.date, reg.status)}
                      className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      {reg.status.startsWith('WAITLISTED') ? 'Leave Waitlist' : 'Cancel Booking'}
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
      {showConfirmModal && (() => {
        const getRefundPreview = () => {
          if (cancelTargetStatus === 'WAITLISTED_PAID') {
            return { pct: 95, msg: "Refund Eligible: A 95% refund will be processed automatically. A 5% platform fee will be deducted for leaving the waitlist queue." };
          }
          if (cancelTargetStatus !== 'CONFIRMED' || !cancelTargetDate) return null;
          const eventTime = new Date(cancelTargetDate).getTime();
          const now = Date.now();
          const diffHours = (eventTime - now) / (1000 * 60 * 60);

          if (diffHours > 48) {
            return { pct: 100, msg: "Refund Eligible: 100% full refund will be processed automatically." };
          } else if (diffHours >= 24) {
            return { pct: 50, msg: "Refund Eligible: 50% partial refund will be processed automatically." };
          } else {
            return { pct: 0, msg: "No Refund: Cancellations within 24 hours of the event are non-refundable." };
          }
        };
        const refundPreview = getRefundPreview();

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 text-left">
              <h3 className="text-lg font-bold text-slate-800 text-left">
                {cancelTargetStatus.startsWith('WAITLISTED') ? 'Leave Waitlist Queue' : 'Cancel Registration Booking'}
              </h3>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed text-left">
                {cancelTargetStatus.startsWith('WAITLISTED') 
                  ? `Are you sure you want to cancel your waitlist entry for "${cancelTargetTitle}"?`
                  : `Are you sure you want to cancel your booking for "${cancelTargetTitle}"? This will release your seat reservation coordinates.`
                }
              </p>
              {refundPreview && (
                <div className={`mt-3.5 p-3 rounded-xl border text-xs font-semibold leading-relaxed ${
                  refundPreview.pct >= 95 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  refundPreview.pct === 50 ? 'bg-amber-50 border-amber-100 text-amber-800' :
                  'bg-red-50 border-red-100 text-red-800'
                }`}>
                  ℹ️ {refundPreview.msg}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await executeCancel(cancelTargetId);
                  }}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {cancelTargetStatus.startsWith('WAITLISTED') ? 'Yes, Leave Waitlist' : 'Yes, Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default MyRegistrations;
