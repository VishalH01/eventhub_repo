import React, { useState, useEffect } from 'react';
import API from '../services/api';

function AdminDashboard() {
  // Check if the current user is logged in and is an admin
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  // State to hold list of events fetched from backend
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for creating/editing events
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Technology');
  const [imageUrl, setImageUrl] = useState('');

  // Form editing state
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch all events on page load
  const fetchEvents = async () => {
    try {
      // Get all events without filters to manage them
      const response = await API.get('/events');
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    }
  }, [isAdmin]);

  // Handle Create or Update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Prepare payload
    const eventPayload = {
      title,
      description,
      // Convert HTML datetime-local string to standard ISO format
      date: new Date(date).toISOString(),
      location,
      price: parseFloat(price),
      category,
      imageUrl
    };

    try {
      if (editMode) {
        // Send PUT request to update event details
        await API.put(`/events/${editingId}`, eventPayload);
        setSuccessMsg('Event updated successfully!');
      } else {
        // Send POST request to create a new event record
        await API.post('/events', eventPayload);
        setSuccessMsg('Event created successfully!');
      }

      // Reset form states and refresh events list
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to save event. Ensure all required fields are filled.');
    }
  };

  // Populate form fields for editing
  const handleEditClick = (event) => {
    setEditMode(true);
    setEditingId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
    
    // Format LocalDateTime string to match datetime-local input format (YYYY-MM-DDTHH:MM)
    if (event.date) {
      const d = new Date(event.date);
      // Offset local date timezone for the HTML input field value compatibility
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
  };

  // Handle Event Deletion
  const handleDeleteClick = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the event: "${title}"?`)) {
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await API.delete(`/events/${id}`);
      setSuccessMsg('Event deleted successfully!');
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to delete event.');
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
    setCategory('Technology');
    setImageUrl('');
  };

  // Render Access Denied if the user is not an administrator
  if (!isAdmin) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto px-4">
        <div className="p-6 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl font-medium">
          ⛔ **Access Denied**: You do not have permissions to access the administrator panel.
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h2>
        <p className="mt-2 text-slate-500">Create, edit, and delete events, and monitor platform statistics.</p>
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

      {/* Grid: Events List (Left) and Create/Edit Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Events Management Table List (Col span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-150">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Manage Event Catalog</h3>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50 text-slate-600">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 font-bold text-slate-800">{evt.title}</td>
                      <td className="py-3.5">
                        {new Date(evt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">₹{evt.price.toFixed(2)}</td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(evt)}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(evt.id, evt.title)}
                          className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 py-6 text-center">No events found. Create one on the right form.</p>
          )}
        </div>

        {/* Create / Edit Form Box (Col span 1) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-150">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            {editMode ? '✏️ Edit Event Details' : '➕ Create New Event'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                placeholder="e.g. Creative Design Session"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              >
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Music">Music</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Venue Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                placeholder="e.g. Mumbai, India"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ticket Price (INR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                placeholder="e.g. 499.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Event Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                placeholder="Write full event details here..."
              ></textarea>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm text-sm transition"
              >
                {editMode ? 'Save Changes' : 'Create Event'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
