import express from 'express';
import { createBug, getBugs, getMyBugs, updateBugStatus } from '../controllers/bugController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBug).get(protect, admin, getBugs);
router.route('/my').get(protect, getMyBugs);
router.route('/:id/status').put(protect, admin, updateBugStatus);

export default router;
