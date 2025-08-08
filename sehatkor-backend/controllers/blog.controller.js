// controllers/blog.controller.js
export const listBlogs = async (req, res) => {
  try {
    // Return list of blogs
    res.status(200).json({ blogs: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};