import dbConnect from "../utils/dbConnect.js";
import Category from "../../models/Category.js";
import Post from "../../models/Post.js";

// CORS headers function
const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  // Set CORS headers immediately
  setCorsHeaders(res);

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  switch (req.method) {
    case "GET":
      try {
        const category = await Category.findOne({ id });
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
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
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
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
        // Check if category is used in any posts
        const postsWithCategory = await Post.findOne({ categoryId: id });
        if (postsWithCategory) {
          return res.status(400).json({
            error: "Cannot delete category that is in use by posts",
          });
        }

        const category = await Category.findOneAndDelete({ id });
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "OPTIONS"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
