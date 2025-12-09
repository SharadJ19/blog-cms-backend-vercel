import dbConnect from "../utils/dbConnect.js";
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
        const post = await Post.findOne({ id });
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch post" });
      }
      break;

    case "PUT":
      try {
        const postData = req.body;
        const post = await Post.findOneAndUpdate({ id }, postData, {
          new: true,
          runValidators: true,
        });
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
      } catch (error) {
        res.status(500).json({ error: "Failed to update post" });
      }
      break;

    case "DELETE":
      try {
        const post = await Post.findOneAndDelete({ id });
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete post" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "OPTIONS"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
