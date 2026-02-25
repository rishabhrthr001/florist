import express from "express";
import Category from "../models/Category.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";
import mongoose from "mongoose";
import slugify from "slugify";

const router = express.Router();

/* ---------- GET ALL CATEGORIES ---------- */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch categories" });
  }
});

/* ---------- GET SINGLE CATEGORY ---------- */
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ msg: "Category not found" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch category" });
  }
});
/* ---------- CREATE CATEGORY ---------- */
router.post(
  "/add",
  requireAuth,
  requireAdmin,
  uploadSingle,
  async (req, res) => {
    try {
      const { name, section } = req.body;

      if (!name) return res.status(400).json({ msg: "Category name required" });

      // generate base slug
      let slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      // ensure slug is unique
      const slugExists = await Category.findOne({
        slug,
      });

      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }

      const exists = await Category.findOne({
        name,
      });

      if (exists)
        return res.status(400).json({
          msg: "Category already exists",
        });

      const category = await Category.create({
        name,
        slug,
        image: req.file?.path,
        section: section || 'general',
      });

      res.status(201).json(category);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        msg: "Create category failed",
        err,
      });
    }
  },
);

/* ---------- UPDATE CATEGORY ---------- */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  uploadSingle,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, section } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "Invalid category ID" });
      }

      const category = await Category.findById(id);

      if (!category) return res.status(404).json({ msg: "Category not found" });

      /* Update name + slug */
      if (name && name !== category.name) {
        let slug = slugify(name, {
          lower: true,
          strict: true,
          trim: true,
        });

        const slugExists = await Category.findOne({
          slug,
          _id: { $ne: id },
        });

        if (slugExists) {
          slug = `${slug}-${Date.now()}`;
        }

        category.name = name;
        category.slug = slug;
      }

      /* Update section */
      if (section) {
        category.section = section;
      }

      /* Update image if new uploaded */
      if (req.file?.path) {
        category.image = req.file.path;
      }

      await category.save();

      res.json(category);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        msg: "Update category failed",
        err,
      });
    }
  },
);

/* ---------- DELETE CATEGORY ---------- */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid category ID" });
    }

    const category = await Category.findById(id);

    if (!category) return res.status(404).json({ msg: "Category not found" });

    // Import Product model
    const Product = (await import("../models/Product.js")).default;

    // Count products in this category
    const productCount = await Product.countDocuments({ categoryId: id });

    if (productCount > 0) {
      // Find or create "Uncategorized" category
      let uncategorized = await Category.findOne({ slug: "uncategorized" });

      if (!uncategorized) {
        uncategorized = await Category.create({
          name: "Uncategorized",
          slug: "uncategorized",
          image:
            "https://res.cloudinary.com/demo/image/upload/v1/samples/placeholder.jpg",
          description: "Products without a category",
          isActive: true,
        });
      }

      // Move all products to Uncategorized
      await Product.updateMany(
        { categoryId: id },
        { $set: { categoryId: uncategorized._id } }
      );
    }

    // Now delete the category
    await Category.findByIdAndDelete(id);

    res.json({
      msg: "Category deleted successfully",
      id,
      productsMovedToUncategorized: productCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Delete category failed",
      err,
    });
  }
});

export default router;
