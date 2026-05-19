import Blocker from '../models/Blocker.js';
import Project from '../models/Project.js';
import { createNotification } from '../utils/createNotification.js';

export const createBlocker = async (req, res) => {
  try {
    const { title, description, projectId, taskId, priority, screenshot } = req.body;
    const blocker = await Blocker.create({
      title,
      description,
      projectId,
      taskId,
      raisedBy: req.user._id,
      priority,
      screenshot
    });
    
    const project = await Project.findById(projectId);
    if (project && project.createdBy) {
      await createNotification({
        title: 'Blocker Raised',
        message: `${req.user.name} raised a blocker in ${project.title}.`,
        type: 'blocker_raised',
        receiver: project.createdBy,
        sender: req.user._id,
        project: projectId,
        task: taskId,
        priority: 'high',
        actionDetails: `Blocker: ${title}`
      });
    }
    
    res.status(201).json(blocker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlockers = async (req, res) => {
  try {
    const blockers = await Blocker.find({}).populate('raisedBy', 'name').populate('projectId', 'title');
    res.json(blockers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBlockers = async (req, res) => {
  try {
    const blockers = await Blocker.find({ raisedBy: req.user._id }).populate('projectId', 'title');
    res.json(blockers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const replyToBlocker = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const blocker = await Blocker.findById(req.params.id);
    if (!blocker) return res.status(404).json({ message: 'Not found' });
    blocker.adminReply = adminReply;
    blocker.status = 'in-progress';
    await blocker.save();
    res.json(blocker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveBlocker = async (req, res) => {
  try {
    const blocker = await Blocker.findById(req.params.id);
    if (!blocker) return res.status(404).json({ message: 'Not found' });
    blocker.status = 'resolved';
    blocker.resolvedAt = Date.now();
    await blocker.save();
    res.json(blocker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
