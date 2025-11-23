// api/index.js
import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../db.json");
let db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function generateId() {
  return Math.random().toString(16).substr(2, 4);
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// POSTS
app.get("/posts", (req, res) => res.json(db.posts));
app.get("/posts/:id", (req, res) => {
  const post = db.posts.find((p) => p.id === req.params.id);
  post ? res.json(post) : res.status(404).json({ error: "Not found" });
});
app.post("/posts", (req, res) => {
  const newPost = {
    id: generateId(),
    ...req.body,
    date: new Date().toISOString().split("T")[0],
  };
  db.posts.unshift(newPost);
  saveDb();
  res.status(201).json(newPost);
});
app.put("/posts/:id", (req, res) => {
  const i = db.posts.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.posts[i] = { ...db.posts[i], ...req.body, id: db.posts[i].id };
  saveDb();
  res.json(db.posts[i]);
});
app.delete("/posts/:id", (req, res) => {
  const i = db.posts.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  const deleted = db.posts.splice(i, 1);
  saveDb();
  res.json(deleted[0]);
});

// CATEGORIES
app.get("/categories", (req, res) => res.json(db.categories));
app.get("/categories/:id", (req, res) => {
  const cat = db.categories.find((c) => c.id === req.params.id);
  cat ? res.json(cat) : res.status(404).json({ error: "Not found" });
});

// Vercel export
let server;
export default function handler(req, res) {
  if (!server) server = createServer(app);
  server.emit("request", req, res);
}
