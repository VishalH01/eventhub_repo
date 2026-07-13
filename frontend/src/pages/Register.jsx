import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Sparkles, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score; // Max 5
  };

  const getStrengthMeta = (pwd) => {
    const score = getPasswordStrength(pwd);
    if (score === 0) return { label: 'None', color: 'bg-slate-200', text: 'text-slate-400', width: 'w-0' };
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/3' };
    if (score <= 4) return { label: 'Medium', color: 'bg-orange-500', text: 'text-orange-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: 'w-full' };
  };

  const generateStrongPassword = () => {
    const length = 14;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "@$!%*?&#";
    
    let chars = [];
    chars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
    chars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    chars.push(numbers[Math.floor(Math.random() * numbers.length)]);
    chars.push(symbols[Math.floor(Math.random() * symbols.length)]);
    
    const all = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }
    
    chars = chars.sort(() => 0.5 - Math.random());
    const generated = chars.join('');
    
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    
    navigator.clipboard.writeText(generated);
    toast.success("Strong password generated and copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Full Name Character-Only Validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      toast.error("Full Name must contain only alphabets and spaces!");
      return;
    }

    // 2. Trusted Email Domain Check
    const trustedDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com", "aol.com", "zoho.com"];
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain || !trustedDomains.includes(emailDomain)) {
      toast.error("Registration is only allowed for trusted domains (gmail, outlook, yahoo, hotmail, icloud, aol, zoho)!");
      return;
    }

    // 3. Strong Password Validation Check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

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
      // Check for structured validation error map returned from Spring Boot
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorsMap = err.response.data;
        const firstError = Object.values(errorsMap)[0];
        toast.error(firstError);
      } else {
        const errMsg = err.response?.data || 'Something went wrong. Please try again.';
        toast.error(typeof errMsg === 'string' ? errMsg : 'Connection to server failed.');
      }
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
      toast.error(err.response?.data || "Google SSO authentication failed.");
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
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: btnWidth, text: "signup_with" }
        );
      } catch (err) {
        console.error("Google script init failed:", err);
      }
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-[85vh] px-4 py-12 bg-slate-50/20 overflow-hidden animate-fade-in-up">
      
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
                placeholder="Jane Doe"
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
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-[9px] font-extrabold text-indigo-655 hover:underline cursor-pointer"
              >
                Suggest Password
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
            
            {/* Real-time Strength Meter & Recommendations */}
            {password && (
              <div className="mt-2.5 space-y-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                  <span className="text-slate-400">Password Strength</span>
                  <span className={getStrengthMeta(password).text}>{getStrengthMeta(password).label}</span>
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getStrengthMeta(password).color} ${getStrengthMeta(password).width} transition-all duration-300`}></div>
                </div>

                <div className="pt-1 space-y-1">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Requirements:</span>
                  {[
                    { label: "At least 8 characters", valid: password.length >= 8 },
                    { label: "An uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
                    { label: "A lowercase letter (a-z)", valid: /[a-z]/.test(password) },
                    { label: "A number (0-9)", valid: /[0-9]/.test(password) },
                    { label: "A special character (e.g. @, -, /, $)", valid: /[^a-zA-Z0-9]/.test(password) }
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium">
                      <span className={c.valid ? "text-green-600 font-extrabold" : "text-slate-300"}>
                        {c.valid ? "✓" : "○"}
                      </span>
                      <span className={c.valid ? "text-slate-500 line-through decoration-slate-350" : "text-slate-500"}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-655 transition cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-150"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-slate-400 font-black tracking-widest">Or Sign Up With</span></div>
        </div>

        <div className="flex justify-center">
          <div id="google-signup-btn"></div>
        </div>

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
