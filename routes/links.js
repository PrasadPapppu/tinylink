import express from "express";
import {
  createLink,
  getAllLinks,
  getLink,
  deleteLink,
  incrementClick
} from "../controllers/linksController.js";

const router = express.Router();

// Helper: validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper: validate code format
const codeRegex = /^[A-Za-z0-9]{6,8}$/;

// --------------------------
// POST /api/links  (Create)
// --------------------------
router.post("/", async (req, res) => {
  const { url, code } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (!code || !codeRegex.test(code)) {
    return res.status(400).json({ error: "Invalid code format" });
  }

  try {
    // Check if code already exists
    const existing = await getLink(code);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Code already exists" });
    }

    const result = await createLink(code, url);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------------
// GET /api/links  (List All)
// --------------------------
router.get("/", async (req, res) => {
  try {
    const result = await getAllLinks();
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------------
// GET /api/links/:code  (Stats)
// --------------------------
router.get("/:code", async (req, res) => {
  const code = req.params.code;

  try {
    const result = await getLink(code);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------------
// DELETE /api/links/:code
// --------------------------
router.delete("/:code", async (req, res) => {
  const code = req.params.code;

  try {
    const existing = await getLink(code);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    await deleteLink(code);
    res.json({ deleted: true });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
