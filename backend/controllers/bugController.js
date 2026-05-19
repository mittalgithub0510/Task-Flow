import BugReport from '../models/BugReport.js';

export const createBug = async (req, res) => {
  try {
    const { title, description, projectId, taskId, severity, screenshot } = req.body;
    const bug = await BugReport.create({
      title,
      description,
      projectId,
      taskId,
      severity,
      screenshot,
      reportedBy: req.user._id
    });
    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBugs = async (req, res) => {
  try {
    const bugs = await BugReport.find({}).populate('reportedBy', 'name').populate('assignedTo', 'name');
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBugs = async (req, res) => {
  try {
    const bugs = await BugReport.find({ reportedBy: req.user._id }).populate('assignedTo', 'name');
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBugStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const bug = await BugReport.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    
    if (status) bug.status = status;
    if (assignedTo) bug.assignedTo = assignedTo;
    
    await bug.save();
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
