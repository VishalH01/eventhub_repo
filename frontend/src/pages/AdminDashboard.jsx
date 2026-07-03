import React from 'react';

// Mock dashboard analytics data
const ANALYTICS = {
  totalUsers: 142,
  totalEvents: 18,
  totalRegistrations: 78,
  successfulPayments: 64,
  pendingPayments: 14,
  revenueGenerated: 34842.00
};

// Mock recent registrations list
const RECENT_REGISTRATIONS = [
  { id: 'REG-10985', user: 'Amit Kumar', event: 'Creative Design Workshop', date: 'Jul 03, 2026', status: 'Pending' },
  { id: 'REG-10932', user: 'Vishal Haramkar', event: 'National Tech Summit 2026', date: 'Jul 02, 2026', status: 'Confirmed' },
  { id: 'REG-10901', user: 'Neha Sharma', event: 'Global Music Festival', date: 'Jun 28, 2026', status: 'Confirmed' }
];

function AdminDashboard() {
  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h2>
        <p className="mt-2 text-slate-500">Overview of users, registrations, payments, and platform statistics.</p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-800">{ANALYTICS.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Events</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-800">{ANALYTICS.totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Registrations</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-800">{ANALYTICS.totalRegistrations}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">₹{ANALYTICS.revenueGenerated.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CSS-based Bar Chart section (Teaches students clean layout without heavy libraries) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150 md:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Category</h3>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1.5 font-medium">
                <span>Technology</span>
                <span className="font-bold">₹22,450 (64%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1.5 font-medium">
                <span>Music</span>
                <span className="font-bold">₹9,990 (28%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1.5 font-medium">
                <span>Design</span>
                <span className="font-bold">₹2,402 (8%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150 md:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Registrations</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Reg ID</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 text-slate-600">
                {RECENT_REGISTRATIONS.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3.5 font-mono font-medium text-slate-400">{row.id}</td>
                    <td className="py-3.5 font-bold text-slate-800">{row.user}</td>
                    <td className="py-3.5">{row.event}</td>
                    <td className="py-3.5">{row.date}</td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
