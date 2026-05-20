import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalMembers = await User.countDocuments({ role: 'Member' });
    const tasks = await Task.find({});
    
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const submittedTasks = tasks.filter(t => t.status === 'submitted').length;
    const underReviewTasks = tasks.filter(t => t.status === 'under-review').length;
    const approvedTasks = tasks.filter(t => t.status === 'approved').length;
    const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

    res.json({
      totalProjects,
      totalMembers,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      submittedTasks,
      underReviewTasks,
      approvedTasks,
      rejectedTasks,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemberDashboard = async (req, res) => {
  try {
    const memberId = req.user._id;
    const member = await User.findById(memberId).select('performanceScore');
    const assignedProjects = await Project.countDocuments({ members: memberId });
    const tasks = await Task.find({ assignedTo: memberId });
    
    const totalAssignedTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const submittedTasks = tasks.filter(t => t.status === 'submitted').length;
    const approvedTasks = tasks.filter(t => t.status === 'approved').length;
    const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

    res.json({
      assignedProjects,
      totalAssignedTasks,
      pendingTasks,
      inProgressTasks,
      submittedTasks,
      approvedTasks,
      rejectedTasks,
      overdueTasks,
      performanceScore: member?.performanceScore ?? 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
