import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import useAuth from '../components/useAuth';
import NotificationBell from '../components/NotificationBell';
import BottomNav from '../components/BottomNav';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `block px-4 py-3 rounded transition font-medium ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-sm'
        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-l-4 border-transparent'
    }`;

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-54 bg-white shadow-md z-10 flex-col">
        <div className="p-6 text-2xl font-black text-blue-700 border-b tracking-tight">Task<span className="text-gray-800">Flow</span></div>
        <nav className="p-4 space-y-2 flex-1">
          {user?.role === 'Admin' ? (
            <>
              <NavLink to="/admin/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/projects" className={navClass}>Projects</NavLink>
              <NavLink to="/tasks" className={navClass}>Tasks</NavLink>
              <NavLink to="/team" className={navClass}>Team</NavLink>
              <NavLink to="/admin/leave-requests" className={navClass}>Leave Requests</NavLink>
              <NavLink to="/announcements" className={navClass}>Announcements</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/member/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/projects" className={navClass}>Projects Directory</NavLink>
              <NavLink to="/tasks" className={navClass}>My Tasks</NavLink>
              <NavLink to="/announcements" className={navClass}>Announcements</NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-14 lg:h-16 flex items-center justify-between px-4 lg:px-8 z-10">

          {/* Mobile: show TaskFlow brand | Desktop: show welcome message */}
          <div className="flex items-center gap-3">
            <span className="lg:hidden text-xl font-black text-blue-700 tracking-tight">
              Task<span className="text-gray-800">Flow</span>
            </span>
            <h2 className="hidden lg:block text-xl font-bold text-gray-800 truncate">
              Welcome back, {user?.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <NotificationBell />

            {/* Mobile: Avatar + Role badge */}
            <div className="lg:hidden flex items-center">
              <div className="flex flex-col items-center gap-0.5 pb-1">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {firstLetter}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Desktop: Logout button */}
            <button
              onClick={handleLogout}
              className="hidden lg:block text-sm font-semibold bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-red-50 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-gray-50/50 no-scrollbar pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
