const dbConnect = require("../utils/dbConnect");
const Post = require("../../../models/Post");

module.exports = async (req, res) => {
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
        // Generate 4-char hex ID if not provided
        const postData = req.body;
        if (!postData.id) {
          postData.id = Math.random().toString(16).slice(2, 6);
        }

        const post = await Post.create(postData);
        res.status(201).json(post);
      } catch (error) {
        res.status(500).json({ error: "Failed to create post" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
