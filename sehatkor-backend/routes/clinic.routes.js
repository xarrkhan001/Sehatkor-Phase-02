import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { listClinicServices, createClinicService, updateClinicService, deleteClinicService } from '../controllers/clinic.controller.js';

const router = express.Router();

router.get('/services', authMiddleware, requireRole(['clinic/hospital']), listClinicServices);
router.post('/services', authMiddleware, requireRole(['clinic/hospital']), createClinicService);
router.put('/services/:id', authMiddleware, requireRole(['clinic/hospital']), updateClinicService);
router.delete('/services/:id', authMiddleware, requireRole(['clinic/hospital']), deleteClinicService);

export default router;


