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
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden animate-scale-up max-h-[90vh]">
        
        {/* Left Side: Seat Layout Grid */}
        <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto bg-slate-900">
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>🎟️</span> Choose Your Seats
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Click on available seats to toggle selection. Red indicates occupied.</p>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-black px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition duration-150"
              >
                ✕ Close
              </button>
            </div>

            {/* Stage Screen representation */}
            <div className="w-full flex flex-col items-center mb-10">
              <div className="w-3/4 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_12px_40px_rgba(99,102,241,0.6)]"></div>
              <span className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase mt-3">STAGE / SCREEN VIEW</span>
            </div>

            {/* Grid Container */}
            <div className="flex flex-col gap-3.5 items-center justify-center overflow-x-auto py-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60 max-w-full">
              {rows.map((rowLabel, rIndex) => {
                return (
                  <div key={rowLabel} className="flex gap-3 items-center min-w-max">
                    {/* Row Label Left */}
                    <span className="w-6 text-center text-xs font-black text-slate-500 tracking-wider">{rowLabel}</span>
                    
                    <div className="flex gap-2.5 items-center">
                      {cols.map((colNum, cIndex) => {
                        const seatCode = `${rowLabel}-${colNum}`;
                        const seatIndex = rIndex * colsCount + cIndex;

                        // Seating Layout Mapping Algorithms:
                        const isBlocked = seatIndex >= capacity;
                        const isVIP = layout === 'VIP_FRONT' && rIndex < 2;
                        const isReserved = reservedSeats.includes(seatCode);
                        const isSelected = selectedSeats.includes(seatCode);

                        // Styling states for premium 3D look
                        let seatClass = "w-8 h-8 rounded-lg border text-[10px] font-extrabold transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 shadow-sm ";
                        
                        if (isBlocked) {
                          seatClass += "bg-slate-900 border-slate-950 text-slate-800 cursor-not-allowed select-none shadow-none hover:scale-100";
                        } else if (isReserved) {
                          seatClass += "bg-red-950/60 border-red-900/50 text-red-400 cursor-not-allowed select-none hover:scale-100";
                        } else if (isSelected) {
                          seatClass += "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]";
                        } else if (isVIP) {
                          seatClass += "bg-amber-950/40 border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500";
                        } else {
                          seatClass += "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600";
                        }

                        return (
                          <React.Fragment key={seatCode}>
                            {/* Render visual aisle space */}
                            {aisleIndex > 0 && cIndex === aisleIndex && (
                              <div className="w-8 h-8 flex items-center justify-center select-none mx-1.5">
                                <span className="text-[8px] font-black text-slate-600 tracking-[0.25em] uppercase rotate-90">AISLE</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSeatClick(seatCode, isBlocked, isReserved)}
                              disabled={isBlocked || isReserved}
                              className={seatClass}
                              title={`${isBlocked ? 'Blocked Seat' : isReserved ? 'Reserved' : isVIP ? 'VIP Seat' : 'Standard Seat'}: ${seatCode}`}
                            >
                              {isBlocked ? '·' : isReserved ? '✕' : colNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row Label Right */}
                    <span className="w-6 text-center text-xs font-black text-slate-500 tracking-wider">{rowLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Legends */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-5 justify-center text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-slate-800/40 border border-slate-700 rounded-md"></span>
              <span>Available Standard</span>
            </div>
            {layout === 'VIP_FRONT' && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-amber-950/40 border border-amber-550/40 rounded-md"></span>
                <span className="text-amber-500 font-bold">Available VIP</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md"></span>
              <span className="text-indigo-400 font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-red-950/60 border border-red-900/50 rounded-md flex items-center justify-center text-red-400 text-[8px] font-black">✕</span>
              <span className="text-red-400">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-slate-900 rounded-md flex items-center justify-center text-slate-800 text-[8px]">·</span>
              <span className="text-slate-500">Unavailable</span>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Summary Panel */}
        <div className="w-full md:w-80 bg-slate-950 p-8 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Booking Details</h4>
            <div className="space-y-5">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Selected Event</span>
                <span className="text-sm font-extrabold text-white mt-1.5 block leading-snug">{event.title}</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-inner flex justify-between items-center">
                <div>
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">Seats Chosen</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(seat => (
                        <span key={seat} className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-black rounded-md tracking-wider">
                          {seat}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs italic font-medium">No selection</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Count</span>
                  <span className="text-base font-extrabold text-white mt-1 block">{selectedSeats.length}</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3 px-1 text-sm font-medium text-slate-400">
                <div className="flex justify-between text-xs">
                  <span>Price per ticket</span>
                  <span className="font-semibold text-slate-200">₹{ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-3 text-slate-200 font-extrabold">
                  <span>Total Invoice</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-black text-xl">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={onConfirm}
              disabled={selectedSeats.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl shadow-lg disabled:shadow-none transition-all duration-150 text-sm flex items-center justify-center gap-2"
            >
              🎟️ Confirm Seats & Book
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-slate-800 hover:bg-slate-900 bg-transparent text-slate-400 font-semibold rounded-2xl text-xs transition duration-150"
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
