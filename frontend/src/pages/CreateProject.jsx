import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateProject = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { title, description, deadline });
      navigate('/projects');
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Project Title</label>
          <input type="text" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Deadline</label>
          <input type="date" className="w-full p-2 border rounded" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Project</button>
      </form>
    </div>
  );
};

export default CreateProject;
