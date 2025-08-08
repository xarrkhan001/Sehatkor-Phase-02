// controllers/pharmacy.controller.js
export const listMedicines = async (req, res) => {
  try {
    // Fetch medicine list
    res.status(200).json({ medicines: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error });
  }
};
