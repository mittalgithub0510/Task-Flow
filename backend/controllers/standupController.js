import Standup from '../models/Standup.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { calculatePerformance } from '../utils/calculatePerformance.js';
import { createNotification } from '../utils/createNotification.js';

export const createStandup = async (req, res) => {
  try {
    const { projectId, yesterdayWork, todayPlan, blockers } = req.body;
    const standup = await Standup.create({
      userId: req.user._id,
      projectId,
      yesterdayWork,
      todayPlan,
      blockers
    });
    
    const user = await User.findById(req.user._id);
    user.performanceScore += 2;
    await user.save();
    
    const project = await Project.findById(projectId);
    if (project && project.createdBy) {
      await createNotification({
        title: 'Daily Standup Submitted',
        message: `${req.user.name} submitted daily standup for ${project.title}.`,
        type: 'standup_submitted',
        receiver: project.createdBy,
        sender: req.user._id,
        project: projectId,
        actionDetails: `Blockers: ${blockers || 'None'}`
      });
    }
    
    res.status(201).json(standup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStandups = async (req, res) => {
  try {
    const standups = await Standup.find({}).populate('userId', 'name email').populate('projectId', 'title');
    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyStandups = async (req, res) => {
  try {
    const standups = await Standup.find({ userId: req.user._id }).populate('projectId', 'title');
    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectStandups = async (req, res) => {
  try {
    const standups = await Standup.find({ projectId: req.params.projectId }).populate('userId', 'name');
    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
