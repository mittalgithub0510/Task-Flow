import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import logActivity from '../utils/activityLogger.js';
import { createNotification } from '../utils/createNotification.js';
import LeaveRequest from '../models/LeaveRequest.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const project = await Project.create({
      title,
      description,
      deadline,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    await logActivity('project_created', `Project ${title} created`, req.user._id, project._id);
    
    const members = await User.find({ role: 'Member' });
    for (const member of members) {
      await createNotification({
        title: 'New Project Available',
        message: `Admin ${req.user.name} created a new project: ${title}.`,
        type: 'project_created',
        receiver: member._id,
        sender: req.user._id,
        project: project._id,
        newValue: title
      });
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).populate('members', 'name email').populate('createdBy', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (['completed', 'paused', 'closed'].includes(project.status.toLowerCase())) {
      return res.status(400).json({ message: 'You cannot join this project because it is completed or currently on hold.' });
    }
    if (project.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    project.members.push(req.user._id);
    await project.save();
    
    await createNotification({
      title: 'New Member Joined Project',
      message: `${req.user.name} joined project ${project.title}.`,
      type: 'project_joined',
      receiver: project.createdBy,
      sender: req.user._id,
      project: project._id
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveProject = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'A reason for leaving the project is required.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Remove from project members
    project.members = project.members.filter(memberId => memberId.toString() !== req.user._id.toString());
    await project.save();

    // Pull from all related tasks
    await Task.updateMany(
      { projectId: project._id, assignedTo: req.user._id },
      { $pull: { assignedTo: req.user._id } }
    );

    // Log the leave request
    await LeaveRequest.create({
      member: req.user._id,
      project: project._id,
      type: 'project_leave',
      reason: reason
    });
    
    await createNotification({
      title: 'Member Left Project',
      message: `${req.user.name} has left project '${project.title}'. Reason: ${reason}`,
      type: 'member_removed',
      receiver: project.createdBy,
      sender: req.user._id,
      project: project._id
    });
    
    res.json({ success: true, message: 'You have left the project and have been removed from related tasks.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unjoinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.members = project.members.filter(memberId => memberId.toString() !== req.user._id.toString());
    await project.save();
    res.json({ message: 'Left project successfully', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const oldTitle = project.title;
    const oldDeadline = project.deadline;
    const oldStatus = project.status;
    const oldDescription = project.description;

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.deadline = req.body.deadline || project.deadline;
    project.status = req.body.status || project.status;
    
    const updatedProject = await project.save();
    
    let updates = [];
    if (oldTitle !== updatedProject.title) updates.push({ field: 'Title', old: oldTitle, new: updatedProject.title });
    if (new Date(oldDeadline).getTime() !== new Date(updatedProject.deadline).getTime()) updates.push({ field: 'Deadline', old: new Date(oldDeadline).toDateString(), new: new Date(updatedProject.deadline).toDateString() });
    if (oldStatus !== updatedProject.status) updates.push({ field: 'Status', old: oldStatus, new: updatedProject.status });

    for (const update of updates) {
      for (const memberId of project.members) {
        if (memberId.toString() !== req.user._id.toString()) {
          await createNotification({
            title: `Project ${update.field} Updated`,
            message: `Admin ${req.user.name} updated the ${update.field.toLowerCase()} for project ${project.title}.`,
            type: 'project_updated',
            receiver: memberId,
            sender: req.user._id,
            project: project._id,
            oldValue: String(update.old),
            newValue: String(update.new)
          });
        }
      }
    }
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMemberToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const { userId } = req.body;
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User already in project' });
    }
    project.members.push(userId);
    await project.save();
    
    await createNotification({
      title: 'Added to Project',
      message: `Admin ${req.user.name} added you to project ${project.title}.`,
      type: 'member_added',
      receiver: userId,
      sender: req.user._id,
      project: project._id
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectProgress = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.id });
    if (tasks.length === 0) {
      return res.json({ progress: 0 });
    }
    const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'approved').length;
    const progress = (completedTasks / tasks.length) * 100;
    
    const project = await Project.findById(req.params.id);
    if (project) {
      project.progressPercentage = progress;
      await project.save();
    }
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJoinedMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, members: project.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
