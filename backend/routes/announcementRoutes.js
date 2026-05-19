import express from 'express';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, createAnnouncement).get(protect, getAnnouncements);
router.route('/:id').delete(protect, admin, deleteAnnouncement);

export default router;
