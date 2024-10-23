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

// Configure Helmet with appropriate CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "vercel.live"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Basic middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "build")));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// URL Schema
const urlSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model("Url", urlSchema);

// API Routes
router.post("/shorten", async (req, res) => {
  try {
    let { url, slug } = req.body;

    if (!slug) {
      slug = nanoid(7);
    }

    const newUrl = new Url({ url, slug });
    await newUrl.save();

    res.json(newUrl);
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/urls", async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mount API routes
app.use("/api", router);

// Redirect route for shortened URLs
app.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const url = await Url.findOneAndUpdate(
      { slug },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (url) {
      return res.redirect(url.url);
    }
    res.status(404).json({ error: "URL not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root route handler
app.get("/", (req, res) => {
  res.json({
    message: "URL Shortener API",
    endpoints: {
      shorten: "POST /api/shorten",
      list: "GET /api/urls",
      redirect: "GET /:slug",
    },
  });
});

// Catch-all route handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
