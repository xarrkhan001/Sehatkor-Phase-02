// controllers/document.controller.js
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import ProviderDocument from '../models/ProviderDocument.js';

function uploadStreamToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sehatkor/provider-docs', resource_type: 'raw', use_filename: true, ...opts },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// POST /api/documents/upload
export const uploadProviderDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Ensure only one active document per user: delete previous if exists
    const existing = await ProviderDocument.findOne({ userId: req.userId });
    if (existing) {
      try {
        await cloudinary.uploader.destroy(existing.public_id, { resource_type: 'raw' });
      } catch {}
      await ProviderDocument.deleteOne({ _id: existing._id });
    }

    const result = await uploadStreamToCloudinary(file.buffer, { resource_type: 'raw' });

    const doc = await ProviderDocument.create({
      userId: req.userId,
      url: result.secure_url,
      public_id: result.public_id,
      fileName: file.originalname,
      fileSize: file.size,
      resourceType: 'raw',
      status: 'pending',
    });

    return res.status(201).json({ success: true, document: doc });
  } catch (err) {
    console.error('Doc upload error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Error uploading document' });
  }
};

// GET /api/documents/mine
export const getMyDocument = async (req, res) => {
  try {
    const doc = await ProviderDocument.findOne({ userId: req.userId });
    res.status(200).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch document' });
  }
};

// DELETE /api/documents/:id (admin can delete any document)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ProviderDocument.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(doc.public_id, { resource_type: 'raw' });
    } catch {}
    
    // Delete from database
    await ProviderDocument.deleteOne({ _id: doc._id });

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to delete document' });
  }
};

// ----- Admin endpoints -----
// GET /api/documents/pending
export const getPendingDocuments = async (_req, res) => {
  try {
    const docs = await ProviderDocument.find({ status: 'pending' }).populate('userId', 'name email role phone');
    res.status(200).json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch pending documents' });
  }
};

// GET /api/documents/by-user/:userId
export const getDocumentByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await ProviderDocument.findOne({ userId });
    res.status(200).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch document' });
  }
};

// PATCH /api/documents/:id/status
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'verified' | 'rejected' | 'pending'
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const doc = await ProviderDocument.findByIdAndUpdate(
      id,
      { status, ...(notes ? { notes } : {}) },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to update status' });
  }
};
