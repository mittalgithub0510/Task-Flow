import ActivityLog from '../models/ActivityLog.js';

const logActivity = async (action, details, userId, projectId = null, taskId = null) => {
  try {
    await ActivityLog.create({
      action,
      details,
      userId,
      projectId,
      taskId
    });
  } catch (error) {
    console.error('Failed to log activity', error);
  }
};

export default logActivity;
