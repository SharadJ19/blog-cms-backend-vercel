## Blog CMS Backend

MongoDB + Vercel Serverless backend for Angular Blog CMS.

### Folder Structure

```
blog-cms-backend/
├── api/                              # Vercel Serverless Functions
│   ├── posts/
│   │   ├── index.js                  # GET all, POST create
│   │   └── [id].js                   # GET one, PUT, DELETE
│   ├── categories/
│   │   ├── index.js                  # GET all, POST create
│   │   └── [id].js                   # GET one, PUT, DELETE
│   └── utils/
│       └── dbConnect.js              # MongoDB connection
├── models/                           # MongoDB Models
│   ├── Post.js
│   └── Category.js
├── scripts/                          # Database scripts
│   └── seed-database.js              # Seeder (imports from db.json)
├── db.json                           # Your data file (MUST be here)
├── package.json
├── vercel.json
├── .env                              # Environment variables
└── README.md
```

### Quick Start

1. **Clone and install:**

```bash
git clone https://github.com/SharadJ19/blog-cms-backend-vercel
cd blog-cms-backend-vercel
npm install
```

2. **Set up MongoDB Atlas:**

   - Create free cluster at https://mongodb.com/atlas
   - Get connection string
   - Allow network access from anywhere (0.0.0.0/0)

3. **Configure environment:**

```bash
# Create .env file
echo 'MONGODB_URI="your_mongodb_connection_string"' > .env

# Add your data to db.json
# (Use your existing db.json or the example provided)
```

4. **Seed the database:**

```bash
npm run seed
```

5. **Run locally:**

```bash
npm run dev
```

6. **Deploy to Vercel:**

```bash
# First time
vercel

# Production deploy
npm run deploy
```

## API Endpoints

#### Post Endpoints:

- `GET    /api/posts` - Get all posts
- `POST   /api/posts` - Create new post
- `GET    /api/posts/:id` - Get single post
- `PUT    /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

#### Category Endpoints:

- `GET    /api/categories` - Get all categories
- `POST   /api/categories` - Create category
- `GET    /api/categories/:id` - Get single category
- `PUT    /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Data Structure

Posts use 4-character hex IDs (e.g., "8a3f", "b7c2").
All data is loaded from `db.json` during seeding.
