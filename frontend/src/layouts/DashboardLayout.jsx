import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../components/useAuth';
import NotificationBell from '../components/NotificationBell';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md z-10 flex flex-col">
        <div className="p-6 text-2xl font-black text-blue-700 border-b tracking-tight">Task<span className="text-gray-800">Flow</span></div>
        <nav className="p-4 space-y-2 flex-1">
          {user?.role === 'Admin' ? (
            <>
              <a href="/admin/dashboard" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Dashboard</a>
              <a href="/projects" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Projects</a>
              <a href="/tasks" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Tasks</a>
              <a href="/team" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Team</a>
              <a href="/announcements" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Announcements</a>
            </>
          ) : (
            <>
              <a href="/member/dashboard" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Dashboard</a>
              <a href="/projects" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Projects Directory</a>
              <a href="/tasks" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">My Tasks</a>
              <a href="/announcements" className="block px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition">Announcements</a>
            </>
          )}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-0">
          <h2 className="text-xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
          <div className="flex items-center gap-6">
            
            <NotificationBell />

            <button onClick={handleLogout} className="text-sm font-semibold bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-red-50 hover:text-red-600 transition">
              Logout
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
