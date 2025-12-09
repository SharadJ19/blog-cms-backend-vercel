const dbConnect = require("../utils/dbConnect");
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
        const post = await Post.findOne({ id });
        if (!post) return res.status(404).json({ error: "Post not found" });
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
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.status(200).json(post);
      } catch (error) {
        res.status(500).json({ error: "Failed to update post" });
      }
      break;

    case "DELETE":
      try {
        const post = await Post.findOneAndDelete({ id });
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.status(200).json({ message: "Post deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete post" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
