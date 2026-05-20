import Notification from '../models/Notification.js';

export const createNotification = async ({
  title, message, type, receiver, sender, project, task, oldValue, newValue, actionDetails, priority
}) => {
  try {
    if (receiver && sender && receiver.toString() === sender.toString()) {
      return;
    }
    await Notification.create({
      title,
      message,
      type,
      receiver,
      sender,
      project,
      task,
      oldValue,
      newValue,
      actionDetails,
      priority: priority || 'medium',
      isRead: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
