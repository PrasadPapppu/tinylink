import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import linkRoutes from "../routes/links.js";
import { pool } from "../db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/links", linkRoutes);

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// Dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Stats page
app.get("/code/:code", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/stats.html"));
});

// Redirect (IMPORTANT — must be before static)
app.get("/:code", async (req, res) => {
  const code = req.params.code;

  try {
    const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);

    if (result.rows.length === 0) {
      return res.status(404).send("Not found");
    }

    await pool.query(`
      UPDATE links
      SET total_clicks = total_clicks + 1,
          last_clicked = NOW()
      WHERE code = $1
    `, [code]);

    return res.redirect(302, result.rows[0].target_url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

// Serve static files (MOVE THIS TO THE END)
app.use(express.static(path.join(__dirname, "../public")));

export default app;
