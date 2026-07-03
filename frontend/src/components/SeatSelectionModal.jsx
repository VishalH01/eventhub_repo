import React from 'react';

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

  // Calculate pricing
  const totalAmount = selectedSeats.length * ticketPrice;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden animate-scale-up max-h-[90vh]">
        
        {/* Left Side: Seat Layout Grid */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Select Seats</h3>
                <p className="text-xs text-slate-400 mt-1">Click on available seats to toggle selection. You can book multiple seats.</p>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 hover:bg-slate-50 rounded-lg transition"
              >
                ✕ Close
              </button>
            </div>

            {/* Stage Screen representation */}
            <div className="w-full flex flex-col items-center mb-8">
              <div className="w-2/3 h-1.5 bg-gradient-to-r from-indigo-300 via-indigo-600 to-indigo-300 rounded-full shadow-[0_4px_12px_rgba(99,102,241,0.4)]"></div>
              <span className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase mt-2">Stage / Screen</span>
            </div>

            {/* Grid Container */}
            <div className="flex flex-col gap-2.5 items-center justify-center overflow-x-auto py-2">
              {rows.map((rowLabel, rIndex) => {
                return (
                  <div key={rowLabel} className="flex gap-2 items-center min-w-max">
                    {/* Row Label Left */}
                    <span className="w-5 text-center text-xs font-black text-slate-350">{rowLabel}</span>
                    
                    <div className="flex gap-2 items-center">
                      {cols.map((colNum, cIndex) => {
                        const seatCode = `${rowLabel}-${colNum}`;
                        const seatIndex = rIndex * colsCount + cIndex;

                        // Seating Layout Mapping Algorithms:
                        const isBlocked = seatIndex >= capacity;
                        const isVIP = layout === 'VIP_FRONT' && rIndex < 2;
                        const isReserved = reservedSeats.includes(seatCode);
                        const isSelected = selectedSeats.includes(seatCode);

                        // Styling states
                        let seatClass = "border text-[10px] font-bold transition duration-100 flex items-center justify-center ";
                        
                        if (isBlocked) {
                          seatClass += "w-7 h-7 bg-slate-100/50 border-slate-100 text-slate-300 cursor-not-allowed select-none";
                        } else if (isReserved) {
                          seatClass += "w-7 h-7 bg-red-50 border-red-200 text-red-400 cursor-not-allowed select-none";
                        } else if (isSelected) {
                          seatClass += "w-7 h-7 bg-indigo-600 border-indigo-600 text-white rounded-lg cursor-pointer shadow-sm";
                        } else if (isVIP) {
                          seatClass += "w-7 h-7 bg-amber-50/60 border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg cursor-pointer";
                        } else {
                          seatClass += "w-7 h-7 bg-white border-slate-200 text-slate-650 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg cursor-pointer";
                        }

                        return (
                          <React.Fragment key={seatCode}>
                            {/* Render visual aisle space */}
                            {aisleIndex > 0 && cIndex === aisleIndex && (
                              <div className="w-6 h-7 flex items-center justify-center select-none">
                                <span className="text-[8px] font-extrabold text-slate-300 tracking-wider rotate-90">AISLE</span>
                              </div>
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
                    <span className="w-5 text-center text-xs font-black text-slate-350">{rowLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Legends */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap gap-4 justify-center text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-white border border-slate-200 rounded"></span>
              <span>Available</span>
            </div>
            {layout === 'VIP_FRONT' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-amber-50 border border-amber-250 rounded"></span>
                <span className="text-amber-750 font-bold">VIP Premium</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-indigo-600 rounded"></span>
              <span className="text-indigo-600 font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-red-50 border border-red-200 rounded flex items-center justify-center text-red-400 font-extrabold text-[8px]">•</span>
              <span className="text-red-500">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-slate-100/50 border border-slate-100 rounded flex items-center justify-center text-slate-300 text-[8px]">×</span>
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Summary Panel */}
        <div className="w-full md:w-80 bg-slate-50 p-6 border-t md:border-t-0 md:border-l border-slate-150 flex flex-col justify-between">
          <div>
            <h4 className="text-md font-bold text-slate-800 uppercase tracking-wider mb-4">Ticket Invoice</h4>
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</span>
                <span className="text-sm font-extrabold text-slate-700 mt-1 block leading-tight">{event.title}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Seats</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(seat => (
                        <span key={seat} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black rounded-md">
                          {seat}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic font-medium">No seats selected</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Count</span>
                  <span className="text-sm font-extrabold text-slate-700 mt-1 block">{selectedSeats.length}</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2 px-1 text-sm font-medium text-slate-500">
                <div className="flex justify-between">
                  <span>Price per ticket</span>
                  <span className="font-semibold text-slate-700">₹{ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-2 text-slate-800 font-bold">
                  <span>Total Amount</span>
                  <span className="text-indigo-600 font-extrabold text-lg">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button
              onClick={onConfirm}
              disabled={selectedSeats.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md disabled:shadow-none transition text-sm flex items-center justify-center gap-2"
            >
              🎟️ Confirm Seats & Book
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-slate-200 hover:bg-slate-100 bg-white text-slate-650 font-bold rounded-xl text-xs transition"
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
