import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../components/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TaskCard = ({ task, user, openEditModal, openReviewModal, openSubmitModal, openLeaveModal }) => {
  const [expanded, setExpanded] = useState(false);
  const maxDescLength = 100;

  const isAssigned = Array.isArray(task.assignedTo)
    ? task.assignedTo.some(a => (a._id || a) === user?._id)
    : (task.assignedTo?._id || task.assignedTo) === user?._id;

  const statusColor = task.status === 'completed' || task.status === 'approved'
    ? 'bg-green-100 text-green-700'
    : task.status === 'submitted' || task.status === 'under-review'
    ? 'bg-purple-100 text-purple-700'
    : task.status === 'rejected'
    ? 'bg-red-100 text-red-700'
    : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-base lg:text-xl font-bold text-gray-800 min-w-0 break-words">{task.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide shrink-0 ${statusColor}`}>
            {task.status}
          </span>
        </div>
        <p className="text-xs text-blue-600 font-semibold mb-3">{task.projectId?.title}</p>

        <div className="text-gray-600 text-sm mb-4 leading-relaxed">
          {expanded ? task.description : `${task.description.substring(0, maxDescLength)}${task.description.length > maxDescLength ? '...' : ''}`}
          {task.description.length > maxDescLength && (
            <button onClick={() => setExpanded(!expanded)} className="text-blue-600 ml-1 font-semibold hover:underline text-xs">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-gray-700 text-xs shrink-0">Assigned To:</span>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                task.assignedTo.map(assignee => (
                  <span key={assignee._id || assignee} className={`border px-2 py-0.5 rounded text-xs shadow-sm ${
                    assignee._id === user?._id ? 'text-blue-700 font-bold bg-blue-50 border-blue-200' :
                    assignee.role === 'Admin' ? 'bg-red-100 text-red-700 border-red-200 font-bold' : 'text-gray-800 bg-white border-gray-200'
                  }`}>
                    {assignee._id === user?._id ? 'You' : assignee.name || assignee}{assignee.role === 'Admin' ? ' (Admin)' : ''}
                  </span>
                ))
              ) : task.assignedTo && !Array.isArray(task.assignedTo) ? (
                <span className={`border px-2 py-0.5 rounded text-xs shadow-sm ${
                  task.assignedTo._id === user?._id ? 'text-blue-700 font-bold bg-blue-50 border-blue-200' :
                  task.assignedTo.role === 'Admin' ? 'bg-red-100 text-red-700 border-red-200 font-bold' : 'text-gray-800 bg-white border-gray-200'
                }`}>
                  {task.assignedTo._id === user?._id ? 'You' : task.assignedTo.name || task.assignedTo}{task.assignedTo.role === 'Admin' ? ' (Admin)' : ''}
                </span>
              ) : (
                <span className="text-gray-400 italic text-xs">Unassigned</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-600"><span className="font-semibold">Due:</span> {new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {user?.role === 'Admin' && (
          <button onClick={() => openEditModal(task)} className="flex-1 min-w-[90px] bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-medium hover:bg-gray-200 text-sm border border-black lg:border-0">
            Edit Task
          </button>
        )}
        {user?.role === 'Admin' && (task.status === 'submitted' || task.status === 'under-review') && (
          <button onClick={() => openReviewModal(task)} className="flex-1 min-w-[100px] bg-purple-600 text-white px-3 py-2.5 rounded-xl font-medium hover:bg-purple-700 shadow-sm text-sm">
            Review Proof
          </button>
        )}
        {user?.role === 'Member' && (task.status === 'todo' || task.status === 'in-progress' || task.status === 'rejected') && (
          <button onClick={() => openSubmitModal(task)} className="flex-1 bg-blue-600 text-white px-3 py-2.5 rounded-xl font-medium hover:bg-blue-700 shadow-sm text-sm">
            Submit Proof
          </button>
        )}
        {user?.role === 'Member' && isAssigned && (
          <button onClick={() => openLeaveModal(task)} className="bg-red-50 text-red-600 px-3 py-2.5 rounded-xl border border-red-200 font-medium hover:bg-red-600 hover:text-white transition shadow-sm text-sm">
            Leave Task
          </button>
        )}
      </div>
    </div>
  );
};

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
      {children}
    </div>
  </div>
);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [leaveReason, setLeaveReason] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [githubLink, setGithubLink] = useState('');
  const [liveDemoLink, setLiveDemoLink] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.filter(u => u.role === 'Member'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') fetchUsers();
  }, [user]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}/submit`, { githubLink, liveDemoLink, submissionNote });
      setShowSubmitModal(false);
      fetchTasks();
      toast.success('Task submitted successfully!');
    } catch (err) { console.error(err); toast.error('Failed to submit task'); }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}`, { title: editTitle, description: editDescription, dueDate: editDueDate, assignedTo: newAssignee });
      setShowEditModal(false);
      fetchTasks();
      toast.success('Task updated successfully!');
    } catch (err) { console.error(err); toast.error('Failed to update task'); }
  };

  const handleReviewTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}/review`, { status: reviewStatus, reviewComment, rejectionReason: reviewStatus === 'rejected' ? reviewComment : '' });
      setShowReviewModal(false);
      fetchTasks();
      toast.success('Task reviewed successfully!');
    } catch (err) { console.error(err); toast.error('Failed to review task'); }
  };

  const confirmLeaveTask = async (e) => {
    e.preventDefault();
    if (!selectedTask || !leaveReason) return;
    try {
      await api.post(`/tasks/${selectedTask._id}/leave`, { reason: leaveReason });
      setShowLeaveModal(false);
      setLeaveReason('');
      fetchTasks();
      toast.success('Left task successfully.');
    } catch (err) { console.error(err); toast.error(err.response?.data?.message || 'Failed to leave task'); }
  };

  const openSubmitModal = (task) => { setSelectedTask(task); setGithubLink(task.githubLink || ''); setLiveDemoLink(task.liveDemoLink || ''); setSubmissionNote(task.submissionNote || ''); setShowSubmitModal(true); };
  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNewAssignee(Array.isArray(task.assignedTo) ? task.assignedTo.map(a => a._id || a) : task.assignedTo?._id || task.assignedTo || '');
    setShowEditModal(true);
  };
  const openReviewModal = (task) => { setSelectedTask(task); setReviewStatus('approved'); setReviewComment(''); setShowReviewModal(true); };
  const openLeaveModal = (task) => { setSelectedTask(task); setLeaveReason(''); setShowLeaveModal(true); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Tasks</h2>
        {user?.role === 'Admin' && (
          <button onClick={() => navigate('/tasks/create')} className="bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-xl hover:bg-blue-700 shadow-sm text-sm font-semibold">
            + Assign Task
          </button>
        )}
      </div>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search tasks by name..."
          className="w-full sm:max-w-md p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {user?.role === 'Admin' ? (
            <p className="text-gray-400 text-sm mt-2">Create new task...</p>
          ) : (
            <p className="text-gray-400 text-sm mt-2">Please join a project, then Admin will assign your tasks...</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {tasks.filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
            <TaskCard key={task._id} task={task} user={user} openEditModal={openEditModal} openReviewModal={openReviewModal} openSubmitModal={openSubmitModal} openLeaveModal={openLeaveModal} />
          ))}
        </div>
      )}

      {/* Submit Proof Modal */}
      {showSubmitModal && (
        <ModalWrapper onClose={() => setShowSubmitModal(false)}>
          <div className="p-5">
            <h2 className="text-xl font-bold mb-4">Submit Task Proof</h2>
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">GitHub Link</label>
                <input type="url" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={githubLink} onChange={e => setGithubLink(e.target.value)} required placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Live Demo (Optional)</label>
                <input type="url" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={liveDemoLink} onChange={e => setLiveDemoLink(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Work Summary</label>
                <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-24 no-scrollbar" value={submissionNote} onChange={e => setSubmissionNote(e.target.value)} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm">Submit</button>
              </div>
            </form>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <ModalWrapper onClose={() => setShowEditModal(false)}>
          <div className="p-5">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Task Title</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Description</label>
                <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-24 no-scrollbar" value={editDescription} onChange={e => setEditDescription(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Due Date</label>
                <input type="date" className="w-full p-3 border border-gray-300 rounded-xl text-sm" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Reassign To</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-white" value={Array.isArray(newAssignee) ? newAssignee[0] : newAssignee} onChange={(e) => setNewAssignee([e.target.value])} required>
                  <option value="">-- Change Assignee --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">Changing assignee will overwrite all current members.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm">Update Task</button>
              </div>
            </form>
          </div>
        </ModalWrapper>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ModalWrapper onClose={() => setShowReviewModal(false)}>
          <div className="p-5">
            <h2 className="text-xl font-bold mb-4">Review Submission</h2>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm space-y-2">
              <p><strong>GitHub:</strong> <a href={selectedTask?.githubLink} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">View Repo</a></p>
              {selectedTask?.liveDemoLink && <p><strong>Live Demo:</strong> <a href={selectedTask?.liveDemoLink} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">View Site</a></p>}
              <p><strong>Notes:</strong> {selectedTask?.submissionNote}</p>
            </div>
            <form onSubmit={handleReviewTask} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Action</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold bg-white" value={reviewStatus} onChange={e => setReviewStatus(e.target.value)}>
                  <option value="approved">Approve & Give Points</option>
                  <option value="rejected">Reject / Needs Fixes</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">Review Comment</label>
                <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none h-24 no-scrollbar" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Great job! / Missing responsive design..." required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold text-sm ${reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {reviewStatus === 'approved' ? 'Approve Task' : 'Reject Task'}
                </button>
              </div>
            </form>
          </div>
        </ModalWrapper>
      )}

      {/* Leave Task Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-t-4 border-red-500 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Leave Task?</h2>
                <p className="text-gray-500 text-sm">You will stay in the project, but be removed from this task.</p>
              </div>
              <form onSubmit={confirmLeaveTask} className="space-y-4">
                <div className="text-left">
                  <label className="block text-gray-700 mb-1.5 font-medium text-sm">Reason <span className="text-red-500">*</span></label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none h-24 no-scrollbar"
                    placeholder="Explain why you are unable to work on this task..."
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

export default Tasks;
