import express from "express";
import mongoose from "mongoose";
import HomeSection from "../models/HomeSection.js";
import Product from "../models/Product.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { getCache, setCache, clearCache } from "../utils/cache.js";

const router = express.Router();

/* ----------------------------------
        GET ALL HOME SECTIONS
---------------------------------- */
router.get("/", async (req, res) => {
  try {
    const cacheKey = "home_sections";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const sections = await HomeSection.find().populate("items.productId").lean();

    setCache(cacheKey, sections, 300000); // 5 mins
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Fetch failed" });
  }
});

/* ----------------------------------
        GET SINGLE SECTION
---------------------------------- */
router.get("/:key", async (req, res) => {
  try {
    const cacheKey = `home_section_${req.params.key}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const section = await HomeSection.findOne({
      key: req.params.key,
    }).populate("items.productId").lean();

    if (!section) return res.status(404).json({ msg: "Section not found" });

    setCache(cacheKey, section, 300000); // 5 mins
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Fetch failed" });
  }
});

/* ----------------------------------
        UPDATE SECTION ITEMS
---------------------------------- */
router.put("/:key", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items))
      return res.status(400).json({
        msg: "Items array required",
      });

    if (items.length !== 4)
      return res.status(400).json({
        msg: "Exactly 4 products required",
      });

    for (const i of items) {
      if (
        !mongoose.Types.ObjectId.isValid(i.productId) ||
        typeof i.position !== "number"
      ) {
        return res.status(400).json({
          msg: "Invalid payload",
        });
      }
    }

    const updated = await HomeSection.findOneAndUpdate(
      { key: req.params.key },
      { items },
      {
        new: true,
        upsert: true,
      },
    ).populate("items.productId");

    clearCache("home_section");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});

export default router;
