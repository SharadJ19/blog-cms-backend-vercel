import dbConnect from "./utils/dbConnect";
import Post from "../models/Post";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const posts = await Post.find().sort({ createdAt: -1 });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  } else if (req.method === "POST") {
    try {
      const postData = req.body;
      if (!postData.id) {
        postData.id = Math.random().toString(16).slice(2, 6);
      }

      const post = await Post.create(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
