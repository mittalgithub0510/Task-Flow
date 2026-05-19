import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../components/useAuth';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Submit Form States
  const [githubLink, setGithubLink] = useState('');
  const [liveDemoLink, setLiveDemoLink] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');

  // Edit Form States
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  // Review Form States
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.filter(u => u.role === 'Member'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}/submit`, {
        githubLink,
        liveDemoLink,
        submissionNote
      });
      setShowSubmitModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to submit task');
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}`, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        assignedTo: newAssignee
      });
      setShowEditModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update task');
    }
  };

  const handleReviewTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}/review`, {
        status: reviewStatus,
        reviewComment: reviewComment,
        rejectionReason: reviewStatus === 'rejected' ? reviewComment : ''
      });
      setShowReviewModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to review task');
    }
  };

  const openSubmitModal = (task) => {
    setSelectedTask(task);
    setGithubLink(task.githubLink || '');
    setLiveDemoLink(task.liveDemoLink || '');
    setSubmissionNote(task.submissionNote || '');
    setShowSubmitModal(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNewAssignee(task.assignedTo?._id || '');
    setShowEditModal(true);
  };

  const openReviewModal = (task) => {
    setSelectedTask(task);
    setReviewStatus('approved');
    setReviewComment('');
    setShowReviewModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
        {user?.role === 'Admin' && (
          <button onClick={() => navigate('/tasks/create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Assign Task
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${task.status === 'completed' || task.status === 'approved' ? 'bg-green-100 text-green-700' : task.status === 'submitted' || task.status === 'under-review' ? 'bg-purple-100 text-purple-700' : task.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {task.status}
                </span>
              </div>
              <p className="text-sm text-blue-600 font-semibold mb-3">{task.projectId?.title}</p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
              
              <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                <p>
                  <span className="font-semibold text-gray-700">Assigned To: </span> 
                  <span className={`${task.assignedTo?._id === user?._id ? 'text-blue-700 font-bold' : task.assignedTo?.role === 'Admin' ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                    {task.assignedTo?._id === user?._id ? 'You' : task.assignedTo?.name} {task.assignedTo?.role === 'Admin' && '(Admin)'}
                  </span>
                </p>
                <p><span className="font-semibold text-gray-700">Due:</span> {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {user?.role === 'Admin' && (
                <button onClick={() => openEditModal(task)} className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded font-medium hover:bg-gray-200">
                  Edit Task
                </button>
              )}
              
              {user?.role === 'Admin' && (task.status === 'submitted' || task.status === 'under-review') && (
                <button onClick={() => openReviewModal(task)} className="flex-1 bg-purple-600 text-white px-3 py-2 rounded font-medium hover:bg-purple-700 shadow-sm">
                  Review Proof
                </button>
              )}
              
              {user?.role === 'Member' && (task.status === 'todo' || task.status === 'in-progress' || task.status === 'rejected') && (
                <button onClick={() => openSubmitModal(task)} className="w-full bg-blue-600 text-white px-3 py-2 rounded font-medium hover:bg-blue-700 shadow-sm">
                  Submit Proof
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Proof Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Submit Task Proof</h2>
            <form onSubmit={handleSubmitTask}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">GitHub Link</label>
                <input type="url" className="w-full p-2 border rounded" value={githubLink} onChange={e => setGithubLink(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Live Demo (Optional)</label>
                <input type="url" className="w-full p-2 border rounded" value={liveDemoLink} onChange={e => setLiveDemoLink(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Work Summary / Note</label>
                <textarea className="w-full p-2 border rounded" value={submissionNote} onChange={e => setSubmissionNote(e.target.value)} required></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Full Task Edit</h2>
            <form onSubmit={handleEditTask}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Task Title</label>
                <input type="text" className="w-full p-2 border rounded" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea className="w-full p-2 border rounded" value={editDescription} onChange={e => setEditDescription(e.target.value)} required></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Due Date</label>
                <input type="date" className="w-full p-2 border rounded" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Assign To Member</label>
                <select className="w-full p-2 border rounded" value={newAssignee} onChange={e => setNewAssignee(e.target.value)} required>
                  <option value="">-- Select Member --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Review Task Submission</h2>
            
            <div className="mb-6 p-4 bg-gray-50 border rounded text-sm space-y-2">
              <p><strong>GitHub:</strong> <a href={selectedTask?.githubLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Repo</a></p>
              {selectedTask?.liveDemoLink && <p><strong>Live Demo:</strong> <a href={selectedTask?.liveDemoLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Site</a></p>}
              <p><strong>Notes:</strong> {selectedTask?.submissionNote}</p>
            </div>

            <form onSubmit={handleReviewTask}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Action</label>
                <select className="w-full p-2 border rounded font-semibold" value={reviewStatus} onChange={e => setReviewStatus(e.target.value)}>
                  <option value="approved" className="text-green-600">Approve & Give Points</option>
                  <option value="rejected" className="text-red-600">Reject / Needs Fixes</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Review Comment / Feedback</label>
                <textarea className="w-full p-2 border rounded" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Great job! / Missing responsive design..." required></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-white rounded ${reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {reviewStatus === 'approved' ? 'Approve Task' : 'Reject Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
