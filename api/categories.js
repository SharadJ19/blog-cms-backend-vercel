import dbConnect from "./utils/dbConnect.js";
import Category from "../models/Category.js";

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
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
      }
      break;

    case "POST":
      try {
        const categoryData = req.body;

        // Generate 4-char hex ID if not provided
        if (!categoryData.id) {
          categoryData.id = Math.random().toString(16).slice(2, 6);
        }

        const category = await Category.create(categoryData);
        res.status(201).json(category);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).json({ error: "Category name already exists" });
        } else {
          res.status(500).json({ error: "Failed to create category" });
        }
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
