import React from 'react';
import Navbar from './Navbar';

// Layout receives a special prop called 'children' which represents the page currently being loaded by the router.
function Layout({ children }) {
  return (
    // min-h-screen ensures the layout occupies at least 100% of the viewport height.
    // flex and flex-col allow the footer to stay pinned to the bottom of the page if the page content is short.
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Include our global Navbar (Sticky Floating Wrapper) */}
      <div className="w-full pt-4 sticky top-0 z-50 px-4">
        <Navbar />
      </div>

      {/* Main Content Area */}
      {/* flex-grow tells this main container to take up all remaining available vertical space */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-150 py-6 text-center text-sm text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} EventHub Platform. Built for assessment & educational learning.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
