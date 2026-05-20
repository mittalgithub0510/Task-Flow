import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from './useAuth';
import { useState, useEffect } from 'react';
import * as notificationService from '../services/notificationService';

const BottomNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count } = await notificationService.getNotificationCount();
        setUnread(count);
      } catch (_) {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItem = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all ${
      isActive ? 'text-blue-600' : 'text-gray-400'
    }`;

  const dashboardPath = user?.role === 'Admin' ? '/admin/dashboard' : '/member/dashboard';
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl flex items-center justify-around px-1 safe-area-bottom">

        <NavLink to={dashboardPath} className={navItem}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>

        <NavLink to="/projects" className={navItem}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] font-semibold">Projects</span>
        </NavLink>

        <NavLink to="/tasks" className={navItem}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-[10px] font-semibold">Tasks</span>
        </NavLink>

        <NavLink to="/notifications" className={navItem}>
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Alerts</span>
        </NavLink>

        <button onClick={() => setShowMenu(true)} className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      {/* Slide-up Menu Drawer */}
      {showMenu && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl overflow-hidden">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Profile block */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {firstLetter}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 font-medium truncate">{user?.role} · {user?.email}</p>
              </div>
            </div>

            {/* Logout button — full width below profile */}
            <div className="px-5 pb-3 border-b border-gray-100">
              <button
                onClick={() => { logout(); navigate('/login'); setShowMenu(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold bg-red-50 hover:bg-red-100 transition"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Nav Links */}
            <div className="px-4 py-3 space-y-1 pb-6">
              {user?.role === 'Admin' && (
                <>
                  <DrawerLink to="/team" label="Team" close={() => setShowMenu(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </DrawerLink>
                  <DrawerLink to="/admin/leave-requests" label="Leave Requests" close={() => setShowMenu(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </DrawerLink>
                  <DrawerLink to="/projects/create" label="Create Project" close={() => setShowMenu(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </DrawerLink>
                  <DrawerLink to="/tasks/create" label="Create Task" close={() => setShowMenu(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </DrawerLink>
                </>
              )}
              <DrawerLink to="/announcements" label="Announcements" close={() => setShowMenu(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              </DrawerLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DrawerLink = ({ to, label, close, children }) => (
  <NavLink
    to={to}
    onClick={close}
    className={({ isActive }) =>
      `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition ${
        isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
      }`
    }
  >
    <span className="text-gray-500">{children}</span>
    <span className="text-sm">{label}</span>
  </NavLink>
);

export default BottomNav;
