import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

function SeatSelectionModal({
  isOpen,
  onClose,
  event,
  reservedSeats = [],
  selectedSeats = [],
  setSelectedSeats,
  onConfirm
}) {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const [attendeeDetails, setAttendeeDetails] = useState({});
  
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (selectedSeats.length > 0 && user) {
      const firstSeat = selectedSeats[0];
      setAttendeeDetails(prev => {
        if (!prev[firstSeat]?.name) {
          return {
            ...prev,
            [firstSeat]: {
              name: user.name,
              email: user.email
            }
          };
        }
        return prev;
      });
    }
  }, [selectedSeats]);

  const handleAttendeeChange = (seat, field, value) => {
    setAttendeeDetails(prev => ({
      ...prev,
      [seat]: {
        ...prev[seat],
        [field]: value
      }
    }));
  };

  const rowsCount = event.seatingRows || 6;
  const colsCount = event.seatingCols || 10;
  const capacity = event.totalCapacity || 60;
  const layout = event.seatingLayout || 'STANDARD';
  const ticketPrice = event.price || 0;

  // Toggle seat selection
  const handleSeatClick = (seatCode, isBlocked, isReserved) => {
    if (isBlocked || isReserved) return;

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatCode));
    } else {
      setSelectedSeats(prev => [...prev, seatCode]);
    }
  };

  // Generate grid rows and cols
  const rows = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...
  const cols = Array.from({ length: colsCount }, (_, i) => i + 1); // 1, 2, 3...

  // Check if center aisle index
  const aisleIndex = layout === 'CENTER_AISLE' ? Math.floor(colsCount / 2) : -1;

  // Calculate dynamic seat pricing: 1.5x multiplier for VIP seats
  const calculateSeatPrice = (seatCode) => {
    const isVIP = layout === 'VIP_FRONT' && (seatCode.charCodeAt(0) - 65) < 2;
    return isVIP ? ticketPrice * 1.5 : ticketPrice;
  };

  const vipSeatsSelected = selectedSeats.filter(seat => layout === 'VIP_FRONT' && (seat.charCodeAt(0) - 65) < 2);
  const standardSeatsSelected = selectedSeats.filter(seat => !(layout === 'VIP_FRONT' && (seat.charCodeAt(0) - 65) < 2));
  
  const totalAmount = selectedSeats.reduce((sum, seat) => sum + calculateSeatPrice(seat), 0);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError('');
    try {
      const res = await API.get(`/coupons/validate?code=${encodeURIComponent(couponInput.trim().toUpperCase())}&amount=${totalAmount}`);
      setAppliedCoupon(res.data);
      toast.success(`Promo code applied: ₹${res.data.discountAmount.toFixed(2)} off!`);
    } catch (err) {
      console.error(err);
      setCouponError(err.response?.data || 'Failed to validate promo code.');
      setAppliedCoupon(null);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = totalAmount - discountAmount;

  return (
    <div className="fixed inset-0 bg-transparent md:bg-slate-900/30 z-[100] flex items-center justify-center p-3 md:p-4 transition-all duration-300 outline-none focus:outline-none">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-6xl w-[98%] md:w-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden animate-scale-up max-h-[95vh] md:max-h-[85vh] mx-auto my-auto outline-none focus:outline-none">
        
        {/* Left Side: Seat Layout Grid */}
        <div className="w-full md:flex-1 p-4 md:p-8 flex flex-col justify-between overflow-y-visible md:overflow-y-auto bg-white md:min-h-0 min-w-0 shrink-0 md:shrink">
          <div>
            <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <span>🎟️</span> Choose Your Seats
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1 font-medium">Click on available seats to toggle selection. Red indicates occupied.</p>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 text-[10px] md:text-xs font-bold px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition duration-150"
              >
                ✕ Close
              </button>
            </div>

            {/* Stage Screen representation */}
            <div className="w-full flex flex-col items-center mb-6 md:mb-10">
              <div className="w-3/4 h-1.5 md:h-2 bg-gradient-to-r from-indigo-300 via-indigo-655 to-indigo-300 bg-indigo-600 rounded-full shadow-[0_4px_16px_rgba(99,102,241,0.25)]"></div>
              <span className="text-[9px] md:text-[10px] font-black text-indigo-500 tracking-[0.3em] md:tracking-[0.4em] uppercase mt-2.5">STAGE / SCREEN VIEW</span>
            </div>

            {/* Grid Container */}
            <div className="flex flex-col gap-1.5 md:gap-3 items-start md:items-center justify-start md:justify-center overflow-x-auto py-2 md:py-4 bg-slate-50/50 p-2 sm:p-4 md:p-6 rounded-2xl border border-slate-150 max-w-full w-full">
              {rows.map((rowLabel, rIndex) => {
                return (
                  <div key={rowLabel} className="flex gap-2 md:gap-3 items-center min-w-max">
                    {/* Row Label Left */}
                    <span className="w-5 text-center text-[10px] md:text-xs font-black text-slate-400 tracking-wider shrink-0">{rowLabel}</span>
                    
                    <div className="flex gap-1.5 md:gap-2.5 items-center">
                      {cols.map((colNum, cIndex) => {
                        const seatCode = `${rowLabel}-${colNum}`;
                        const seatIndex = rIndex * colsCount + cIndex;

                        // Seating Layout Mapping Algorithms:
                        const dbBlockedList = event.blockedSeats ? event.blockedSeats.split(',').map(s => s.trim()) : [];
                        const isBlocked = seatIndex >= capacity || dbBlockedList.includes(seatCode);
                        const isVIP = layout === 'VIP_FRONT' && rIndex < 2;
                        const isReserved = reservedSeats.includes(seatCode);
                        const isSelected = selectedSeats.includes(seatCode);

                        // Styling states for premium look
                        let seatClass = "w-6.5 h-6.5 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg border text-[7.5px] sm:text-[10px] md:text-[11px] font-extrabold transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 shadow-sm shrink-0 ";
                        
                        if (isBlocked) {
                          seatClass += "bg-slate-100/50 border-slate-100 text-slate-300 cursor-not-allowed select-none shadow-none hover:scale-100";
                        } else if (isReserved) {
                          seatClass += "bg-red-500 border-red-650 text-white cursor-not-allowed select-none hover:scale-100";
                        } else if (isSelected) {
                          seatClass += "bg-indigo-600 border-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]";
                        } else if (isVIP) {
                          seatClass += "bg-amber-50/60 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300";
                        } else {
                          seatClass += "bg-white border-slate-200 text-slate-650 hover:bg-indigo-50 hover:border-indigo-200";
                        }

                        return (
                          <React.Fragment key={seatCode}>
                            {/* Render visual aisle space */}
                            {aisleIndex > 0 && cIndex === aisleIndex && (
                              <div className="w-2.5 sm:w-6 md:w-8 h-6.5 sm:h-8 md:h-9 flex items-center justify-center select-none shrink-0" aria-hidden="true" />
                            )}

                            <button
                              type="button"
                              onClick={() => handleSeatClick(seatCode, isBlocked, isReserved)}
                              disabled={isBlocked || isReserved}
                              className={seatClass}
                              title={`${isBlocked ? 'Blocked Seat' : isReserved ? 'Reserved' : isVIP ? 'VIP Seat' : 'Standard Seat'}: ${seatCode}`}
                            >
                              {isBlocked ? '×' : isReserved ? '•' : colNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row Label Right */}
                    <span className="w-5 text-center text-[10px] md:text-xs font-black text-slate-400 tracking-wider shrink-0">{rowLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Legends */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex flex-wrap gap-3 md:gap-5 justify-center text-[10px] md:text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-white border border-slate-200 rounded-md"></span>
              <span>Available Standard</span>
            </div>
            {layout === 'VIP_FRONT' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-amber-50 border border-amber-250 rounded-md"></span>
                <span className="text-amber-700 font-bold">Available VIP</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-indigo-600 rounded-md"></span>
              <span className="text-indigo-600 font-bold">Selected</span>
            </div>
             <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-red-500 border border-red-600 rounded-md flex items-center justify-center text-white text-[8px] font-black">•</span>
              <span className="text-red-600 font-bold">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-slate-100/50 border border-slate-100 rounded-md flex items-center justify-center text-slate-350 text-[8px]">×</span>
              <span className="text-slate-400">Unavailable</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Divider */}
        <hr className="border-t border-slate-200/60 my-2 md:hidden w-[92%] mx-auto" />

        {/* Right Side: Booking Summary Panel */}
        <div className="w-full md:w-80 bg-slate-50/70 p-5 md:p-8 md:border-l border-slate-150 flex flex-col justify-between shrink-0">
          <div>
            <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6">Booking Details</h4>
            <div className="space-y-4 md:space-y-5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Selected Event</span>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 mt-1 block leading-snug">{event.title}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex justify-between items-center">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">Seats Chosen</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(seat => (
                        <span key={seat} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black rounded-md tracking-wider">
                          {seat}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic font-medium">No selection</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Count</span>
                  <span className="text-sm md:text-base font-extrabold text-slate-700 mt-1 block">{selectedSeats.length}</span>
                </div>
              </div>

              {/* Guest Attendee Details Section */}
              {selectedSeats.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3 max-h-48 overflow-y-auto pr-1 text-left">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">Attendee Details</span>
                  {selectedSeats.map((seat, idx) => (
                    <div key={seat} className="space-y-1.5 border-t border-slate-100 pt-2 first:border-0 first:pt-0">
                      <span className="text-[9px] font-black text-indigo-600 block">Seat {seat} {idx === 0 ? "(Primary)" : `(Guest ${idx})`}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={attendeeDetails[seat]?.name || ''}
                          onChange={(e) => handleAttendeeChange(seat, 'name', e.target.value)}
                          className="px-2.5 py-1 text-[10px] border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white w-full"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email"
                          value={attendeeDetails[seat]?.email || ''}
                          onChange={(e) => handleAttendeeChange(seat, 'email', e.target.value)}
                          className="px-2.5 py-1 text-[10px] border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

               {/* Promo Code Coupon Field */}
               {selectedSeats.length > 0 && (
                 <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-left space-y-2">
                   <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">Promo Code Discount</span>
                   {appliedCoupon ? (
                     <div className="flex justify-between items-center bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100">
                       <span className="text-[10px] font-black text-indigo-700 tracking-wider">🎟️ {appliedCoupon.code} APPLIED</span>
                       <button
                         onClick={handleRemoveCoupon}
                         className="text-[9px] font-black text-red-650 hover:underline uppercase cursor-pointer"
                       >
                         Remove
                       </button>
                     </div>
                   ) : (
                     <div className="space-y-1">
                       <div className="flex gap-2">
                         <input
                           type="text"
                           value={couponInput}
                           onChange={(e) => setCouponInput(e.target.value)}
                           placeholder="WELCOME50"
                           className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-xs font-semibold text-slate-700 uppercase"
                         />
                         <button
                           onClick={handleApplyCoupon}
                           disabled={applying}
                           className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-sm transition uppercase tracking-wider cursor-pointer"
                         >
                           {applying ? 'Applying...' : 'Apply'}
                         </button>
                       </div>
                       {couponError && (
                         <span className="text-[9px] font-bold text-red-500 block px-1">⚠️ {couponError}</span>
                       )}
                     </div>
                   )}
                 </div>
               )}

               {/* Price Details */}
               <div className="space-y-2 md:space-y-3 px-1 text-xs md:text-sm font-medium text-slate-500">
                 <div className="flex justify-between text-[11px] md:text-xs">
                   <span>Base Ticket Price</span>
                   <span className="font-semibold text-slate-700">₹{ticketPrice.toFixed(2)}</span>
                 </div>
                 {vipSeatsSelected.length > 0 && (
                   <div className="flex justify-between text-[11px] md:text-xs text-amber-600 font-bold">
                     <span>{vipSeatsSelected.length} × VIP Seat(s) (1.5x)</span>
                     <span>₹{(vipSeatsSelected.length * ticketPrice * 1.5).toFixed(2)}</span>
                   </div>
                 )}
                 {standardSeatsSelected.length > 0 && (
                   <div className="flex justify-between text-[11px] md:text-xs text-slate-500">
                     <span>{standardSeatsSelected.length} × Standard Seat(s)</span>
                     <span>₹{(standardSeatsSelected.length * ticketPrice).toFixed(2)}</span>
                   </div>
                 )}
                 {appliedCoupon && (
                   <div className="flex justify-between text-[11px] md:text-xs text-emerald-600 font-bold">
                     <span>Coupon Discount ({appliedCoupon.code})</span>
                     <span>-₹{discountAmount.toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between border-t border-slate-200/80 pt-2.5 md:pt-3 text-slate-800 font-extrabold">
                   <span>Total Invoice</span>
                   <span className={appliedCoupon ? "text-slate-400 line-through text-xs font-semibold" : "text-indigo-650 text-indigo-600 font-black text-lg md:text-xl"}>
                     ₹{totalAmount.toFixed(2)}
                   </span>
                 </div>
                 {appliedCoupon && (
                   <div className="flex justify-between pt-1 text-slate-800 font-extrabold border-t border-slate-100">
                     <span>Net Payable</span>
                     <span className="text-indigo-650 text-indigo-600 font-black text-lg md:text-xl">
                       ₹{finalPrice.toFixed(2)}
                     </span>
                   </div>
                 )}
               </div>
             </div>
           </div>
 
           <div className="mt-6 md:mt-8 space-y-2 md:space-y-3">
             <button
               onClick={() => {
                 const attendeesList = selectedSeats.map(seat => ({
                   seatCode: seat,
                   name: attendeeDetails[seat]?.name || '',
                   email: attendeeDetails[seat]?.email || ''
                 }));
                 const incomplete = attendeesList.some(a => !a.name.trim() || !a.email.trim());
                 if (incomplete) {
                   toast.error('Please enter a name and email for all selected seats!');
                   return;
                 }
                 onConfirm(appliedCoupon ? appliedCoupon.code : '', attendeesList);
               }}
               disabled={selectedSeats.length === 0}
               className="w-full py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-750 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-md disabled:shadow-none transition-all duration-150 text-xs md:text-sm flex items-center justify-center gap-2"
             >
               🎟️ Confirm Seats & Book
             </button>
             <button
               onClick={onClose}
               className="w-full py-2 border border-slate-200 hover:bg-slate-100 bg-white text-slate-500 font-semibold rounded-2xl text-[10px] md:text-xs transition duration-150"
             >
               Cancel Selection
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SeatSelectionModal;
