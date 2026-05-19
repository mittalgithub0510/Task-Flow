import express from 'express';
import { createBlocker, getBlockers, getMyBlockers, replyToBlocker, resolveBlocker } from '../controllers/blockerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBlocker).get(protect, admin, getBlockers);
router.route('/my').get(protect, getMyBlockers);
router.route('/:id/reply').put(protect, admin, replyToBlocker);
router.route('/:id/resolve').put(protect, resolveBlocker);

export default router;
