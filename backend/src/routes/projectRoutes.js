import express from 'express';
import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,getProjectById
} from '../controllers/projectController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import taskRoutes from './taskRoutes.js';

const router = express.Router();

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, listProjects);
router.put('/:projectId', authMiddleware, updateProject);
router.delete('/:projectId', authMiddleware, deleteProject);
router.get("/:projectId", authMiddleware, getProjectById);
router.use('/:projectId/tasks', authMiddleware, taskRoutes);

export default router;
