import React, { useState } from 'react';
// useNavigate is a react-router-dom hook that allows us to redirect users programmatically (e.g. after login success).
import { Link, useNavigate } from 'react-router-dom';
// Import our pre-configured Axios API client instance
import API from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Track error messages received from the backend API
  const [error, setError] = useState('');
  // Track loading status to disable buttons while processing
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // POST the user credentials to our backend login endpoint
      const response = await API.post('/auth/login', { email, password });
      
      // Save the JWT token returned by the server into the browser's localStorage.
      // Our Axios interceptor in api.js will read this token automatically for future API requests.
      localStorage.setItem('token', response.data.accessToken);
      
      // Save user profile info (name, email, roles) to localStorage so the frontend can
      // easily personalize the UI (like displaying "Welcome, Vishal" or showing Admin Dashboard link).
      localStorage.setItem('user', JSON.stringify({
        email: response.data.email,
        name: response.data.name,
        roles: response.data.roles
      }));

      // Redirect the user to the home page on successful login
      navigate('/');
      
      // Force page reload to refresh the Navbar state (shows logout button instead of login)
      window.location.reload();
    } catch (err) {
      // Extract the error message returned from the backend (if any) and set it in state
      const errMsg = err.response?.data || 'Invalid email or password!';
      setError(typeof errMsg === 'string' ? errMsg : 'Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-150 p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage and register for events.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
