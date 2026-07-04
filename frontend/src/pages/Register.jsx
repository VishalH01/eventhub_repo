import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Sparkles, User, Mail, Lock } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/register', { name, email, password });
      
      toast.success(response.data || 'Account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      const errMsg = err.response?.data || 'Something went wrong. Please try again.';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[85vh] px-4 py-12 bg-slate-50/20 overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-700"></div>

      <div className="relative z-10 w-full max-w-md bg-white border border-slate-150 p-8 rounded-3xl shadow-2xl animate-scale-up">
        {/* Title */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
            <span>Secure Registration</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400 font-medium">Sign up to choose live seats and manage payments.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
                placeholder="Vishal Haramkar"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-650 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition duration-150 disabled:opacity-50 text-xs uppercase tracking-wider mt-5"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-450 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-indigo-650 hover:underline">
            Login instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
