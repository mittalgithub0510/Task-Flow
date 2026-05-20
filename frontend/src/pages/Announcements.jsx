import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../components/useAuth';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { title, message, priority, visibleTo: 'all' });
      setTitle('');
      setMessage('');
      fetchAnnouncements();
      toast.success('Announcement posted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Company Announcements</h2>

      {user?.role === 'Admin' && (
        <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Post New Announcement</h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1.5 text-sm font-medium">Title</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1.5 text-sm font-medium">Message</label>
              <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-24" value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1.5 text-sm font-medium">Priority</label>
              <select className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-white" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
              Post Announcement
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-gray-500 italic text-center py-10">No announcements posted yet.</p>
        )}
        {announcements.map(ann => (
          <div
            key={ann._id}
            className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${
              ann.priority === 'high' ? 'border-red-500' : ann.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-base lg:text-xl font-bold text-gray-800 break-words">{ann.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded shrink-0 ${
                    ann.priority === 'high' ? 'bg-red-100 text-red-700' : ann.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {ann.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{ann.message}</p>
                <p className="text-xs text-gray-400 mt-3">Posted: {new Date(ann.createdAt).toLocaleString()}</p>
              </div>
              {user?.role === 'Admin' && (
                <button
                  onClick={() => handleDelete(ann._id)}
                  className="text-red-500 hover:text-red-700 font-bold text-sm shrink-0 py-1"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
