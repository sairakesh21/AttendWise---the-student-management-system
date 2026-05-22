import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 glass-panel lg:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-white">AttendWise</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800/65"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 scrollbar-thin">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
