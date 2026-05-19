import Task from '../models/Task.js';

const checkOverdueTasks = async () => {
  try {
    const tasks = await Task.find({
      status: { $nin: ['completed', 'approved', 'rejected', 'overdue'] },
      dueDate: { $lt: new Date() }
    });
    
    for (const task of tasks) {
      task.status = 'overdue';
      await task.save();
    }
  } catch (error) {
    console.error('Overdue checker failed', error);
  }
};

export default checkOverdueTasks;
