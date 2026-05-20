import Task from '../models/Task.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import logActivity from '../utils/activityLogger.js';
import { calculatePerformance } from '../utils/calculatePerformance.js';
import { createNotification } from '../utils/createNotification.js';
import LeaveRequest from '../models/LeaveRequest.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, assignmentType, priority, difficulty, dueDate } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (['completed', 'paused', 'closed'].includes(project.status.toLowerCase())) {
      return res.status(400).json({ message: 'Cannot create task because this project is completed or on hold.' });
    }

    let finalAssignedTo = [];
    if (assignmentType === 'all') {
      finalAssignedTo = project.members;
    } else {
      const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      const projectMemberIds = project.members.map(id => id.toString());
      for (const assigneeId of assignees) {
        if (!projectMemberIds.includes(assigneeId.toString())) {
          return res.status(400).json({ message: 'Selected member has not joined this project.' });
        }
      }
      finalAssignedTo = assignees;
    }

    if (finalAssignedTo.length === 0) {
      return res.status(400).json({ message: 'No joined members found for this project or none selected.' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: finalAssignedTo,
      assignedBy: req.user._id,
      priority,
      difficulty,
      dueDate,
    });
    
    await logActivity('task_assigned', `Task ${title} assigned`, req.user._id, projectId, task._id);
    
    for (const assignee of finalAssignedTo) {
      await createNotification({
        title: 'New Task Assigned',
        message: `Admin ${req.user.name} assigned you a new task: ${title} in project ${project.title}.`,
        type: 'task_assigned',
        receiver: assignee,
        sender: req.user._id,
        project: projectId,
        task: task._id
      });
    }
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      tasks = await Task.find({}).populate('assignedTo', 'name email').populate('projectId', 'title');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('projectId', 'title');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('projectId', 'title');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const oldTitle = task.title;
    const oldDueDate = task.dueDate;
    const oldPriority = task.priority;
    const oldDifficulty = task.difficulty;
    
    Object.assign(task, req.body);
    const updatedTask = await task.save();
    const project = await Project.findById(task.projectId);
    
    let updates = [];
    if (oldTitle !== updatedTask.title) updates.push({ field: 'Title', old: oldTitle, new: updatedTask.title });
    if (new Date(oldDueDate).getTime() !== new Date(updatedTask.dueDate).getTime()) updates.push({ field: 'Due Date', old: new Date(oldDueDate).toDateString(), new: new Date(updatedTask.dueDate).toDateString() });
    if (oldPriority !== updatedTask.priority) updates.push({ field: 'Priority', old: oldPriority, new: updatedTask.priority });
    if (oldDifficulty !== updatedTask.difficulty) updates.push({ field: 'Difficulty', old: oldDifficulty, new: updatedTask.difficulty });
    
    if (task.assignedTo && task.assignedTo.length > 0 && updates.length > 0) {
      for (const update of updates) {
        for (const assignee of task.assignedTo) {
          await createNotification({
            title: `Task ${update.field} Updated`,
            message: `Admin ${req.user.name} updated ${update.field.toLowerCase()} for task ${task.title}.`,
            type: 'task_updated',
            receiver: assignee,
            sender: req.user._id,
            project: task.projectId,
            task: task._id,
            oldValue: String(update.old),
            newValue: String(update.new)
          });
        }
      }
    }
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const oldStatus = task.status;
    task.status = status;
    await task.save();
    
    await logActivity('status_updated', `Task status updated to ${status}`, req.user._id, task.projectId, task._id);
    const project = await Project.findById(task.projectId);
    
    if (req.user.role === 'Member' && task.assignedBy) {
      await createNotification({
        title: `Task Status Updated: ${status}`,
        message: `${req.user.name} changed task ${task.title} status to ${status}.`,
        type: 'task_status_updated',
        receiver: task.assignedBy,
        sender: req.user._id,
        project: task.projectId,
        task: task._id,
        oldValue: oldStatus,
        newValue: status
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { githubLink, liveDemoLink, submissionNote } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const isResubmission = task.status === 'rejected';
    task.githubLink = githubLink;
    task.liveDemoLink = liveDemoLink;
    task.submissionNote = submissionNote;
    task.status = 'under-review';
    task.submittedAt = Date.now();
    
    const earlierSubmissions = await Task.countDocuments({
      projectId: task.projectId,
      status: { $in: ['submitted', 'under-review', 'approved'] },
      submittedAt: { $exists: true }
    });
    
    const user = await User.findById(req.user._id);
    
    if (new Date(task.submittedAt) > new Date(task.dueDate)) {
      task.submissionRank = 'Late Submitted';
      if (user) { user.performanceScore += calculatePerformance('late'); await user.save(); }
    } else if (earlierSubmissions === 0) {
      task.submissionRank = '1st Submitted';
      if (user) { user.performanceScore += calculatePerformance('on-time'); await user.save(); }
    } else {
      task.submissionRank = 'Submitted';
      if (user) { user.performanceScore += calculatePerformance('on-time'); await user.save(); }
    }

    await task.save();
    await logActivity('task_submitted', `Task submitted`, req.user._id, task.projectId, task._id);
    const project = await Project.findById(task.projectId);
    
    if (task.assignedBy) {
      await createNotification({
        title: isResubmission ? 'Task Resubmitted' : 'New Task Submission',
        message: `${req.user.name} ${isResubmission ? 'resubmitted' : 'submitted'} task ${task.title} in project ${project?.title || 'Unknown'}.`,
        type: isResubmission ? 'task_resubmitted' : 'task_submitted',
        receiver: task.assignedBy,
        sender: req.user._id,
        project: task.projectId,
        task: task._id,
        actionDetails: `GitHub: ${githubLink ? 'Available' : 'N/A'}, Demo: ${liveDemoLink ? 'Available' : 'N/A'}`
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const reviewTask = async (req, res) => {
  try {
    const { status, reviewComment, rejectionReason } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    task.reviewStatus = status;
    task.reviewComment = reviewComment;
    
    if (status === 'rejected') {
      task.rejectionReason = rejectionReason;
      for (const assignee of task.assignedTo) {
        const u = await User.findById(assignee);
        if (u) { u.performanceScore += calculatePerformance('rejected'); await u.save(); }
      }
    } else if (status === 'approved') {
      for (const assignee of task.assignedTo) {
        const u = await User.findById(assignee);
        if (u) { u.performanceScore += calculatePerformance('approved'); await u.save(); }
      }
    }

    await task.save();
    await logActivity(`task_${status}`, `Task ${status}`, req.user._id, task.projectId, task._id);
    
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const assignee of task.assignedTo) {
        await createNotification({
          title: `Task ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Admin ${req.user.name} ${status} your task ${task.title}.`,
          type: status === 'approved' ? 'task_approved' : 'task_rejected',
          receiver: assignee,
          sender: req.user._id,
          project: task.projectId,
          task: task._id,
          actionDetails: status === 'rejected' ? `Reason: ${rejectionReason}` : `Comment: ${reviewComment || 'Great job!'}`
        });
      }
    }
    
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'approved'] }
    });
    
    for (const task of tasks) {
      if (task.status !== 'overdue') {
        task.status = 'overdue';
        await task.save();
      }
    }
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'Member' }).sort({ performanceScore: -1 }).limit(10).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveTask = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'A reason for leaving the task is required.' });
    }

    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Check if user is actually assigned
    if (!task.assignedTo.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not assigned to this task.' });
    }

    // Pull member from task
    task.assignedTo = task.assignedTo.filter(memberId => memberId.toString() !== req.user._id.toString());
    await task.save();

    // Log the leave request
    await LeaveRequest.create({
      member: req.user._id,
      project: task.projectId._id,
      task: task._id,
      type: 'task_leave',
      reason: reason
    });
    
    await createNotification({
      title: 'Member Left Task',
      message: `${req.user.name} has left task '${task.title}' in project '${task.projectId.title}'. Reason: ${reason}`,
      type: 'member_removed',
      receiver: task.assignedBy, // The admin who assigned it
      sender: req.user._id,
      project: task.projectId._id,
      task: task._id
    });
    
    res.json({ success: true, message: 'You have left this task successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
