import { useState, useEffect } from 'react';
import api from '../services/api';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [showPointModal, setShowPointModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pointAmount, setPointAmount] = useState(0);

  useEffect(() => {
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
    fetchMembers();
  }, []);

  const openPointModal = (member) => {
    setSelectedMember(member);
    setPointAmount(0);
    setShowPointModal(true);
  };

  const handleUpdatePoints = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedMember._id}`, { performanceScore: selectedMember.performanceScore + parseInt(pointAmount) });
      const usersRes = await api.get('/users');
      setMembers(usersRes.data.filter(u => u.role === 'Member'));
      setShowPointModal(false);
    } catch(err) { 
      alert('Failed to update score'); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No team members found.</td>
                </tr>
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
                          <button 
                            onClick={() => openPointModal(member)}
                            className="text-xs bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 px-3 py-1 rounded font-semibold transition"
                          >
                            Manage Points
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {memberProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {memberProjects.map(mp => (
                              <span key={mp._id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                {mp.title}
                              </span>
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
      
      {/* Manage Points Modal */}
      {showPointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-2">Manage Points</h2>
            <p className="text-gray-600 text-sm mb-4">Adjust performance score for <span className="font-bold text-gray-800">{selectedMember?.name}</span>.</p>
            <form onSubmit={handleUpdatePoints}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-semibold">Points to Add / Deduct</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 text-lg font-bold" 
                  value={pointAmount} 
                  onChange={e => setPointAmount(e.target.value)} 
                  placeholder="e.g., 10 or -5"
                  required 
                />
                <p className="text-xs text-gray-500 mt-2">Use negative numbers to deduct points.</p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPointModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-medium transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition shadow-sm">Apply Points</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
