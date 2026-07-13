import React, { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { X, Mail, Lock, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';

function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // Steps: 1 = Email, 2 = OTP, 3 = New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const getStrengthMeta = (pwd) => {
    const score = getPasswordStrength(pwd);
    if (score === 0) return { label: 'None', color: 'bg-slate-200', text: 'text-slate-400', width: 'w-0' };
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/3' };
    if (score <= 4) return { label: 'Medium', color: 'bg-orange-500', text: 'text-orange-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-555', width: 'w-full' };
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
    
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    
    navigator.clipboard.writeText(generated);
    toast.success("Strong password generated and copied to clipboard!");
  };

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data || "Failed to send reset code. Verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      toast.success("OTP verified! You can now reset your password.");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data || "Invalid or expired OTP!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    // Strong Password Validation Check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      toast.error("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      toast.success("Password reset successfully! Please log in.");
      // Reset form states and close modal
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setStep(1);
      onClose();
    } catch (err) {
      toast.error(err.response?.data || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[110] flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
            <Key className="w-3 h-3 text-indigo-500" />
            <span>Password Recovery</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Reset Password</h3>
          <p className="text-xs text-slate-400 font-medium">
            {step === 1 && "Enter your email address to receive a 6-digit OTP code."}
            {step === 2 && "Enter the verification code sent to your email address."}
            {step === 3 && "Create a new strong password for your account."}
          </p>
        </div>

        {/* Step 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition disabled:opacity-50 text-xs uppercase tracking-wider mt-4"
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Input OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">One-Time Password (OTP)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition duration-150 font-medium text-center tracking-[0.25em]"
                  placeholder="123456"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition disabled:opacity-50 text-xs uppercase tracking-wider mt-4"
            >
              {loading ? 'Verifying Code...' : 'Verify Code'}
            </button>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-indigo-650 hover:underline"
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Input New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">New Password</label>
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Password Strength Meter & Recommendations */}
              {newPassword && (
                <div className="mt-2.5 space-y-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">Password Strength</span>
                    <span className={getStrengthMeta(newPassword).text}>{getStrengthMeta(newPassword).label}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${getStrengthMeta(newPassword).color} ${getStrengthMeta(newPassword).width} transition-all duration-300`}></div>
                  </div>

                  <div className="pt-1 space-y-1">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Requirements:</span>
                    {[
                      { label: "At least 8 characters", valid: newPassword.length >= 8 },
                      { label: "An uppercase letter (A-Z)", valid: /[A-Z]/.test(newPassword) },
                      { label: "A lowercase letter (a-z)", valid: /[a-z]/.test(newPassword) },
                      { label: "A number (0-9)", valid: /[0-9]/.test(newPassword) },
                      { label: "A special character (e.g. @, -, /, $)", valid: /[^a-zA-Z0-9]/.test(newPassword) }
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium">
                        <span className={c.valid ? "text-green-650 font-extrabold" : "text-slate-300"}>
                          {c.valid ? "✓" : "○"}
                        </span>
                        <span className={c.valid ? "text-slate-500 line-through decoration-slate-350" : "text-slate-550"}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirm New Password</label>
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
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-650 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition disabled:opacity-50 text-xs uppercase tracking-wider mt-4"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
