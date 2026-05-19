import express from 'express';
import { getNotifications, getUnreadNotifications, getNotificationCount, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getNotifications);
router.route('/unread').get(protect, getUnreadNotifications);
router.route('/count').get(protect, getNotificationCount);
router.route('/read-all').put(protect, markAllAsRead);
router.route('/:id/read').put(protect, markAsRead);
router.route('/:id').delete(protect, deleteNotification);

export default router;
