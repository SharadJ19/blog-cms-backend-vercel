const dbConnect = require("../utils/dbConnect");
const Category = require("../../../models/Category");
const Post = require("../../../models/Post");

module.exports = async (req, res) => {
  const { id } = req.query;

  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const category = await Category.findOne({ id });
        if (!category)
          return res.status(404).json({ error: "Category not found" });
        res.status(200).json(category);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch category" });
      }
      break;

    case "PUT":
      try {
        const categoryData = req.body;
        const category = await Category.findOneAndUpdate({ id }, categoryData, {
          new: true,
          runValidators: true,
        });
        if (!category)
          return res.status(404).json({ error: "Category not found" });
        res.status(200).json(category);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).json({ error: "Category name already exists" });
        } else {
          res.status(500).json({ error: "Failed to update category" });
        }
      }
      break;

    case "DELETE":
      try {
        // Check if category is in use
        const postsUsingCategory = await Post.findOne({ categoryId: id });
        if (postsUsingCategory) {
          return res.status(400).json({
            error: "Cannot delete category that is in use by posts",
          });
        }

        const category = await Category.findOneAndDelete({ id });
        if (!category)
          return res.status(404).json({ error: "Category not found" });
        res.status(200).json({ message: "Category deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
