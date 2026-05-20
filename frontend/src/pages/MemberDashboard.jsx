import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

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
        setProjects(projRes.data);
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
      setShowStandupModal(false);
      setYesterdayWork('');
      setTodayPlan('');
      setBlockers('');
      toast.success('Standup submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit standup');
    }
  };

  if (!stats) return <LoadingSpinner text="Loading..." />;

  const score = stats.performanceScore ?? 0;
  const scoreColor = score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-500';
  const scoreBorder = score > 0 ? 'border-green-400' : score < 0 ? 'border-red-400' : 'border-gray-400';

  const statCards = [
    { label: 'Performance Score', value: score > 0 ? `+${score}` : `${score}`, color: scoreBorder, text: scoreColor, suffix: 'pts' },
    { label: 'Assigned Projects', value: stats.assignedProjects, color: 'border-blue-400', text: 'text-blue-600' },
    { label: 'Pending Tasks', value: stats.pendingTasks + stats.inProgressTasks, color: 'border-yellow-400', text: 'text-yellow-600' },
    { label: 'Approved Tasks', value: stats.approvedTasks, color: 'border-green-400', text: 'text-green-600' },
    { label: 'Rejected Tasks', value: stats.rejectedTasks, color: 'border-red-400', text: 'text-red-600' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl lg:text-3xl font-bold text-gray-800">My Dashboard</h1>

      {/* Stat Cards — performance first, then the rest */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-l-4 ${s.color} text-center`}>
            <h3 className="text-gray-500 text-[10px] lg:text-sm font-semibold uppercase tracking-wider leading-tight">{s.label}</h3>
            <p className={`text-2xl lg:text-3xl font-bold mt-2 ${s.text}`}>
              {s.value}{s.suffix ? <span className="text-sm font-semibold ml-1">{s.suffix}</span> : null}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions — simple, no blur */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-1">Quick Actions</h2>
        <p className="text-gray-500 text-sm mb-4">Submit your daily agile updates or view your assigned tasks.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/tasks"
            className="flex-1 text-center bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
          >
            View My Tasks
          </a>
          <button
            onClick={() => setShowStandupModal(true)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
          >
            Submit Daily Standup
          </button>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-800">Recent Updates</h2>
          <a href="/notifications" className="text-sm text-blue-600 font-semibold">View All</a>
        </div>
        <MemberRecentAlerts />
      </div>

      {/* Daily Standup Modal */}
      {showStandupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto no-scrollbar mb-20 sm:mb-0">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Daily Standup</h2>
                <button onClick={() => setShowStandupModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleStandupSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Select Project</label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-white" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">What did you do yesterday?</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-20 no-scrollbar" value={yesterdayWork} onChange={e => setYesterdayWork(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">What will you do today?</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-20 no-scrollbar" value={todayPlan} onChange={e => setTodayPlan(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Any Blockers?</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={blockers} onChange={e => setBlockers(e.target.value)} placeholder="None" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowStandupModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition text-sm">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm">Submit</button>
                </div>
              </form>
            </div>
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
        <div key={a._id} className="p-3 rounded-lg border-l-4 border-blue-400 bg-blue-50 text-sm">
          <div className="flex justify-between items-start gap-2">
            <strong className="text-gray-800 text-sm truncate">{a.title}</strong>
            <span className="text-[10px] text-gray-500 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 mt-1 text-xs leading-relaxed">{a.message}</p>
        </div>
      ))}
    </div>
  );
};

export default MemberDashboard;
