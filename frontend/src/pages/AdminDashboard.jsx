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
  Settings,
  Tag,
  Activity,
  Download
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
  const [blockedSeats, setBlockedSeats] = useState(new Set());

  const toggleBlockSeat = (seatCode) => {
    setBlockedSeats(prev => {
      const next = new Set(prev);
      if (next.has(seatCode)) {
        next.delete(seatCode);
      } else {
        next.add(seatCode);
      }
      return next;
    });
  };

  // Form editing state
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Promote User State
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);

  // Tab & Data lists states
  const [activeTab, setActiveTab] = useState('events'); // Options: 'events', 'users', 'bookings'
  const [usersList, setUsersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Coupon Management State
  const [couponsList, setCouponsList] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('PERCENTAGE');
  const [couponDiscountValue, setCouponDiscountValue] = useState('');
  const [couponMinAmount, setCouponMinAmount] = useState('0');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponLimit, setCouponLimit] = useState('0');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    actionText: 'Confirm',
    isDanger: false
  });

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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await API.get('/admin/users');
      setUsersList(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch users list.');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await API.get('/admin/bookings');
      setBookingsList(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch bookings list.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;

    setPromoting(true);
    try {
      await API.post(`/admin/make-admin?email=${encodeURIComponent(promoteEmail.trim())}`);
      toast.success(`Successfully promoted ${promoteEmail} to Administrator!`);
      setPromoteEmail('');
      if (activeTab === 'users') {
        fetchUsers();
      }
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to promote user to Administrator.');
    } finally {
      setPromoting(false);
    }
  };

  const handlePromoteUser = (email) => {
    setConfirmModal({
      isOpen: true,
      title: '🛡️ Promote to Administrator',
      message: `Are you sure you want to promote ${email} to Administrator?`,
      actionText: 'Promote User',
      isDanger: false,
      onConfirm: () => executePromote(email)
    });
  };

  const executePromote = async (email) => {
    try {
      await API.post(`/admin/make-admin?email=${encodeURIComponent(email)}`);
      toast.success(`Successfully promoted ${email} to Administrator!`);
      if (activeTab === 'users') {
        fetchUsers();
      }
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to promote user to Administrator.');
    }
  };

  const handleDemoteUser = (email) => {
    setConfirmModal({
      isOpen: true,
      title: '⚠️ Revoke Administrator Access',
      message: `Are you sure you want to demote ${email} from Administrator role?`,
      actionText: 'Demote Admin',
      isDanger: true,
      onConfirm: () => executeDemote(email)
    });
  };

  const executeDemote = async (email) => {
    try {
      await API.post(`/admin/demote-admin?email=${encodeURIComponent(email)}`);
      toast.success(`Successfully demoted ${email} to regular user.`);
      if (activeTab === 'users') {
        fetchUsers();
      }
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to demote Administrator.');
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await API.get('/admin/coupons');
      setCouponsList(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch coupons from server.');
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCreatingCoupon(true);
    try {
      const payload = {
        code: couponCode.trim().toUpperCase(),
        discountType: couponDiscountType,
        discountValue: parseFloat(couponDiscountValue),
        minOrderAmount: parseFloat(couponMinAmount) || 0.0,
        expiryDate: couponExpiry ? couponExpiry + "T23:59:59" : null,
        usageLimit: parseInt(couponLimit) || 0,
        active: true
      };
      await API.post('/admin/coupons', payload);
      toast.success('Promo coupon created successfully!');
      setCouponCode('');
      setCouponDiscountValue('');
      setCouponMinAmount('0');
      setCouponExpiry('');
      setCouponLimit('0');
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || 'Failed to create promo coupon.');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = (id, code) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ Delete Coupon Code',
      message: `Are you sure you want to delete promo coupon "${code}"? This action cannot be undone.`,
      actionText: 'Delete Coupon',
      isDanger: true,
      onConfirm: async () => {
        try {
          await API.delete(`/admin/coupons/${id}`);
          toast.success('Coupon deleted successfully!');
          fetchCoupons();
        } catch (err) {
          console.error(err);
          toast.error('Failed to delete coupon.');
        }
      }
    });
  };

  const handleExportUsers = async () => {
    try {
      const res = await API.get('/admin/export/users', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Users list exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export users CSV.');
    }
  };

  const handleExportBookings = async () => {
    try {
      const res = await API.get('/admin/export/bookings', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Bookings ledger exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export bookings CSV.');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'bookings') {
        fetchBookings();
      } else if (activeTab === 'events') {
        fetchEvents();
      } else if (activeTab === 'coupons') {
        fetchCoupons();
      } else if (activeTab === 'analytics') {
        fetchBookings();
        fetchEvents();
      }
    }
  }, [activeTab, isAdmin]);

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
      totalCapacity: parseInt(totalCapacity),
      blockedSeats: Array.from(blockedSeats).join(', ')
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
    const parsedBlocked = new Set(event.blockedSeats ? event.blockedSeats.split(',').map(s => s.trim()).filter(Boolean) : []);
    setBlockedSeats(parsedBlocked);
  };

  // Handle Event Deletion
  const handleDeleteClick = (id, title) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ Delete Event Dimension',
      message: `Are you sure you want to delete the event: "${title}"? All bookings will be affected. This action is irreversible.`,
      actionText: 'Delete Event',
      isDanger: true,
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id) => {
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
    setBlockedSeats(new Set());
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
          <div 
            onClick={() => setActiveTab('bookings')}
            className={`bg-white p-5 rounded-3xl shadow-sm flex items-center gap-4 transition-all duration-205 group cursor-pointer hover:shadow-md hover:border-indigo-200 ${
              activeTab === 'bookings' ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/5' : 'border border-slate-150'
            }`}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">₹{stats.totalRevenue.toFixed(2)}</h4>
            </div>
          </div>

          {/* Card 2: Bookings */}
          <div 
            onClick={() => setActiveTab('bookings')}
            className={`bg-white p-5 rounded-3xl shadow-sm flex items-center gap-4 transition-all duration-205 group cursor-pointer hover:shadow-md hover:border-indigo-200 ${
              activeTab === 'bookings' ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/5' : 'border border-slate-150'
            }`}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats.totalRegistrations}</h4>
            </div>
          </div>

          {/* Card 3: Users */}
          <div 
            onClick={() => setActiveTab('users')}
            className={`bg-white p-5 rounded-3xl shadow-sm flex items-center gap-4 transition-all duration-205 group cursor-pointer hover:shadow-md hover:border-indigo-200 ${
              activeTab === 'users' ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/5' : 'border border-slate-150'
            }`}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Users</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats.totalUsers}</h4>
            </div>
          </div>

          {/* Card 4: Events */}
          <div 
            onClick={() => setActiveTab('events')}
            className={`bg-white p-5 rounded-3xl shadow-sm flex items-center gap-4 transition-all duration-205 group cursor-pointer hover:shadow-md hover:border-indigo-200 ${
              activeTab === 'events' ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/5' : 'border border-slate-150'
            }`}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Events</p>
              <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats.totalEvents}</h4>
            </div>
          </div>

        </div>

        {/* Tab Swapper Header */}
        <div className="flex gap-2 border-b border-slate-150 pb-px">
          {[
            { id: 'events', label: '🎟️ Events Catalog' },
            { id: 'users', label: '👥 User Base' },
            { id: 'bookings', label: '📊 Financial Bookings' },
            { id: 'coupons', label: '🏷️ Promo Coupons' },
            { id: 'analytics', label: '📈 Visual Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-extrabold border-indigo-650'
                  : 'border-transparent text-slate-400 hover:text-slate-650 hover:border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in-up">
            
            {/* Events Management Table List */}
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-indigo-650 hover:bg-indigo-55 border border-indigo-100 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(evt.id, evt.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition cursor-pointer"
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

            {/* Create / Edit Form Box */}
            <div className="space-y-6">
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
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium text-slate-700"
                      placeholder="e.g. Spring Boot Developer Conf"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-bold text-slate-705"
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
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium text-slate-700"
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

                  {/* Cover Image URL */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Cover Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium text-slate-700"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>

                  {/* Seating Layout Preset Panel */}
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

                  {/* Interactive Seating Layout Designer */}
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Seating Block Designer</span>
                    <span className="block text-[8px] text-slate-500 leading-relaxed font-semibold">
                      Click boxes below to toggle blocking seats (e.g. sound booths, staging, VIP blocks). Blocked seats will be disabled for customers.
                    </span>
                    
                    <div className="flex flex-col gap-1 p-2 bg-white rounded-xl border border-slate-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center">
                      {Array.from({ length: parseInt(seatingRows) || 6 }).map((_, rIdx) => {
                        const rowChar = String.fromCharCode(65 + rIdx); // A, B, C...
                        return (
                          <div key={rowChar} className="flex gap-1 items-center">
                            <span className="w-4 text-[9px] font-black text-slate-400 text-center">{rowChar}</span>
                            {Array.from({ length: parseInt(seatingCols) || 10 }).map((_, cIdx) => {
                              const colNum = cIdx + 1;
                              const seatCode = `${rowChar}-${colNum}`;
                              const isBlocked = blockedSeats.has(seatCode);
                              
                              // Check layout center aisle
                              const isAisle = seatingLayout === 'CENTER_AISLE' && colNum === Math.ceil(parseInt(seatingCols) / 2);
                              
                              return (
                                <React.Fragment key={seatCode}>
                                  {isAisle && (
                                    <div className="w-1.5 h-4.5 bg-slate-100/50 rounded-sm shrink-0 mx-0.5" aria-hidden="true"></div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => toggleBlockSeat(seatCode)}
                                    title={`Toggle Block: ${seatCode}`}
                                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center text-[7px] font-black transition cursor-pointer border shrink-0 ${
                                      isBlocked 
                                        ? 'bg-red-50 border-red-200 text-red-650 hover:bg-red-100'
                                        : 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {isBlocked ? '×' : colNum}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Event Description */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Event Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="4"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium text-slate-700"
                      placeholder="Write full event details here..."
                    ></textarea>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-bold rounded-xl shadow-md transition text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {editMode ? 'Save Changes' : 'Create Event'}
                    </button>
                    {editMode && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2.5 border border-slate-250 hover:bg-slate-100 bg-white text-slate-500 font-semibold rounded-xl text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in-up">
            
            {/* Users Management List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-150 flex flex-col gap-6">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Registered Attendee Base</h3>
                <button
                  onClick={handleExportUsers}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-indigo-650 hover:bg-indigo-50 border border-indigo-150 rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
              
              {usersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : usersList.length > 0 ? (
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="pb-3">User Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">System Roles</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold divide-y divide-slate-50 text-slate-650">
                      {usersList.map((usr) => {
                        const isUserAdmin = usr.roles && usr.roles.some(r => r.name === 'ROLE_ADMIN');
                        return (
                          <tr key={usr.id} className="hover:bg-slate-50/50 transition duration-150">
                            <td className="py-4 font-extrabold text-slate-800">{usr.name}</td>
                            <td className="py-4">{usr.email}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                isUserAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {isUserAdmin ? 'ADMIN' : 'USER'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {!isUserAdmin ? (
                                <button
                                  onClick={() => handlePromoteUser(usr.email)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-indigo-650 hover:bg-indigo-55 border border-indigo-150 rounded-xl transition cursor-pointer"
                                >
                                  🛡️ Promote to Admin
                                </button>
                              ) : usr.email.toLowerCase() === user?.email?.toLowerCase() ? (
                                <span className="text-[10px] font-bold text-slate-400">You (Owner)</span>
                              ) : (
                                <button
                                  onClick={() => handleDemoteUser(usr.email)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-red-650 hover:bg-red-50 border border-red-150 rounded-xl transition cursor-pointer"
                                >
                                  ⚠️ Demote Admin
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  👥 No registered users found.
                </div>
              )}
            </div>

            {/* Promote User Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-150 text-left flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                🛡️ Promote User to Admin
              </h3>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                Enter the email address of a registered user to grant them full administrator privileges instantly.
              </p>
              
              <form onSubmit={handlePromoteSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">User Email Address</label>
                  <input
                    type="email"
                    required
                    value={promoteEmail}
                    onChange={(e) => setPromoteEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs font-medium text-slate-700"
                    placeholder="user@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={promoting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-sm hover:shadow-indigo-100 transition disabled:opacity-50 text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  {promoting ? 'Promoting User...' : 'Grant Admin Role'}
                </button>
              </form>
            </div>

          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in-up">
            
            {/* Bookings Management List */}
            <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-150 flex flex-col gap-6">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Financial Transactions & Event Bookings</h3>
                <button
                  onClick={handleExportBookings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-indigo-650 hover:bg-indigo-50 border border-indigo-150 rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" /> Export Ledger
                </button>
              </div>
              
              {bookingsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : bookingsList.length > 0 ? (
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="pb-3">Booking ID</th>
                        <th className="pb-3">Attendee</th>
                        <th className="pb-3">Event Title</th>
                        <th className="pb-3">Date Booked</th>
                        <th className="pb-3">Paid Amount</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold divide-y divide-slate-50 text-slate-650">
                      {bookingsList.map((booking) => {
                        const isConfirmed = booking.status === 'CONFIRMED';
                        const isPending = booking.status === 'PENDING';
                        return (
                          <tr key={booking.id} className="hover:bg-slate-50/50 transition duration-150">
                            <td className="py-4 font-mono font-extrabold text-indigo-650">{booking.registrationNumber}</td>
                            <td className="py-4">
                              <span className="block font-extrabold text-slate-800">{booking.user?.name}</span>
                              <span className="block text-[10px] text-slate-400">{booking.user?.email}</span>
                            </td>
                            <td className="py-4 font-extrabold text-slate-800 max-w-[200px] truncate" title={booking.event?.title}>
                              {booking.event?.title}
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              {new Date(booking.registrationDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                            </td>
                            <td className="py-4 font-black text-slate-855 text-slate-800">
                              ₹{(booking.finalPrice != null ? booking.finalPrice : (booking.event?.price * (booking.seats ? booking.seats.split(',').length : 1))).toFixed(2)}
                            </td>
                            <td className="py-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isConfirmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                isPending ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {isConfirmed ? 'Paid' : booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  📊 No event bookings or payment transactions found on the platform.
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in-up">
            
            {/* Left Column: Create Coupon Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-150 text-left flex flex-col gap-6">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                🏷️ Create Promo Code
              </h3>
              <form onSubmit={handleCreateCouponSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-xs font-semibold text-slate-700 uppercase"
                    placeholder="e.g. WELCOME50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Discount Type</label>
                    <select
                      value={couponDiscountType}
                      onChange={(e) => setCouponDiscountType(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white text-xs font-bold text-slate-700"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed (INR)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={couponDiscountValue}
                      onChange={(e) => setCouponDiscountValue(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white text-xs font-semibold text-slate-700"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Minimum Booking Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponMinAmount}
                    onChange={(e) => setCouponMinAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white text-xs font-semibold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Usage Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={couponLimit}
                      onChange={(e) => setCouponLimit(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white text-xs font-semibold text-slate-700"
                      placeholder="0 for unlimited"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="date"
                      value={couponExpiry}
                      onChange={(e) => setCouponExpiry(e.target.value)}
                      className="w-full px-3.5 py-1.5 border border-slate-205 rounded-xl focus:outline-none bg-white text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingCoupon}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {creatingCoupon ? 'Creating...' : 'Save Coupon'}
                </button>
              </form>
            </div>

            {/* Right Column: Coupons Directory list */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-150 flex flex-col gap-6">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider text-left">
                Active Promo Codes Directory
              </h3>

              {couponsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : couponsList.length > 0 ? (
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="pb-3">Promo Code</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Value</th>
                        <th className="pb-3">Usage Statistics</th>
                        <th className="pb-3">Expiry Date</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold divide-y divide-slate-50 text-slate-650">
                      {couponsList.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="py-4 font-extrabold text-indigo-650 tracking-wider">🎟️ {coupon.code}</td>
                          <td className="py-4 text-[10px] uppercase font-bold text-slate-500">{coupon.discountType}</td>
                          <td className="py-4 font-bold text-slate-850">
                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                          </td>
                          <td className="py-4">
                            <span className="text-slate-700 font-bold">{coupon.currentUsage}</span>
                            <span className="text-slate-400"> / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}</span>
                          </td>
                          <td className="py-4 text-slate-505 text-slate-500">
                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                              className="p-2 text-red-500 hover:bg-red-55 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="Delete Code"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  🏷️ No promo coupons created yet.
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade-in-up">
            
            {/* Chart 1: Revenue per Event */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-150 flex flex-col gap-6 text-left">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Revenue Stream by Event</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Total revenue generated from confirmed pass sales per event.</p>
              </div>

              <div className="h-64 flex items-end justify-start gap-6 pt-6 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {bookingsList.filter(b => b.status === 'CONFIRMED').length > 0 ? (
                  (() => {
                    const eventRevenues = bookingsList.reduce((acc, bk) => {
                      if (bk.status === 'CONFIRMED' && bk.event) {
                        const price = bk.finalPrice != null ? bk.finalPrice : (bk.event.price * (bk.seats ? bk.seats.split(',').length : 1));
                        acc[bk.event.title] = (acc[bk.event.title] || 0) + price;
                      }
                      return acc;
                    }, {});
                    const maxAmount = Math.max(...Object.values(eventRevenues), 1);
                    return Object.entries(eventRevenues).map(([title, amount]) => {
                      const heightPercent = (amount / maxAmount) * 80;
                      return (
                        <div key={title} className="flex flex-col items-center group relative h-full justify-end min-w-[70px] shrink-0">
                          <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 shadow-md">
                            ₹{amount.toFixed(2)}
                          </div>
                          <div 
                            style={{ height: `${heightPercent}%` }} 
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl group-hover:from-indigo-700 group-hover:to-indigo-500 transition-all duration-300 shadow-md shadow-indigo-100"
                          ></div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider truncate w-full text-center mt-3" title={title}>
                            {title}
                          </span>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    📈 No sales data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Category Distribution */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-150 flex flex-col gap-6 text-left">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Events Categories Share</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Numerical distribution of events categorized by type.</p>
              </div>

              <div className="h-64 flex items-end justify-start gap-6 pt-6 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {events.length > 0 ? (
                  (() => {
                    const categoryCounts = events.reduce((acc, ev) => {
                      acc[ev.category] = (acc[ev.category] || 0) + 1;
                      return acc;
                    }, {});
                    const maxCount = Math.max(...Object.values(categoryCounts), 1);
                    return Object.entries(categoryCounts).map(([cat, count], idx) => {
                      const heightPercent = (count / maxCount) * 80;
                      const colors = [
                        'from-emerald-500 to-emerald-300',
                        'from-indigo-650 to-indigo-400',
                        'from-amber-500 to-amber-300',
                        'from-purple-500 to-purple-300'
                      ];
                      const colorClass = colors[idx % colors.length];
                      return (
                        <div key={cat} className="flex flex-col items-center group relative h-full justify-end w-16 shrink-0">
                          <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 shadow-md">
                            {count} Event(s)
                          </div>
                          <div 
                            style={{ height: `${heightPercent}%` }} 
                            className={`w-10 bg-gradient-to-t ${colorClass} rounded-t-xl transition-all duration-300 shadow-md`}
                          ></div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-3">
                            {cat}
                          </span>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    📊 No events categorized yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-left animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl text-xl font-bold ${
                confirmModal.isDanger ? 'bg-red-50 text-red-650' : 'bg-indigo-50 text-indigo-650'
              }`}>
                {confirmModal.isDanger ? '⚠️' : '🛡️'}
              </div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">{confirmModal.title}</h3>
            </div>
            
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              {confirmModal.message}
            </p>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-2.5 px-4 border border-slate-205 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className={`flex-1 py-2.5 px-4 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm ${
                  confirmModal.isDanger 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
