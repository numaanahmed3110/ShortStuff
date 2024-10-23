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
app.use("/api", router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(morgan("tiny"));
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "build")));

// Schema and Model definitions
const urlSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, index: true },
  url: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model("Url", urlSchema);

router.post("/shorten", async (req, res, next) => {
  let { slug, url } = req.body;
  console.log("Received POST request to /api/shorten");
  console.log("Request body:", req.body);

  try {
    // Validate the slug and url using yup schema
    await urlSchema.validate({ slug, url });

    // Disallow shortening of internal links
    if (url.includes("shawty3110.vercel.app")) {
      throw new Error("Stop it. 🛑");
    }

    // Generate a slug if not provided
    if (!slug) {
      slug = nanoid(5);
    } else {
      // Check if slug already exists in the database
      const existing = await Url.findOne({ slug });
      if (existing) {
        throw new Error("Slug in use. 🍔");
      }
    }

    // Convert slug to lowercase
    slug = slug.toLowerCase();

    // Create and save new shortened URL
    const newUrl = new Url({
      url,
      slug,
      clicks: 0,
      active: true,
    });
    const created = await newUrl.save();

    // Send the response with the shortened URL details
    res.json({
      slug: created.slug,
      originalUrl: created.url,
      clicks: created.clicks,
      active: created.active,
      createdAt: created.createdAt,
      _id: created._id,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/urls", async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
});

// Other routes
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
    return res.redirect(`/?error=${encodeURIComponent(`${slug} not found`)}`);
  } catch (error) {
    return res.redirect(`/?error=${encodeURIComponent("Link not found")}`);
  }
});

// Catch-all route (should be last)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "build", "index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(`Error occurred: ${error.message}`);
  console.error(error.stack);

  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;

  if (req.url.startsWith("/api/")) {
    return res.status(status).json({
      error: true,
      message: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }

  res.status(status).json({
    error: true,
    message: "An error occurred",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});
