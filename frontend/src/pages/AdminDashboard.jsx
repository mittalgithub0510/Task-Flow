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

  if (!stats) return <LoadingSpinner text="Loading..." />;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, color: 'border-blue-500', text: 'text-blue-600' },
    { label: 'Total Members', value: stats.totalMembers, color: 'border-purple-500', text: 'text-purple-600' },
    { label: 'Approved Tasks', value: stats.approvedTasks, color: 'border-green-500', text: 'text-green-600' },
    { label: 'Rejected Tasks', value: stats.rejectedTasks, color: 'border-red-500', text: 'text-red-600' },
    { label: 'Overdue Tasks', value: stats.overdueTasks, color: 'border-orange-500', text: 'text-orange-600' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl lg:text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-l-4 ${s.color} text-center`}>
            <h3 className="text-gray-500 text-[10px] lg:text-sm font-semibold uppercase tracking-wider leading-tight">{s.label}</h3>
            <p className={`text-2xl lg:text-3xl font-bold mt-2 ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task Status Overview */}
        <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Task Status Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending (To Do)', value: stats.pendingTasks, color: 'text-gray-800' },
              { label: 'In Progress', value: stats.inProgressTasks, color: 'text-blue-600' },
              { label: 'Submitted / Under Review', value: stats.submittedTasks + stats.underReviewTasks, color: 'text-yellow-600' },
              { label: 'Approved', value: stats.approvedTasks, color: 'text-green-600' },
              { label: 'Rejected', value: stats.rejectedTasks, color: 'text-red-600' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                <span className="text-gray-600 text-sm">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800">Recent Updates</h2>
            <a href="/notifications" className="text-sm text-blue-600 font-semibold hover:underline">View All</a>
          </div>
          <div className="overflow-y-auto max-h-60 custom-scrollbar">
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
        <div key={a._id} className={`p-3 rounded-lg border-l-4 ${a.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'} text-sm`}>
          <div className="flex justify-between items-start gap-2">
            <strong className="text-gray-800 flex items-center gap-1 min-w-0">
              {a.priority === 'high' && <span className="w-2 h-2 shrink-0 rounded-full bg-red-500 animate-pulse" />}
              <span className="truncate">{a.title}</span>
            </strong>
            <span className="text-[10px] text-gray-500 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 mt-1 text-xs leading-relaxed">{a.message}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
