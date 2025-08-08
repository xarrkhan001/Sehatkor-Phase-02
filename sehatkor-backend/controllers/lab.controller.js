// controllers/lab.controller.js
export const listLabTests = async (req, res) => {
  try {
    // Fetch lab test list
    res.status(200).json({ tests: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lab tests', error });
  }
};