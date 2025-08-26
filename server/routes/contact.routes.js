import express from 'express';
import { sendContactEmail } from '../config/email.js';

const router = express.Router();

// POST /api/contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, category, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'name, email and message are required' });
    }

    const result = await sendContactEmail({ name, email, phone, subject, category, message });

    if (!result?.success) {
      return res.status(500).json({ success: false, error: result?.error || 'Failed to send email' });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || 'Unexpected error' });
  }
});

export default router;
