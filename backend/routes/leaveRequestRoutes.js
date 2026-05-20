import express from 'express';
import { getLeaveRequests, markLeaveRequestReviewed } from '../controllers/leaveRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getLeaveRequests);
router.route('/:id/reviewed').patch(protect, markLeaveRequestReviewed);

export default router;
