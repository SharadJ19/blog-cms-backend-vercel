import "dotenv/config";
import { MongoClient } from "mongodb";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./db.json");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing — check your .env file!");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db();

  await db.collection("posts").deleteMany({});
  await db.collection("categories").deleteMany({});

  await db.collection("posts").insertMany(data.posts);
  await db.collection("categories").insertMany(data.categories);

  console.log(`Seeded ${data.posts.length} posts + ${data.categories.length} categories`);
  console.log("All done! Your DB is back to original state.");
} catch (err) {
  console.error("Seed failed:", err);
} finally {
  await client.close();
}