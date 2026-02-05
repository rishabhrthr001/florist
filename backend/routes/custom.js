import express from "express";
import CustomBouquet from "../models/CustomBouquet.js";
import Product from "../models/Product.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

/* =====================================================
   PUBLIC — USER SIDE
===================================================== */

router.get("/", async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.type) {
      query.type = req.query.type;
    }

    const items = await CustomBouquet.find(query)
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("PUBLIC FETCH ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch items" });
  }
});

/* =====================================================
   ADMIN — FULL CONTROL
===================================================== */

router.get("/admin", requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = {};

    if (req.query.type) {
      query.type = req.query.type;
    }

    const items = await CustomBouquet.find(query)
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("ADMIN FETCH ERROR:", err);
    res.status(500).json({ msg: "Fetch failed" });
  }
});

/* =====================================================
   CREATE
===================================================== */

router.post("/", requireAuth, requireAdmin, uploadSingle, async (req, res) => {
  try {
    const { type, productId, name, price } = req.body;

    // flower / chocolate must reference product
    if (type === "flower" || type === "chocolate") {
      if (!productId) {
        return res.status(400).json({ msg: "productId required" });
      }

      const productExists = await Product.findById(productId);
      if (!productExists) {
        return res.status(400).json({ msg: "Invalid product" });
      }

      const item = await CustomBouquet.create({
        type,
        product: productId,
      });

      return res.status(201).json(item);
    }

    // base / ribbon are embedded
    if (!name || !price) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const item = await CustomBouquet.create({
      type,
      name,
      price,
      image: req.file?.path,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ msg: "Create failed" });
  }
});

/* =====================================================
   UPDATE
===================================================== */

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  uploadSingle,
  async (req, res) => {
    try {
      const { type, productId, name, price } = req.body;

      const item = await CustomBouquet.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ msg: "Not found" });
      }

      // flower/chocolate
      if (item.type === "flower" || item.type === "chocolate") {
        if (productId) {
          item.product = productId;
        }
      }

      // base/ribbon
      if (item.type === "base" || item.type === "ribbon") {
        if (name) item.name = name;
        if (price) item.price = price;
        if (req.file) item.image = req.file.path;
      }

      await item.save();

      res.json(item);
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ msg: "Update failed" });
    }
  },
);

/* =====================================================
   ENABLE / DISABLE
===================================================== */

router.patch("/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await CustomBouquet.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ msg: "Not found" });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    res.status(500).json({ msg: "Toggle failed" });
  }
});

/* =====================================================
   DELETE
===================================================== */

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await CustomBouquet.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ msg: "Not found" });
    }

    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

export default router;
