import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  searchDoctors,
  getDoctorById,
  listDoctorServices,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from '../controllers/doctor.controller.js';

const router = express.Router();

// profile and discovery
router.get('/me', authMiddleware, requireRole(['doctor']), getDoctorProfile);
router.put('/me', authMiddleware, requireRole(['doctor']), updateDoctorProfile);
router.get('/verified', getAllDoctors);
router.get('/search', searchDoctors);
// doctor service CRUD (place before dynamic :doctorId route to avoid conflicts)
router.get('/services', authMiddleware, requireRole(['doctor']), listDoctorServices);
router.post('/services', authMiddleware, requireRole(['doctor']), createDoctorService);
router.put('/services/:id', authMiddleware, requireRole(['doctor']), updateDoctorService);
router.delete('/services/:id', authMiddleware, requireRole(['doctor']), deleteDoctorService);

// keep this last so it doesn't catch other routes
router.get('/:doctorId', getDoctorById);

export default router;


