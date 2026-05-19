import express from 'express';
import { getAdminDashboard, getMemberDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/admin').get(protect, admin, getAdminDashboard);
router.route('/member').get(protect, getMemberDashboard);

export default router;
