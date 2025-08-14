import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { 
  listLaboratoryTests, 
  createLaboratoryTest, 
  updateLaboratoryTest, 
  deleteLaboratoryTest 
} from '../controllers/laboratory.controller.js';

const router = express.Router();

// All laboratory test routes require authentication and laboratory role
router.get('/tests', authMiddleware, requireRole(['laboratory']), listLaboratoryTests);
router.post('/tests', authMiddleware, requireRole(['laboratory']), createLaboratoryTest);
router.put('/tests/:id', authMiddleware, requireRole(['laboratory']), updateLaboratoryTest);
router.delete('/tests/:id', authMiddleware, requireRole(['laboratory']), deleteLaboratoryTest);

export default router;
