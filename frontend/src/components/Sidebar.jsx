import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Users,
  Megaphone,
  LogOut,
  GraduationCap,
  Settings,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = user.role === 'teacher' 
    ? [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/attendance', label: 'Attendance', icon: CalendarDays },
        { path: '/assignments', label: 'Assignments', icon: FileText },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/notices', label: 'Notices', icon: Megaphone },
        { path: '/settings', label: 'Settings', icon: Settings }
      ]
    : [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/attendance', label: 'Attendance', icon: CalendarDays },
        { path: '/assignments', label: 'Assignments', icon: FileText },
        { path: '/notices', label: 'Notices', icon: Megaphone },
        { path: '/settings', label: 'Settings', icon: Settings }
      ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 transition-transform duration-300 ease-in-out border-r glass-panel lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AttendWise</h1>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400">
                Portal: {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800/55 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Card Summary */}
        <div className="p-6 m-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white bg-indigo-600/30 text-indigo-300 border border-indigo-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold truncate text-slate-200">{user.name}</h2>
              <p className="text-xs truncate text-slate-400">{user.email}</p>
              {user.role === 'teacher' ? (
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 truncate max-w-full">
                  Subj: {user.subject}
                </span>
              ) : (
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Roll: {user.rollNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md shadow-indigo-500/10 border-l-4 border-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <IconComponent size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer/Logout */}
        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors group"
          >
            <span className="flex items-center gap-3.5">
              <LogOut size={18} />
              <span>Log Out</span>
            </span>
            <span className="text-xs text-rose-400/55 group-hover:text-rose-300/80 transition-colors">
              Exit
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
