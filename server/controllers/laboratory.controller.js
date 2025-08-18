import LaboratoryTest from '../models/LaboratoryTest.js';
import cloudinary from '../config/cloudinary.js';

export const listLaboratoryTests = async (req, res) => {
  try {
    const tests = await LaboratoryTest.find({ providerId: req.userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ tests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error: error.message });
  }
};

export const createLaboratoryTest = async (req, res) => {
  try {
    const { name, description, price, category, duration, imageUrl, imagePublicId, providerName, googleMapLink, city, detailAddress } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const test = await LaboratoryTest.create({
      name,
      description: description || '',
      price: typeof price === 'number' ? price : Number(price) || 0,
      category: category || 'Test',
      duration,
      imageUrl,
      imagePublicId,
      googleMapLink,
      city,
      detailAddress,
      providerId: req.userId,
      providerName: providerName || 'Laboratory',
      providerType: 'laboratory',
    });
    
    res.status(201).json({ test });
  } catch (error) {
    res.status(500).json({ message: 'Error creating test', error: error.message });
  }
};

export const updateLaboratoryTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    
    const test = await LaboratoryTest.findOneAndUpdate(
      { _id: id, providerId: req.userId },
      {
        $set: {
          ...(updates.name != null && { name: updates.name }),
          ...(updates.description != null && { description: updates.description }),
          ...(updates.price != null && { price: typeof updates.price === 'number' ? updates.price : Number(updates.price) || 0 }),
          ...(updates.category != null && { category: updates.category }),
          ...(updates.duration != null && { duration: updates.duration }),
          ...(updates.imageUrl != null && { imageUrl: updates.imageUrl }),
          ...(updates.imagePublicId != null && { imagePublicId: updates.imagePublicId }),
          ...(updates.googleMapLink != null && { googleMapLink: updates.googleMapLink }),
          ...(updates.city != null && { city: updates.city }),
          ...(updates.detailAddress != null && { detailAddress: updates.detailAddress }),
        }
      },
      { new: true }
    );
    
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.status(200).json({ test });
  } catch (error) {
    res.status(500).json({ message: 'Error updating test', error: error.message });
  }
};

export const deleteLaboratoryTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await LaboratoryTest.findOneAndDelete({ _id: id, providerId: req.userId });
    
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Try to delete image from Cloudinary if it exists
    try {
      if (test.imagePublicId) {
        await cloudinary.uploader.destroy(test.imagePublicId, { resource_type: 'image' });
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion failed:', cloudinaryError);
      // Continue with deletion even if Cloudinary fails
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test', error: error.message });
  }
};
