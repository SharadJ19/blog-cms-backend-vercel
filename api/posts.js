import dbConnect from "./utils/dbConnect.js";
import Post from "../models/Post.js";

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

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  switch (req.method) {
    case "GET":
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
      }
      break;

    case "POST":
      try {
        const postData = req.body;

        // Generate 4-char hex ID if not provided
        if (!postData.id) {
          postData.id = Math.random().toString(16).slice(2, 6);
        }

        // Ensure required fields
        if (!postData.date) {
          postData.date = new Date().toISOString().split("T")[0];
        }

        const post = await Post.create(postData);
        res.status(201).json(post);
      } catch (error) {
        res.status(500).json({ error: "Failed to create post" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
