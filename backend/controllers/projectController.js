import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import logActivity from '../utils/activityLogger.js';
import { createNotification } from '../utils/createNotification.js';

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

export const unjoinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.members = project.members.filter(memberId => memberId.toString() !== req.user._id.toString());
    await project.save();
    
    await createNotification({
      title: 'Member Left Project',
      message: `${req.user.name} left project ${project.title}.`,
      type: 'member_removed',
      receiver: project.createdBy,
      sender: req.user._id,
      project: project._id
    });
    
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
