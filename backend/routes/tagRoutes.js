import express from "express";
import Tag from "../models/Tag.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import slugify from "slugify";

const router = express.Router();

/* ---------- GET ALL TAGS ---------- */
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find({ isActive: true }).sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch tags" });
  }
});

/* ---------- CREATE TAG (Admin Only) ---------- */
router.post("/add", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: "Tag name required" });

    let slug = slugify(name, { lower: true, strict: true });
    
    const exists = await Tag.findOne({ slug });
    if (exists) return res.status(400).json({ msg: "Tag already exists" });

    const tag = await Tag.create({ name, slug });
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create tag" });
  }
});

/* ---------- DELETE TAG (Admin Only) ---------- */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ msg: "Tag deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete tag" });
  }
});

export default router;
