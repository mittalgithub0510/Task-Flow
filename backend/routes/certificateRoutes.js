import express from 'express';
import { createCertificate, getCertificates, getMyCertificates, getCertificateById } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, createCertificate).get(protect, admin, getCertificates);
router.route('/my').get(protect, getMyCertificates);
router.route('/:id').get(protect, getCertificateById);

export default router;
