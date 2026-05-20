import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectProgress,
  joinProject,
  leaveProject,
  unjoinProject,
  getJoinedMembers
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProjectById).put(protect, admin, updateProject).delete(protect, admin, deleteProject);
router.route('/:id/joined-members').get(protect, getJoinedMembers);
router.route('/:id/add-member').post(protect, admin, addMemberToProject);
router.route('/:id/join').post(protect, joinProject);
router.route('/:id/leave').post(protect, leaveProject);
router.route('/:id/unjoin').post(protect, unjoinProject);
router.route('/:id/progress').get(protect, getProjectProgress);

export default router;
