const dbConnect = require("../utils/dbConnect");
const Category = require("../../../models/Category");

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
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
      }
      break;

    case "POST":
      try {
        const categoryData = req.body;
        if (!categoryData.id) {
          categoryData.id = Math.random().toString(16).slice(2, 6);
        }

        const category = await Category.create(categoryData);
        res.status(201).json(category);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).json({ error: "Category already exists" });
        } else {
          res.status(500).json({ error: "Failed to create category" });
        }
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
