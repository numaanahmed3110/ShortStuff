import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { nanoid } from "nanoid";

const app = express();
const router = express.Router();

dotenv.config();

// CORS configuration - must be first
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://shawty3110.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Schema definition
const urlSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Url = mongoose.model("Url", urlSchema);

// URL Shortening endpoint
router.post("/shorten", async (req, res) => {
  console.log("Received shortening request:", req.body);

  try {
    let { url, slug } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Add http:// if protocol is missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }

    // Validate and sanitize slug
    if (slug) {
      // Check if slug is already taken
      const existingUrl = await Url.findOne({ slug });
      if (existingUrl) {
        return res
          .status(400)
          .json({ error: "This custom URL is already in use" });
      }

      // Sanitize slug
      slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9-]/g, "");
    } else {
      // Generate random slug
      slug = nanoid(7);
    }

    // Prevent shortening of internal links
    if (url.includes("shawty3110.vercel.app")) {
      return res
        .status(400)
        .json({ error: "Cannot shorten URLs from this domain" });
    }

    // Create new URL document
    const newUrl = new Url({
      url,
      slug,
      clicks: 0,
      active: true,
    });

    // Save to database
    const savedUrl = await newUrl.save();

    console.log("Successfully shortened URL:", savedUrl);

    res.status(201).json({
      slug: savedUrl.slug,
      originalUrl: savedUrl.url,
      shortUrl: `${req.protocol}://${req.get("host")}/${savedUrl.slug}`,
      clicks: savedUrl.clicks,
      active: savedUrl.active,
      createdAt: savedUrl.createdAt,
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({
      error: "Failed to shorten URL",
      details: error.message,
    });
  }
});

// Get all URLs endpoint
router.get("/urls", async (req, res) => {
  console.log("Received request for /api/urls");
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    console.log(`Found ${urls.length} URLs`);
    return res.status(200).json(urls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch URLs",
      details: error.message,
    });
  }
});

// Redirect endpoint
app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const url = await Url.findOneAndUpdate(
      { slug },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (url) {
      return res.redirect(url.url);
    }
    return res.status(404).json({ error: "URL not found" });
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Mount router
app.use("/api", router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
