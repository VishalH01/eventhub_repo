import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Ticket, 
  Users, 
  Calendar,
  Grid,
  MapPin,
  Clock,
  Sparkles,
  Settings
} from 'lucide-react';

function AdminDashboard() {
  // Check if the current user is logged in and is an admin
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // State to hold list of events fetched from backend
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0.0
  });

  // Form states for creating/editing events
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tech');
  const [imageUrl, setImageUrl] = useState('');

  // Seating configuration states
  const [seatingLayout, setSeatingLayout] = useState('STANDARD');
  const [seatingRows, setSeatingRows] = useState('6');
  const [seatingCols, setSeatingCols] = useState('10');
  const [totalCapacity, setTotalCapacity] = useState('60');

  // Form editing state
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch all events on page load
  const fetchEvents = async () => {
    try {
      const response = await API.get('/events');
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch events from server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch dashboard metrics.');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
      fetchStats();
    }
  }, [isAdmin]);

  // Handle Create or Update submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventPayload = {
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      price: parseFloat(price),
      category,
      imageUrl,
      seatingLayout,
      seatingRows: parseInt(seatingRows),
      seatingCols: parseInt(seatingCols),
      totalCapacity: parseInt(totalCapacity)
    };

    try {
      if (editMode) {
        await API.put(`/events/${editingId}`, eventPayload);
        toast.success('Event updated successfully!');
      } else {
        await API.post('/events', eventPayload);
        toast.success('Event created successfully!');
      }

      // Reset form states and refresh events list & stats counters
      resetForm();
      fetchEvents();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to save event. Ensure all fields are valid.');
    }
  };

  // Populate form fields for editing
  const handleEditClick = (event) => {
    setEditMode(true);
    setEditingId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
    
    if (event.date) {
      const d = new Date(event.date);
      const pad = (num) => String(num).padStart(2, '0');
      const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setDate(formattedDate);
    } else {
      setDate('');
    }
    
    setLocation(event.location);
    setPrice(event.price.toString());
    setCategory(event.category);
    setImageUrl(event.imageUrl || '');
    setSeatingLayout(event.seatingLayout || 'STANDARD');
    setSeatingRows((event.seatingRows || 6).toString());
    setSeatingCols((event.seatingCols || 10).toString());
    setTotalCapacity((event.totalCapacity || 60).toString());
  };

  // Handle Event Deletion
  const handleDeleteClick = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the event: "${title}"?`)) {
      return;
    }
    try {
      await API.delete(`/events/${id}`);
      toast.success('Event deleted successfully!');
      fetchEvents();
      fetchStats(); // Update stats counts
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to delete event.');
    }
  };

  // Clear form fields and cancel editMode
  const resetForm = () => {
    setEditMode(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setPrice('');
    setCategory('Tech');
    setImageUrl('');
    setSeatingLayout('STANDARD');
    setSeatingRows('6');
    setSeatingCols('10');
    setTotalCapacity('60');
  };

  if (!isAdmin) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto px-4 animate-scale-up">
        <div className="p-6 bg-red-50 border border-red-150 text-red-700 rounded-3xl font-bold text-sm">
          ⛔ Access Denied: You do not have permissions to access the administrator panel.
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 relative animate-fade-in-up">

      <div className="relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-left space-y-2 animate-fade-in">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <Settings className="w-3 h-3 text-indigo-650 animate-spin" />
            <span>Admin Console</span>
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Management Dashboard</h2>
          <p className="text-slate-500 text-sm font-medium">Create and edit event dimensions, configure seating grids, and monitor platform metrics.</p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">₹{stats.totalRevenue.toFixed(2)}</h4>
            </div>
          </div>

          {/* Card 2: Bookings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats.totalRegistrations}</h4>
            </div>
          </div>

          {/* Card 3: Users */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Users</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats.totalUsers}</h4>
            </div>
          </div>

          {/* Card 4: Events */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Events</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats.totalEvents}</h4>
            </div>
          </div>

        </div>

        {/* Grid: Events List (Left) and Create/Edit Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Events Management Table List (Col span 2) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-150 flex flex-col gap-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Manage Event Catalog</h3>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : events.length > 0 ? (
              <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold divide-y divide-slate-50 text-slate-650">
                    {events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4 font-extrabold text-slate-800 max-w-[200px] truncate" title={evt.title}>{evt.title}</td>
                        <td className="py-4 whitespace-nowrap">
                          {new Date(evt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                            {evt.category}
                          </span>
                        </td>
                        <td className="py-4 font-black text-slate-850">₹{evt.price.toFixed(2)}</td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(evt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-indigo-650 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(evt.id, evt.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                🎟️ No events found. Create one using the form on the right.
              </div>
            )}
          </div>

          {/* Create / Edit Form Box (Col span 1) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-150 text-left flex flex-col gap-6">
            <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">
              {editMode ? '✏️ Edit Event Details' : '➕ Create New Event'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium"
                  placeholder="e.g. Spring Boot Developer Conf"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-bold text-slate-700"
                >
                  <option value="Tech">Tech</option>
                  <option value="Design">Design</option>
                  <option value="Music">Music</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-semibold text-slate-700"
                />
              </div>

              {/* Venue Location */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Venue Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium"
                  placeholder="e.g. Mumbai Convention Hall"
                />
              </div>

              {/* Ticket Price */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Ticket Price (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-semibold text-slate-750"
                  placeholder="e.g. 499.00"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Cover Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              {/* Seating Layout Configuration Panel */}
              <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                <div className="col-span-2 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Seating Layout Preset</label>
                  <select
                    value={seatingLayout}
                    onChange={(e) => setSeatingLayout(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-[11px] text-slate-700 font-bold"
                  >
                    <option value="STANDARD">Standard Seating</option>
                    <option value="VIP_FRONT">VIP Front Rows</option>
                    <option value="CENTER_AISLE">Center Walkway Aisle</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Rows (Max 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={seatingRows}
                    onChange={(e) => setSeatingRows(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-xs font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Cols (Max 12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={seatingCols}
                    onChange={(e) => setSeatingCols(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-xs font-semibold text-slate-700"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Seating Capacity (N)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-xs font-semibold text-slate-700"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Event Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium"
                  placeholder="Write full event details here..."
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-bold rounded-xl shadow-md transition text-xs uppercase tracking-wider"
                >
                  {editMode ? 'Save Changes' : 'Create Event'}
                </button>
                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-slate-250 hover:bg-slate-100 bg-white text-slate-500 font-semibold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
