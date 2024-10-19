import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import * as yup from "yup";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();

dotenv.config();
main().catch((err) => console.log(err));
app.get("/favicon.ico", (req, res) => res.status(204));

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit process on error
  }
}
main();
const urlSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  url: { type: String, required: true },
});

const Url = mongoose.model("Url", urlSchema);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://vercel.live"],
      fontSrc: ["'self'", "https://shawty-six.vercel.app"],
      styleSrc: ["'self'", "https://shawty-six.vercel.app"],
      imgSrc: ["'none'"], // This will prevent favicon requests
    },
  })
);
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

app.get("/url/:id", async (req, res) => {
  const { id: slug } = req.params;
  try {
    const url = await Url.findOne({ slug });
    if (url) {
      const fullShortUrl = `${req.protocol}://${req.get("host")}/${url.slug}`;
      return res.json({ slug: url.slug, fullShortUrl });
    }
    return res.status(404).json({ error: "URL not found" });
  } catch (error) {
    console.error("Error in /url/:id route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/:id", async (req, res, next) => {
  const { id: slug } = req.params;
  try {
    const url = await Url.findOne({ slug });
    if (url) {
      return res.redirect(url.url);
    }
    return res.redirect(`/?error=${encodeURIComponent(`${slug} not found`)}`);
  } catch (error) {
    console.error("Error in /:id route:", error);
    return res.redirect(`/?error=${encodeURIComponent("Link not found")}`);
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });

    if (!slug) {
      const { nanoid } = await import("nanoid");
      slug = nanoid(5);
    } else {
      const existing = await Url.findOne({ slug });
      if (existing) {
        throw new Error("Slug in use");
      }
    }

    slug = slug.toLowerCase();
    const newUrl = new Url({ slug, url });
    const created = await newUrl.save();
    res.json(created);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error); // If headers already sent, delegate to default error handler
  }

  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? "N/A" : error.stack,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listning on port http://localhost:${PORT}`);
});
