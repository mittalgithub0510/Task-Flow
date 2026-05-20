import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pointAmount, setPointAmount] = useState(0);

  const fetchMembers = async () => {
    try {
      const usersRes = await api.get('/users');
      const projectsRes = await api.get('/projects');
      setMembers(usersRes.data.filter(u => u.role === 'Member'));
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const openPointModal = (member) => { setSelectedMember(member); setPointAmount(0); setShowPointModal(true); };

  const handleUpdatePoints = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedMember._id}`, { performanceScore: selectedMember.performanceScore + parseInt(pointAmount) });
      fetchMembers();
      toast.success('Score updated successfully!');
      setShowPointModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update score');
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Team Members</h2>

      {/* Desktop Table — hidden on mobile */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Performance</th>
                <th className="p-4 font-semibold">Joined Projects</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500">No team members found.</td></tr>
              ) : (
                members.map(member => {
                  const memberProjects = projects.filter(p => p.members?.some(m => m._id === member._id));
                  return (
                    <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">{member.name}</td>
                      <td className="p-4 text-gray-600">{member.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded font-bold text-sm ${member.performanceScore >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {member.performanceScore} pts
                          </span>
                          <button onClick={() => openPointModal(member)} className="text-xs bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 px-3 py-1 rounded font-semibold transition">
                            Manage Points
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {memberProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {memberProjects.map(mp => (
                              <span key={mp._id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{mp.title}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No projects joined</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards — shown only on mobile */}
      <div className="lg:hidden space-y-3 pb-4">
        {members.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">No team members found.</p>
        ) : (
          members.map(member => {
            const memberProjects = projects.filter(p => p.members?.some(m => m._id === member._id));
            return (
              <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded font-bold text-sm shrink-0 ${member.performanceScore >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {member.performanceScore} pts
                  </span>
                </div>
                {memberProjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {memberProjects.map(mp => (
                      <span key={mp._id} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{mp.title}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-xs mb-3">No projects joined</p>
                )}
                <button
                  onClick={() => openPointModal(member)}
                  className="w-full text-sm bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 px-3 py-2.5 rounded-xl font-semibold transition"
                >
                  Manage Points
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Manage Points Modal */}
      {showPointModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border-t-4 border-blue-500 p-6 mb-20 sm:mb-0">
            <h2 className="text-xl font-bold mb-1">Manage Points</h2>
            <p className="text-gray-600 text-sm mb-5">Adjust score for <span className="font-bold text-gray-800">{selectedMember?.name}</span>.</p>
            <form onSubmit={handleUpdatePoints} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1.5 font-semibold text-sm">Points to Add / Deduct</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                  value={pointAmount}
                  onChange={e => setPointAmount(e.target.value)}
                  placeholder="e.g., 10 or -5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use negative numbers to deduct points.</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPointModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm text-sm">Apply Points</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
