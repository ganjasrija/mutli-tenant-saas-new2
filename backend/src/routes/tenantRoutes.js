import express from 'express';
import {
  getTenantDetails,
  updateTenant,
  listAllTenants,listTenantUsers
} from '../controllers/tenantController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// API 5
router.get('/:tenantId', authMiddleware, getTenantDetails);

// API 6
router.put('/:tenantId', authMiddleware, updateTenant);
router.get('/:tenantId/users', authMiddleware, listTenantUsers);
// API 7
router.get('/', authMiddleware, listAllTenants);

export default router;
