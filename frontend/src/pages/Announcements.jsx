import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../components/useAuth';

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { title, message, priority, visibleTo: 'all' });
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement');
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
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Announcements</h2>
      
      {user?.role === 'Admin' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold mb-4">Post New Announcement</h3>
          <form onSubmit={handleCreateAnnouncement}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title</label>
              <input type="text" className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea className="w-full p-2 border rounded" value={message} onChange={e => setMessage(e.target.value)} required></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Priority</label>
              <select className="w-full p-2 border rounded" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Post Announcement</button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann._id} className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${ann.priority === 'high' ? 'border-red-500' : ann.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'} flex justify-between items-start`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-800">{ann.title}</h3>
                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${ann.priority === 'high' ? 'bg-red-100 text-red-700' : ann.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {ann.priority} Priority
                </span>
              </div>
              <p className="text-gray-600">{ann.message}</p>
              <p className="text-xs text-gray-400 mt-4">Posted: {new Date(ann.createdAt).toLocaleString()}</p>
            </div>
            {user?.role === 'Admin' && (
              <button onClick={() => handleDelete(ann._id)} className="text-red-500 hover:text-red-700 font-bold">
                Delete
              </button>
            )}
          </div>
        ))}
        {announcements.length === 0 && <p className="text-gray-500 italic">No announcements posted yet.</p>}
      </div>
    </div>
  );
};

export default Announcements;
