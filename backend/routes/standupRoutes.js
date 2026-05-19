import express from 'express';
import { createStandup, getStandups, getMyStandups, getProjectStandups } from '../controllers/standupController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createStandup).get(protect, admin, getStandups);
router.route('/my').get(protect, getMyStandups);
router.route('/project/:projectId').get(protect, getProjectStandups);

export default router;
