const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

// Import models
const Post = require("../models/Post");
const Category = require("../models/Category");

// Load data from db.json
function loadDataFromFile() {
  try {
    const filePath = path.join(__dirname, "..", "db.json");

    if (!fs.existsSync(filePath)) {
      console.error("❌ ERROR: db.json file not found!");
      console.log(`   Expected at: ${filePath}`);
      console.log(
        "\n💡 Please create a db.json file in the root directory with your data."
      );
      console.log("   Example structure:");
      console.log(`
      {
        "posts": [
          {
            "id": "8a3f",
            "title": "Post Title",
            "content": "Post content...",
            "author": "Author Name",
            "categoryId": "c4e9",
            "tags": ["tag1", "tag2"],
            "date": "2025-02-15",
            "thumbnail": "https://example.com/image.jpg"
          }
        ],
        "categories": [
          {
            "id": "c4e9",
            "name": "Category Name"
          }
        ]
      }
      `);
      return null;
    }

    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    // Validate structure
    if (!data.posts || !data.categories) {
      console.error(
        '❌ ERROR: db.json must have "posts" and "categories" arrays'
      );
      return null;
    }

    console.log(`📁 Loaded from db.json:`);
    console.log(`   Posts: ${data.posts.length}`);
    console.log(`   Categories: ${data.categories.length}`);

    return data;
  } catch (error) {
    console.error("❌ ERROR reading db.json:", error.message);
    return null;
  }
}

async function seedDatabase() {
  console.log("🚀 Starting database seeding...\n");

  // Load data
  const dbData = loadDataFromFile();
  if (!dbData) {
    process.exit(1);
  }

  // Check for MongoDB URI
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI not found in environment variables");
    console.log("\n💡 Create a .env.local file in root with:");
    console.log(
      '   MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/database"'
    );
    console.log("\n🔗 Or run with:");
    console.log('   MONGODB_URI="your_uri" npm run seed');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data (optional - comment out if you want to keep data)
    console.log("🧹 Clearing existing data...");
    await Post.deleteMany({});
    await Category.deleteMany({});
    console.log("✅ Database cleared\n");

    // Seed Categories
    console.log("🌱 Seeding categories...");
    for (const category of dbData.categories) {
      // Validate category data
      if (!category.id || !category.name) {
        console.warn(
          `⚠️  Skipping invalid category: ${JSON.stringify(category)}`
        );
        continue;
      }

      await Category.findOneAndUpdate(
        { id: category.id },
        {
          id: category.id,
          name: category.name,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${dbData.categories.length} categories seeded\n`);

    // Seed Posts
    console.log("📝 Seeding posts...");
    let seededPosts = 0;
    for (const post of dbData.posts) {
      // Validate post data
      if (!post.id || !post.title || !post.categoryId) {
        console.warn(`⚠️  Skipping invalid post: ${JSON.stringify(post)}`);
        continue;
      }

      // Check if category exists
      const categoryExists = await Category.findOne({ id: post.categoryId });
      if (!categoryExists) {
        console.warn(
          `⚠️  Skipping post "${post.title}" - category ${post.categoryId} not found`
        );
        continue;
      }

      await Post.findOneAndUpdate(
        { id: post.id },
        {
          id: post.id,
          title: post.title || "Untitled Post",
          content: post.content || "No content",
          author: post.author || "Anonymous",
          categoryId: post.categoryId,
          tags: post.tags || [],
          date: post.date || new Date().toISOString().split("T")[0],
          thumbnail: post.thumbnail || "",
        },
        { upsert: true, new: true }
      );
      seededPosts++;
    }
    console.log(`✅ ${seededPosts} posts seeded\n`);

    // Verification
    const categoryCount = await Category.countDocuments();
    const postCount = await Post.countDocuments();

    console.log("📊 SEEDING COMPLETE!");
    console.log("=".repeat(40));
    console.log(`✅ Categories in database: ${categoryCount}`);
    console.log(`✅ Posts in database: ${postCount}`);
    console.log("");

    // Show sample data
    const categories = await Category.find().limit(5);
    console.log("📂 Sample Categories:");
    categories.forEach((cat) => {
      console.log(`   • ${cat.name} (ID: ${cat.id})`);
    });

    console.log("");

    const posts = await Post.find().limit(5).populate("categoryId", "name");
    console.log("📄 Sample Posts:");
    posts.forEach((post) => {
      console.log(
        `   • "${post.title}" by ${post.author} (Category: ${post.categoryId})`
      );
    });

    console.log("\n🎉 Database is ready for use!");
  } catch (error) {
    console.error("❌ SEEDING FAILED:", error.message);
    console.error(error.stack);
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("\n🔌 MongoDB connection closed");
    }
    process.exit(0);
  }
}

// Run seeder
seedDatabase();
