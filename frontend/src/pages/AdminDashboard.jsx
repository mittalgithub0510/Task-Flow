import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  if (!stats) return <LoadingSpinner text="Loading Admin Dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-blue-500 text-center">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Projects</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-purple-500 text-center">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Members</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-green-500 text-center">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Approved Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.approvedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-red-500 text-center">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Rejected Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.rejectedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-orange-500 text-center">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Overdue Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.overdueTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Task Status Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Pending (To Do)</span>
              <span className="font-bold text-gray-800">{stats.pendingTasks}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">In Progress</span>
              <span className="font-bold text-gray-800">{stats.inProgressTasks}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Submitted / Under Review</span>
              <span className="font-bold text-yellow-600">{stats.submittedTasks + stats.underReviewTasks}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-600">Rejected</span>
              <span className="font-bold text-red-600">{stats.rejectedTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Alerts & Actions</h2>
            <a href="/notifications" className="text-sm text-blue-600 font-semibold hover:underline">View All</a>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64 pr-2">
            <AdminRecentAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminRecentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    import('../services/notificationService').then(s => {
      s.getNotifications().then(data => setAlerts(data.slice(0, 10)));
    });
  }, []);

  if (alerts.length === 0) return <p className="text-gray-500 text-sm">No recent activity.</p>;

  return (
    <div className="space-y-3">
      {alerts.map(a => (
        <div key={a._id} className={`p-3 rounded border-l-4 ${a.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'} text-sm`}>
          <div className="flex justify-between">
            <strong className="text-gray-800 flex items-center gap-1">
              {a.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
              {a.title}
            </strong>
            <span className="text-[10px] text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 mt-1">{a.message}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
