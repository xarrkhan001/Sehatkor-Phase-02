// routes/upload.routes.js
import express from 'express';
import upload from '../middlewares/upload.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadImage);

export default router;
