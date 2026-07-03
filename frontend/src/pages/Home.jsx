import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Hero Header */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
        Manage & Discover <br />
        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Amazing Local Events
        </span>
      </h1>
      
      {/* Subtitle */}
      <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed">
        Welcome to the Event Management Platform. Explore upcoming events, secure your entry with integrated payments, and instantly receive attendance QR codes.
      </p>
      
      {/* CTA Buttons */}
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Link
          to="/events"
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out"
        >
          Explore Events
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 shadow-sm hover:bg-slate-50 transition duration-150 ease-in-out"
        >
          Create Account
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition duration-150">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">📅</div>
          <h3 className="text-lg font-bold text-slate-800">Browse Events</h3>
          <p className="mt-2 text-slate-500 text-sm">Find events of your choice by searching and filtering through multiple categories.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition duration-150">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">💳</div>
          <h3 className="text-lg font-bold text-slate-800">Secure Payments</h3>
          <p className="mt-2 text-slate-500 text-sm">Complete registrations securely with the integrated Razorpay payment gateway.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition duration-150">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">🎟️</div>
          <h3 className="text-lg font-bold text-slate-800">Instant Tickets</h3>
          <p className="mt-2 text-slate-500 text-sm">Download your registration details with a uniquely generated attendance QR code.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
