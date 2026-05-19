import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MemberDashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  // Standup Modal States
  const [showStandupModal, setShowStandupModal] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [yesterdayWork, setYesterdayWork] = useState('');
  const [todayPlan, setTodayPlan] = useState('');
  const [blockers, setBlockers] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/member');
        setStats(data);
        
        const projRes = await api.get('/projects');
        setProjects(projRes.data.filter(p => p.members?.some(m => m._id === data.userId || true))); // Load projects for dropdown
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  const handleStandupSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/standups', { projectId, yesterdayWork, todayPlan, blockers });
      alert('Standup submitted successfully!');
      setShowStandupModal(false);
      setYesterdayWork('');
      setTodayPlan('');
      setBlockers('');
    } catch (err) {
      alert('Failed to submit standup');
    }
  };

  if (!stats) return <LoadingSpinner text="Loading Member Dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Assigned Projects</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.assignedProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Pending Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingTasks + stats.inProgressTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Approved Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.approvedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Rejected Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.rejectedTasks}</p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-800 mb-1">Quick Actions</h2>
          <p className="text-blue-600 text-sm">Submit your daily agile updates or view your assigned tasks.</p>
        </div>
        <div className="flex gap-4">
          <a href="/tasks" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
            View My Tasks
          </a>
          <button onClick={() => setShowStandupModal(true)} className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition shadow-sm">
            Submit Daily Standup
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Updates & Announcements</h2>
          <a href="/notifications" className="text-sm text-blue-600 font-semibold hover:underline">View All</a>
        </div>
        <MemberRecentAlerts />
      </div>

      {/* Daily Standup Modal */}
      {showStandupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">Daily Standup</h2>
            <form onSubmit={handleStandupSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Select Project</label>
                <select className="w-full p-2 border rounded" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">What did you do yesterday?</label>
                <textarea className="w-full p-2 border rounded h-20" value={yesterdayWork} onChange={e => setYesterdayWork(e.target.value)} required></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">What will you do today?</label>
                <textarea className="w-full p-2 border rounded h-20" value={todayPlan} onChange={e => setTodayPlan(e.target.value)} required></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Any Blockers?</label>
                <input type="text" className="w-full p-2 border rounded" value={blockers} onChange={e => setBlockers(e.target.value)} placeholder="None" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowStandupModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition">Submit Standup</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MemberRecentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    import('../services/notificationService').then(s => {
      s.getNotifications().then(data => setAlerts(data.slice(0, 5)));
    });
  }, []);

  if (alerts.length === 0) return <p className="text-gray-500 text-sm">No recent updates.</p>;

  return (
    <div className="space-y-3">
      {alerts.map(a => (
        <div key={a._id} className="p-3 rounded border-l-4 border-blue-500 bg-blue-50 text-sm">
          <div className="flex justify-between">
            <strong className="text-gray-800 flex items-center gap-1">{a.title}</strong>
            <span className="text-[10px] text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 mt-1">{a.message}</p>
        </div>
      ))}
    </div>
  );
};

export default MemberDashboard;
