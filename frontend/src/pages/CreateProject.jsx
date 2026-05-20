import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { title, description, deadline });
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="bg-white p-5 lg:p-8 rounded-2xl shadow-sm max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-800">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1.5 font-medium text-sm">Project Title</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter project title"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1.5 font-medium text-sm">Description</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the project..."
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1.5 font-medium text-sm">Deadline</label>
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition text-sm"
        >
          Create Project
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
