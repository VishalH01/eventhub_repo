import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  DoorOpen, 
  Star, 
  CalendarDays,
  Clock
} from 'lucide-react';

// Reusable Professional Event Ticket Component
// Fits approximately a 3:1 aspect ratio on desktop with cutouts and dashed ticket stubs.
function EventTicket({
  eventName = "Spring Boot Developer Conference 2026",
  eventType = "Full Stack Java • React • Spring Boot",
  venue = "Mumbai Convention Center",
  date = "12 July 2026",
  time = "09:30 AM",
  gate = "A2",
  row = "B",
  seat = "15",
  ticketType = "VIP",
  bookingId = "EVT202600001",
  registrationId = "REG2026000123",
  price = "999.00",
  paymentStatus = "CONFIRMED",
  qrImage = "", // Base64 String from backend
  onPrint = null // Click handler for printing
}) {

  // Dynamic colors for payment status badges
  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'WAITLISTED_PAID':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'WAITLISTED':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
        return 'Paid';
      case 'WAITLISTED':
        return 'Waitlist Unpaid';
      case 'WAITLISTED_PAID':
        return 'Waitlist Active';
      default:
        return status;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition duration-300">
      
      {/* ===================================================================
          LEFT SECTION: MAIN TICKET (~70% Width)
          =================================================================== */}
      <div className="flex-[7] p-6 flex flex-col justify-between relative bg-gradient-to-br from-white to-slate-50/30">
        
        {/* Abstract design wave element in the left background */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Top Badge & Subtitle Line */}
          <div className="flex items-center justify-between gap-4">
            <span className="px-3.5 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full uppercase tracking-widest shadow-sm">
              Live Event
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <span>{date}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{time}</span>
            </div>
          </div>

          {/* Event Title & Subtitle */}
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
              {eventName}
            </h3>
            <p className="mt-1 text-xs md:text-sm font-semibold text-slate-400 tracking-wide">
              {eventType}
            </p>
          </div>

          {/* Location Pin */}
          <div className="mt-3.5 flex items-center gap-2 text-xs md:text-sm text-slate-600 font-bold">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{venue}</span>
          </div>

          {/* Seating & Logistics Information Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            
            {/* Grid 1: Gate */}
            <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 hover:shadow-md transition group">
              <div className="flex items-center gap-1.5 text-slate-400">
                <DoorOpen className="w-3.5 h-3.5 group-hover:text-indigo-500 transition" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Gate</span>
              </div>
              <p className="mt-1 text-sm md:text-base font-black text-slate-800">{gate}</p>
            </div>

            {/* Grid 2: Row */}
            <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 hover:shadow-md transition group">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Star className="w-3.5 h-3.5 group-hover:text-indigo-500 transition" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Row</span>
              </div>
              <p className="mt-1 text-sm md:text-base font-black text-slate-800">{row}</p>
            </div>

            {/* Grid 3: Seat */}
            <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 hover:shadow-md transition group">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Ticket className="w-3.5 h-3.5 group-hover:text-indigo-500 transition" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Seat</span>
              </div>
              <p className={`mt-1 text-slate-800 ${seat.length > 8 ? 'text-[10px] font-black leading-tight' : 'text-sm md:text-base font-black'}`}>
                {seat}
              </p>
            </div>

            {/* Grid 4: Ticket Type */}
            <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 hover:shadow-md transition group">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Star className="w-3.5 h-3.5 group-hover:text-indigo-500 transition" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Type</span>
              </div>
              <p className="mt-1 text-sm md:text-base font-black text-slate-800 text-indigo-600 uppercase">{ticketType}</p>
            </div>

          </div>
        </div>

        {/* Bottom Information Bar: Navy Background */}
        <div className="mt-6 -mx-6 -mb-6 bg-slate-900 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booking ID</span>
              <span className="text-xs font-mono font-bold text-white">{bookingId}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booking Date</span>
              <span className="text-xs font-bold text-white">{date}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
              <span className="text-xs font-black text-emerald-400">₹{parseFloat(price).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-slate-400 tracking-wide hidden sm:inline">
              Thank you for registering!
            </span>
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition"
              >
                Print Pass
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ===================================================================
          RESPONSIVE TICKET DIVIDER: Dashed line + Punched Cutout holes
          =================================================================== */}
      <div className="relative flex flex-row md:flex-col justify-center items-center py-2 md:py-0 md:px-2 bg-slate-50 md:bg-white select-none">
        
        {/* Horizontal Dashed divider for Mobile, Vertical for Desktop */}
        <div className="w-full md:w-0 md:h-full border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-200"></div>

        {/* Cutout punch holes: Adapt automatically to horizontal vs vertical flow */}
        {/* Top / Left Cutout */}
        <div className="absolute 
          -top-3 left-1/2 -translate-x-1/2 md:top-1/2 md:-left-3.5 md:-translate-y-1/2 md:translate-x-0
          w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-50 border border-slate-200/80 shadow-inner z-10"></div>
        
        {/* Bottom / Right Cutout */}
        <div className="absolute 
          -bottom-3 left-1/2 -translate-x-1/2 md:bottom-1/2 md:-right-3.5 md:-translate-y-1/2 md:translate-x-0 md:top-auto
          w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-50 border border-slate-200/80 shadow-inner z-10"></div>
      </div>

      {/* ===================================================================
          RIGHT SECTION: TICKET STUB (~30% Width)
          =================================================================== */}
      <div className="flex-[3] p-6 bg-slate-50/50 flex flex-col justify-between items-center text-center relative">
        
        {/* Abstract pattern element in the right background */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-violet-50/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Admit One Header label */}
        <div>
          <span className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase">
            Admit One
          </span>
        </div>

        {/* QR Code Frame */}
        <div className="my-4 p-2 bg-white rounded-2xl border border-slate-150 shadow-md">
          {qrImage ? (
            <img 
              src={`data:image/png;base64,${qrImage}`} 
              alt="Entry QR Code" 
              className="w-28 h-28 object-contain"
            />
          ) : (
            <div className="w-28 h-28 bg-slate-100 rounded-lg flex flex-col items-center justify-center gap-1">
              <span className="text-2xl text-slate-300">⏳</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Code</span>
            </div>
          )}
        </div>

        {/* Registration ID Badge */}
        <div className="w-full">
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl inline-block border border-slate-200/60">
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Registration ID</span>
            <span className="text-[10px] font-mono font-extrabold text-slate-700">{registrationId}</span>
          </div>

          {/* Payment Status Indicator */}
          <div className="mt-3">
            <span className={`inline-block px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(paymentStatus)}`}>
              {getStatusLabel(paymentStatus)}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default EventTicket;
