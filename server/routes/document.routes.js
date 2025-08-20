// routes/document.routes.js
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import uploadDoc from '../middlewares/docUpload.middleware.js';
import {
  uploadProviderDocument,
  getMyDocument,
  deleteDocument,
  getPendingDocuments,
  getDocumentByUser,
  updateDocumentStatus,
} from '../controllers/document.controller.js';

const router = express.Router();

// Provider: upload one document and get own doc
router.post('/documents/upload', authMiddleware, uploadDoc.single('file'), uploadProviderDocument);
router.get('/documents/mine', authMiddleware, getMyDocument);

// Admin: list pending docs, get by user, delete documents
router.get('/documents/pending', /*authMiddleware, requireRole(['admin']),*/ getPendingDocuments);
router.get('/documents/by-user/:userId', /*authMiddleware, requireRole(['admin']),*/ getDocumentByUser);
router.delete('/documents/:id', /*authMiddleware, requireRole(['admin']),*/ deleteDocument);

export default router;
