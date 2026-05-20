import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignmentType, setAssignmentType] = useState('single');
  const [assignedToSingle, setAssignedToSingle] = useState('');
  const [assignedToMultiple, setAssignedToMultiple] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [projects, setProjects] = useState([]);
  const [joinedMembers, setJoinedMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projRes = await api.get('/projects');
        setProjects(projRes.data.filter(p => !['completed', 'paused', 'closed'].includes(p.status.toLowerCase())));
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchJoinedMembers = async () => {
      if (!projectId) { setJoinedMembers([]); return; }
      try {
        const res = await api.get(`/projects/${projectId}/joined-members`);
        if (res.data.success) setJoinedMembers(res.data.members.filter(m => m.role === 'Member'));
      } catch (err) { console.error(err); setJoinedMembers([]); }
    };
    fetchJoinedMembers();
    setAssignedToSingle('');
    setAssignedToMultiple([]);
  }, [projectId]);

  const handleMultipleChange = (memberId) => {
    setAssignedToMultiple(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const isFormValid = () => {
    if (!title || !description || !projectId || !dueDate) return false;
    if (joinedMembers.length === 0) return false;
    if (assignmentType === 'single' && !assignedToSingle) return false;
    if (assignmentType === 'multiple' && assignedToMultiple.length === 0) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    let finalAssignedTo = [];
    if (assignmentType === 'single') finalAssignedTo = [assignedToSingle];
    else if (assignmentType === 'multiple') finalAssignedTo = assignedToMultiple;

    try {
      await api.post('/tasks', { title, description, projectId, assignedTo: finalAssignedTo, assignmentType, dueDate });
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div className="bg-white p-5 lg:p-8 rounded-2xl shadow-sm max-w-2xl mx-auto border-t-4 border-blue-600">
      <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-800">Assign New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Task Title</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Description</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-28 no-scrollbar"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the task..."
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Select Project</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            <option value="">-- Select Active Project --</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>

        {projectId && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            {joinedMembers.length === 0 ? (
              <p className="text-red-500 text-sm font-semibold">
                No members have joined this project yet. Members must join before tasks can be assigned.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Assignment Type</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                  >
                    <option value="single">Assign to Single Member</option>
                    <option value="multiple">Assign to Multiple Members</option>
                    <option value="all">Assign to All Joined Members</option>
                  </select>
                </div>

                {assignmentType === 'single' && (
                  <div>
                    <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Select Member</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      value={assignedToSingle}
                      onChange={(e) => setAssignedToSingle(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {joinedMembers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                    </select>
                  </div>
                )}

                {assignmentType === 'multiple' && (
                  <div>
                    <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Select Members</label>
                    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                      {joinedMembers.map(m => (
                        <label key={m._id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition">
                          <input
                            type="checkbox"
                            className="mr-3 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
                            checked={assignedToMultiple.includes(m._id)}
                            onChange={() => handleMultipleChange(m._id)}
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-gray-700 block">{m.name}</span>
                            <span className="text-xs text-gray-500 truncate block">{m.email}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {assignedToMultiple.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">{assignedToMultiple.length} member(s) selected</p>
                    )}
                  </div>
                )}

                {assignmentType === 'all' && (
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-800 text-sm font-semibold border border-blue-100 flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    This task will be assigned to all {joinedMembers.length} joined members.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Due Date</label>
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid()}
          className={`w-full py-3 rounded-xl font-bold shadow-sm transition text-sm ${isFormValid() ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {isFormValid() ? 'Assign Task' : 'Please Complete Form'}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
