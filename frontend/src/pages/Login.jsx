import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        email: response.data.email,
        name: response.data.name,
        roles: response.data.roles
      }));

      toast.success(`Welcome back, ${response.data.name}!`);
      
      // Hold navigation briefly so user sees the success checkmark
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      const errMsg = err.response?.data || 'Invalid email or password!';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/google-login', { idToken: response.credential });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        email: res.data.email,
        name: res.data.name,
        roles: res.data.roles
      }));
      toast.success(`Logged in with Google! Welcome, ${res.data.name}!`);
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data || "Google SSO Login failed!");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    /* global google */
    if (window.google) {
      try {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "619077271424-9bmlhph8b34m4clrt2jpltr928k6lktn.apps.googleusercontent.com",
          callback: handleGoogleLogin
        });
        const btnWidth = Math.max(200, Math.min(window.innerWidth - 96, 280));
        google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          { theme: "outline", size: "large", width: btnWidth, text: "signin_with" }
        );
      } catch (err) {
        console.error("Google script init failed:", err);
      }
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-[80vh] px-4 py-12 bg-slate-50/20 overflow-hidden animate-fade-in-up">
      
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-700"></div>

      <div className="relative z-10 w-full max-w-md bg-white border border-slate-150 p-8 rounded-3xl shadow-2xl animate-scale-up">
        {/* Title */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
            <span>Secure Authentication</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 font-medium">Sign in to manage events and access your entry tickets.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Email Address</label>
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
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-[10px] font-extrabold text-indigo-650 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-655 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-650 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition duration-150 disabled:opacity-50 text-xs uppercase tracking-wider mt-6"
          >
            {loading ? 'Verifying Account...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-150"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-slate-400 font-black tracking-widest">Or Sign In With</span></div>
        </div>

        <div className="flex justify-center">
          <div id="google-login-btn"></div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-450 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-extrabold text-indigo-650 hover:underline">
            Register here
          </Link>
        </div>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
      </div>
    </div>
  );
}

export default Login;
