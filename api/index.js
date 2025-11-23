import express from "express";
import { createServer } from "http";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

let client;
let db;
async function connectDb() {
  if (db) return db;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  return db;
}

function genId() {
  return Math.random().toString(16).slice(2, 6);
}

// POSTS — full CRUD
app.get("/posts", async (_, res) => {
  const db = await connectDb();
  const posts = await db.collection("posts").find({}).sort({ date: -1 }).toArray();
  res.json(posts);
});
app.get("/posts/:id", async (req, res) => {
  const db = await connectDb();
  const post = await db.collection("posts").findOne({ id: req.params.id });
  post ? res.json(post) : res.status(404).json({ error: "Not found" });
});
app.post("/posts", async (req, res) => {
  const db = await connectDb();
  const newPost = { id: genId(), ...req.body, date: new Date().toISOString().split("T")[0] };
  await db.collection("posts").insertOne(newPost);
  res.status(201).json(newPost);
});
app.put("/posts/:id", async (req, res) => {
  const db = await connectDb();
  const result = await db.collection("posts").replaceOne(
    { id: req.params.id },
    { ...req.body, id: req.params.id }
  );
  result.matchedCount ? res.json({ ...req.body, id: req.params.id }) : res.status(404).json({ error: "Not found" });
});
app.delete("/posts/:id", async (req, res) => {
  const db = await connectDb();
  const result = await db.collection("posts").deleteOne({ id: req.params.id });
  result.deletedCount ? res.json({ success: true }) : res.status(404).json({ error: "Not found" });
});

// CATEGORIES — full CRUD
app.get("/categories", async (_, res) => {
  const db = await connectDb();
  res.json(await db.collection("categories").find({}).toArray());
});
app.get("/categories/:id", async (req, res) => {
  const db = await connectDb();
  const cat = await db.collection("categories").findOne({ id: req.params.id });
  cat ? res.json(cat) : res.status(404).json({ error: "Not found" });
});
app.post("/categories", async (req, res) => {
  const db = await connectDb();
  const newCat = { id: genId(), ...req.body };
  await db.collection("categories").insertOne(newCat);
  res.status(201).json(newCat);
});
app.put("/categories/:id", async (req, res) => {
  const db = await connectDb();
  const result = await db.collection("categories").replaceOne(
    { id: req.params.id },
    { ...req.body, id: req.params.id }
  );
  result.matchedCount ? res.json({ ...req.body, id: req.params.id }) : res.status(404).json({ error: "Not found" });
});
app.delete("/categories/:id", async (req, res) => {
  const db = await connectDb();
  const result = await db.collection("categories").deleteOne({ id: req.params.id });
  result.deletedCount ? res.json({ success: true }) : res.status(404).json({ error: "Not found" });
});

// Vercel
let server;
export default function handler(req, res) {
  if (!server) server = createServer(app);
  server.emit("request", req, res);
}