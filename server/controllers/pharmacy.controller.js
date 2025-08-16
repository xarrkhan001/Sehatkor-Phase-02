// controllers/pharmacy.controller.js
import Medicine from '../models/Medicine.js';
import cloudinary from '../config/cloudinary.js';

export const listMedicines = async (req, res) => {
  try {
    const providerId = req.userId;
    const medicines = await Medicine.find({ providerId }).sort({ createdAt: -1 });
    res.status(200).json({ medicines });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error: error?.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const providerId = req.userId;
    const { name, description, price, category, stock, imageUrl, imagePublicId, googleMapLink, city, detailAddress } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const doc = await Medicine.create({
      name,
      description: description || '',
      price: typeof price === 'number' ? price : Number(price) || 0,
      category: category || 'Other',
      stock: typeof stock === 'number' ? stock : Number(stock) || 0,
      imageUrl,
      imagePublicId,
      googleMapLink,
      city,
      detailAddress,
      providerId,
      providerName: req.body.providerName || 'Pharmacy',
      providerType: 'pharmacy',
    });
    res.status(201).json({ medicine: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error creating medicine', error: error?.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const providerId = req.userId;
    const { id } = req.params;
    const updates = req.body || {};
    const doc = await Medicine.findOneAndUpdate(
      { _id: id, providerId },
      {
        $set: {
          ...(updates.name != null && { name: updates.name }),
          ...(updates.description != null && { description: updates.description }),
          ...(updates.price != null && { price: typeof updates.price === 'number' ? updates.price : Number(updates.price) || 0 }),
          ...(updates.category != null && { category: updates.category }),
          ...(updates.stock != null && { stock: typeof updates.stock === 'number' ? updates.stock : Number(updates.stock) || 0 }),
          ...(updates.imageUrl != null && { imageUrl: updates.imageUrl }),
          ...(updates.imagePublicId != null && { imagePublicId: updates.imagePublicId }),
          ...(updates.googleMapLink != null && { googleMapLink: updates.googleMapLink }),
          ...(updates.city != null && { city: updates.city }),
          ...(updates.detailAddress != null && { detailAddress: updates.detailAddress }),
        }
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Medicine not found' });
    res.status(200).json({ medicine: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medicine', error: error?.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const providerId = req.userId;
    const { id } = req.params;
    const doc = await Medicine.findOneAndDelete({ _id: id, providerId });
    if (!doc) return res.status(404).json({ message: 'Medicine not found' });
    // Best-effort delete image from Cloudinary
    try {
      if (doc.imagePublicId) {
        await cloudinary.uploader.destroy(doc.imagePublicId, { resource_type: 'image' });
      }
    } catch {}
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medicine', error: error?.message });
  }
};

