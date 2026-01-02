import express from 'express';
import { updateUser, deleteUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.put(
  '/:userId',
  authMiddleware,
  roleMiddleware(['tenant_admin', 'user']),
  updateUser
);

router.delete(
  '/:userId',
  authMiddleware,
  roleMiddleware(['tenant_admin']),
  deleteUser
);

export default router;
