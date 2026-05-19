import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  submitTask,
  reviewTask,
  getOverdueTasks,
  getLeaderboard
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/leaderboard').get(protect, getLeaderboard);
router.route('/overdue').get(protect, admin, getOverdueTasks);

router.route('/').post(protect, admin, createTask).get(protect, getTasks);
router.route('/:id').get(protect, getTaskById).put(protect, admin, updateTask).delete(protect, admin, deleteTask);
router.route('/:id/status').put(protect, updateTaskStatus);
router.route('/:id/submit').put(protect, submitTask);
router.route('/:id/review').put(protect, admin, reviewTask);

export default router;
