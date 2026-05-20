import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../components/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectCard = ({ proj, user, openEditModal, handleJoin, handleUnjoin }) => {
  const [expanded, setExpanded] = useState(false);
  const isMember = proj.members?.some(m => m._id === user?._id);
  const maxDescLength = 120;
  const isRestricted = ['completed', 'paused', 'closed'].includes(proj.status?.toLowerCase());

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-l-4 border-l-purple-500 flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-base lg:text-xl font-bold text-gray-800 min-w-0 break-words">{proj.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide shrink-0 ${
            proj.status === 'active' ? 'bg-green-100 text-green-700' : proj.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {proj.status}
          </span>
        </div>

        <div className="text-gray-600 mb-4 text-sm leading-relaxed">
          {expanded ? proj.description : `${proj.description.substring(0, maxDescLength)}${proj.description.length > maxDescLength ? '...' : ''}`}
          {proj.description.length > maxDescLength && (
            <button onClick={() => setExpanded(!expanded)} className="text-blue-600 ml-1 font-semibold hover:underline text-xs">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
          <p className="font-semibold text-gray-700 mb-2 text-xs">Team Members:</p>
          {proj.members?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {proj.members.map(m => (
                <span key={m._id} className={`border text-xs px-2 py-0.5 rounded shadow-sm ${
                  m.role === 'Admin' ? 'bg-red-100 text-red-700 border-red-200 font-bold' :
                  m._id === user?._id ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-white text-gray-600'
                }`}>
                  {m._id === user?._id ? 'You' : m.name}{m.role === 'Admin' ? ' (Admin)' : ''}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 italic text-xs">No members joined yet</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-gray-100">
        {user?.role === 'Admin' && (
          <button onClick={() => openEditModal(proj)} className="flex-1 min-w-[100px] bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition text-sm border border-black lg:border-0">
            Edit Project
          </button>
        )}
        {user?.role === 'Member' && (
          <div className="w-full flex gap-2">
            {isRestricted ? (
              <div className="w-full text-center text-xs font-semibold text-gray-500 bg-gray-100 p-2.5 rounded-xl">
                Project is {proj.status} — joining not allowed
              </div>
            ) : isMember ? (
              <>
                <span className="flex-1 text-center bg-green-100 text-green-700 px-3 py-2.5 rounded-xl font-bold text-sm">
                  ✓ Joined
                </span>
                <button onClick={() => handleUnjoin(proj._id)} className="bg-red-50 text-red-600 border border-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition text-sm shrink-0">
                  Leave
                </button>
              </>
            ) : (
              <button onClick={() => handleJoin(proj._id)} className="w-full bg-blue-50 text-blue-600 border border-blue-600 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition text-sm">
                Join Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [projectToLeave, setProjectToLeave] = useState(null);
  const [leaveReason, setLeaveReason] = useState('');

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

  useEffect(() => { fetchProjects(); }, []);

  const handleJoin = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/join`);
      fetchProjects();
      toast.success('Successfully joined project!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to join project');
    }
  };

  const promptLeaveProject = (projectId) => {
    setProjectToLeave(projectId);
    setShowLeaveModal(true);
  };

  const confirmLeaveProject = async (e) => {
    e.preventDefault();
    if (!projectToLeave || !leaveReason) return;
    try {
      await api.post(`/projects/${projectToLeave}/leave`, { reason: leaveReason });
      fetchProjects();
      toast.success('Left project successfully.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to leave project');
    } finally {
      setShowLeaveModal(false);
      setProjectToLeave(null);
      setLeaveReason('');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${selectedProject._id}`, { title, description, status });
      setShowEditModal(false);
      fetchProjects();
      toast.success('Project updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update project');
    }
  };

  const openEditModal = (proj) => {
    setSelectedProject(proj);
    setTitle(proj.title || '');
    setDescription(proj.description || '');
    setStatus(proj.status || 'active');
    setShowEditModal(true);
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Projects</h2>
        {user?.role === 'Admin' && (
          <button
            onClick={() => navigate('/projects/create')}
            className="bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-xl hover:bg-blue-700 shadow-sm text-sm font-semibold"
          >
            + New Project
          </button>
        )}
      </div>

      {sortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {user?.role === 'Admin' ? (
            <p className="text-gray-400 text-sm mt-2">Create new project...</p>
          ) : (
            <LoadingSpinner text="No Projects Available" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {sortedProjects.map((proj) => (
            <ProjectCard key={proj._id} proj={proj} user={user} openEditModal={openEditModal} handleJoin={handleJoin} handleUnjoin={promptLeaveProject} />
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="p-5">
              <h2 className="text-xl font-bold mb-4">Edit Project</h2>
              <form onSubmit={handleEditProject} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Project Title</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Description</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-24" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Status</label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-white" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">On Hold</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition text-sm">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm transition text-sm">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Premium Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-t-4 border-red-500 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Leave Project?</h2>
                <p className="text-gray-500 text-sm">You will be removed from all related tasks.</p>
              </div>
              <form onSubmit={confirmLeaveProject} className="space-y-4">
                <div className="text-left">
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Reason <span className="text-red-500">*</span></label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none h-24 no-scrollbar"
                    placeholder="Explain why you want to leave this project..."
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowLeaveModal(false); setLeaveReason(''); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition text-sm">Cancel</button>
                  <button type="submit" className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-600 transition text-sm">Leave</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
