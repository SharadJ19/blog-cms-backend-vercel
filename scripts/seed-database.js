import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Import models
import Post from '../models/Post.js';
import Category from '../models/Category.js';

async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');

  // Check MongoDB URI
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI not found in .env.local');
    console.log('\n💡 Create .env.local file with:');
    console.log('   MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/database"');
    process.exit(1);
  }

  // Load db.json
  const dbPath = path.join(__dirname, '..', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ ERROR: db.json file not found at:', dbPath);
    process.exit(1);
  }

  let dbData;
  try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    dbData = JSON.parse(rawData);
    console.log(`📁 Loaded db.json: ${dbData.posts?.length || 0} posts, ${dbData.categories?.length || 0} categories`);
  } catch (error) {
    console.error('❌ ERROR parsing db.json:', error.message);
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Post.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Database cleared\n');

    // Seed Categories
    if (dbData.categories && dbData.categories.length > 0) {
      console.log('🌱 Seeding categories...');
      for (const category of dbData.categories) {
        if (!category.id || !category.name) {
          console.warn(`⚠️  Skipping invalid category:`, category);
          continue;
        }
        await Category.create({
          id: category.id,
          name: category.name
        });
      }
      console.log(`✅ ${dbData.categories.length} categories seeded\n`);
    }

    // Seed Posts
    if (dbData.posts && dbData.posts.length > 0) {
      console.log('📝 Seeding posts...');
      let seededCount = 0;
      for (const post of dbData.posts) {
        if (!post.id || !post.title || !post.categoryId) {
          console.warn(`⚠️  Skipping invalid post:`, post);
          continue;
        }
        await Post.create({
          id: post.id,
          title: post.title,
          content: post.content || 'Default content',
          author: post.author || 'Anonymous',
          categoryId: post.categoryId,
          tags: post.tags || [],
          date: post.date || new Date().toISOString().split('T')[0],
          thumbnail: post.thumbnail || ''
        });
        seededCount++;
      }
      console.log(`✅ ${seededCount} posts seeded\n`);
    }

    // Show summary
    const categoryCount = await Category.countDocuments();
    const postCount = await Post.countDocuments();

    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(40));
    console.log(`📊 Categories in DB: ${categoryCount}`);
    console.log(`📊 Posts in DB: ${postCount}`);
    console.log('\n✅ Backend is ready!');

  } catch (error) {
    console.error('❌ SEEDING FAILED:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

seedDatabase();