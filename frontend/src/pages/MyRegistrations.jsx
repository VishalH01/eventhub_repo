import React from 'react';

// Mock registrations list to show details on this page
const MOCK_REGISTRATIONS = [
  {
    registrationId: 'REG-10932',
    uniqueCode: 'EVT-SUMMIT-2026-X992A',
    eventName: 'National Tech Summit 2026',
    eventDate: 'August 15, 2026',
    status: 'Confirmed', // Confirmed after successful payment
    paymentId: 'pay_Njks883hda902',
    amount: 499.00,
    qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=REG-10932|VishalHaramkar|NationalTechSummit2026|August15,2026'
  },
  {
    registrationId: 'REG-10985',
    uniqueCode: 'EVT-DESIGN-2026-Y883B',
    eventName: 'Creative Design Workshop',
    eventDate: 'September 02, 2026',
    status: 'Pending', // Awaiting payment
    paymentId: 'N/A',
    amount: 299.00,
    qrPlaceholder: null
  }
];

function MyRegistrations() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800">My Registrations</h2>
        <p className="mt-2 text-slate-500">View your ticket history, payment status, and download attendance QR codes.</p>
      </div>

      {/* Registrations List */}
      {MOCK_REGISTRATIONS.length > 0 ? (
        <div className="space-y-6">
          {MOCK_REGISTRATIONS.map((reg) => (
            <div key={reg.registrationId} className="bg-white rounded-xl shadow-sm border border-slate-150 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              
              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-medium text-slate-400">ID: {reg.registrationId}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    reg.status === 'Confirmed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {reg.status}
                  </span>
                </div>
                
                <h3 className="mt-2 text-xl font-bold text-slate-800">{reg.eventName}</h3>
                <p className="mt-1 text-sm text-slate-500">📅 Date: {reg.eventDate}</p>
                <p className="mt-1 text-xs text-slate-400">Transaction ID: {reg.paymentId}</p>

                <div className="mt-4 text-sm text-slate-700 font-medium">
                  Amount Paid: <span className="text-slate-900 font-bold">₹{reg.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[180px]">
                {reg.status === 'Confirmed' && reg.qrPlaceholder ? (
                  <>
                    <img 
                      src={reg.qrPlaceholder} 
                      alt="Ticket QR Code" 
                      className="w-28 h-28 bg-white p-1 rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => alert(`Downloading ticket details for: ${reg.registrationId}`)}
                      className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Download Ticket PDF
                    </button>
                  </>
                ) : (
                  <div className="text-center p-3">
                    <span className="text-2xl">⏳</span>
                    <p className="mt-2 text-xs font-medium text-slate-500">Awaiting payment verification to generate QR code.</p>
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
        </div>
      )}
    </div>
  );
}

export default MyRegistrations;
