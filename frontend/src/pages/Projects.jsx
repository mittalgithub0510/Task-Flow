import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../components/useAuth';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleJoin = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/join`);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to join project');
    }
  };

  const handleUnjoin = async (projectId) => {
    if (window.confirm("Are you sure you want to leave this project?")) {
      try {
        await api.post(`/projects/${projectId}/unjoin`);
        fetchProjects();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to leave project');
      }
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${selectedProject._id}`, {
        title,
        description,
        status
      });
      setShowEditModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to update project');
    }
  };

  const openEditModal = (proj) => {
    setSelectedProject(proj);
    setTitle(proj.title || '');
    setDescription(proj.description || '');
    setStatus(proj.status || 'active');
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        {user?.role === 'Admin' && (
          <button onClick={() => navigate('/projects/create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-sm">
            + New Project
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isMember = proj.members?.some(m => m._id === user?._id);
          return (
            <div key={proj._id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{proj.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${proj.status === 'active' ? 'bg-green-100 text-green-700' : proj.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {proj.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{proj.description}</p>
                
                <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                  <p className="font-semibold text-gray-700 mb-1">Team Members:</p>
                  {proj.members?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {proj.members.map(m => (
                        <span key={m._id} className={`border text-xs px-2 py-1 rounded ${m.role === 'Admin' ? 'bg-blue-600 text-white font-bold' : m._id === user?._id ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-white text-gray-600'}`}>
                          {m._id === user?._id ? 'You' : m.name} {m.role === 'Admin' && '(Admin)'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No members joined yet</span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                {user?.role === 'Admin' && (
                  <button onClick={() => openEditModal(proj)} className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">
                    Edit Project
                  </button>
                )}
                {user?.role === 'Member' && (
                  <div className="w-full flex gap-2">
                    {isMember ? (
                      <>
                        <span className="inline-block flex-1 text-center bg-green-100 text-green-700 px-3 py-2 rounded font-bold shadow-sm">
                          ✓ Joined
                        </span>
                        <button onClick={() => handleUnjoin(proj._id)} className="bg-red-50 text-red-600 border border-red-600 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition shadow-sm">
                          Leave
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleJoin(proj._id)} className="w-full bg-blue-50 text-blue-600 border border-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-600 hover:text-white transition shadow-sm">
                        Join Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <form onSubmit={handleEditProject}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Project Title</label>
                <input type="text" className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Description</label>
                <textarea className="w-full p-2 border rounded h-24" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Status</label>
                <select className="w-full p-2 border rounded" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
