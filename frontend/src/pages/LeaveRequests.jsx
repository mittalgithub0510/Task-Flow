import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../components/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/leave-requests');
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    try {
      await api.patch(`/leave-requests/${id}/reviewed`);
      fetchRequests();
      toast.success('Marked as reviewed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as reviewed');
    }
  };

  if (loading) return <LoadingSpinner text="Loading Leave Requests..." />;

  return (
    <div className="space-y-5">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Member Leave Requests</h2>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm mt-2">No leave requests found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-sm">
                  <th className="p-4">Member</th>
                  <th className="p-4">Context</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{req.member?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-700">{req.project?.title}</p>
                      {req.task && <p className="text-xs text-gray-500 mt-1">Task: {req.task?.title}</p>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${req.type === 'project_leave' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {req.type === 'project_leave' ? 'Project' : 'Task'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {req.status === 'reviewed' ? 'Reviewed' : 'Noted'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {req.status !== 'reviewed' && (
                        <button onClick={() => handleMarkReviewed(req._id)} className="bg-blue-50 text-blue-600 border border-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                          Mark Reviewed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {requests.map(req => (
              <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{req.member?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${req.type === 'project_leave' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {req.type === 'project_leave' ? 'Project Leave' : 'Task Leave'}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-gray-700">{req.project?.title}</p>
                  {req.task && <p className="text-xs text-gray-500 mt-0.5">Task: {req.task?.title}</p>}
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{req.reason}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {req.status === 'reviewed' ? 'Reviewed' : 'Noted'}
                  </span>
                  {req.status !== 'reviewed' && (
                    <button onClick={() => handleMarkReviewed(req._id)} className="bg-blue-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                      Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveRequests;
