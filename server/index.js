import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { nanoid } from "nanoid";

// Initialize express
const app = express();
const router = express.Router();
dotenv.config();

// Performance optimization: Connect to MongoDB before starting the server
let dbConnection;
const connectDB = async () => {
  try {
    if (!dbConnection) {
      dbConnection = await mongoose.connect(process.env.MONGODB_URI, {
        // Add connection optimizations
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        // Use connection pooling
        maxPoolSize: 10,
        minPoolSize: 5,
      });
    }
    return dbConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Optimize Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "vercel.live"],
        connectSrc: ["'self'", "https://shawty3110.vercel.app"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: "https://shawty3110.vercel.app",
    methods: ["GET", "POST"], // Limit to needed methods
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Optimize middleware usage
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(
  express.static(join(__dirname, "public"), {
    maxAge: "1d", // Add cache control
  })
);

// Optimized URL Schema
const urlSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true, // Add index for faster queries
  },
  url: {
    type: String,
    required: true,
    index: true,
  },
  clicks: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // Auto-delete after 30 days
  },
});

const Url = mongoose.model("Url", urlSchema);

// API Routes with optimizations
router.post("/shorten", async (req, res) => {
  try {
    let { url, slug } = req.body;

    // Validate input
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Add URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Generate short slug
    if (!slug) {
      slug = nanoid(7);
    }

    const newUrl = new Url({ url, slug });
    await newUrl.save();

    // Return minimal response
    res.json({ slug: newUrl.slug, url: newUrl.url });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(409).json({ error: "Slug already exists" });
    }
    console.error("Error shortening URL:", error);
    res.status(500).json({ error: "Failed to create short URL" });
  }
});

// Optimize URL listing with pagination
router.get("/urls", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const urls = await Url.find()
      .select("slug url clicks createdAt") // Select only needed fields
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(); // Convert to plain JS objects

    res.json(urls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
});

// Mount routes
app.use("/api", router);

// Optimized redirect handler
app.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const url = await Url.findOneAndUpdate(
      { slug, active: true }, // Only redirect active URLs
      { $inc: { clicks: 1 } },
      {
        new: true,
        select: "url", // Only fetch the URL field
      }
    );

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.redirect(301, url.url); // Use permanent redirect
  } catch (error) {
    res.status(500).json({ error: "Failed to redirect" });
  }
});

// Root route
app.get("/", (_, res) => {
  res.json({
    message: "URL Shortener API",
    endpoints: {
      shorten: "POST /api/shorten",
      list: "GET /api/urls",
      redirect: "GET /:slug",
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// Initialize server
const PORT = process.env.PORT || 3001;

// Ensure database connection before starting server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
