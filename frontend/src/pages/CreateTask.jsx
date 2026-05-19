import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await api.get('/projects');
        setProjects(projRes.data);
        const userRes = await api.get('/users');
        setUsers(userRes.data.filter(u => u.role === 'Member'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!projectId || !assignedTo) {
      alert("Please select a project and a member.");
      return;
    }
    try {
      await api.post('/tasks', { title, description, projectId, assignedTo, dueDate });
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assign New Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Task Title</label>
          <input type="text" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Project</label>
          <select className="w-full p-2 border rounded" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
            <option value="">-- Select Project --</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Assign To Member</label>
          <select className="w-full p-2 border rounded" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
            <option value="">-- Select Member --</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Due Date</label>
          <input type="date" className="w-full p-2 border rounded" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Assign Task</button>
      </form>
    </div>
  );
};

export default CreateTask;
