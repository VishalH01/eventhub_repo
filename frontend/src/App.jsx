import React from 'react';
// BrowserRouter as Router: Uses the browser's history API to keep our UI in sync with the URL.
// Routes: A container for all the individual Route paths in our app.
// Route: Defines a mapping between a specific URL path and the React component it should render.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our custom Layout wrapper
import Layout from './components/Layout';

// Import our page components
import Home from './pages/Home';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    // Wrap the entire application in the Router so routing functions work anywhere inside it.
    <Router>
      {/* The Layout component wraps every page, providing a consistent Navbar and Footer */}
      <Layout>
        {/* Routes will match the current browser URL and render the corresponding element */}
        <Routes>
          {/* '/' is the default root path, rendering our landing Home page */}
          <Route path="/" element={<Home />} />
          
          {/* '/events' is the path to browse and search all events */}
          <Route path="/events" element={<Events />} />
          
          {/* '/login' and '/register' render auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* '/my-registrations' lets a user see their tickets & QR codes */}
          <Route path="/my-registrations" element={<MyRegistrations />} />
          
          {/* '/admin' is the dashboard where admins view analytics and manage events */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
