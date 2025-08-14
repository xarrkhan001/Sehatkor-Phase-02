import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { listMedicines, createMedicine, updateMedicine, deleteMedicine } from '../controllers/pharmacy.controller.js';

const router = express.Router();

// Pharmacy-owned medicine CRUD
router.get('/medicines', authMiddleware, requireRole(['pharmacy']), listMedicines);
router.post('/medicines', authMiddleware, requireRole(['pharmacy']), createMedicine);
router.put('/medicines/:id', authMiddleware, requireRole(['pharmacy']), updateMedicine);
router.delete('/medicines/:id', authMiddleware, requireRole(['pharmacy']), deleteMedicine);

export default router;


