import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import CustomBouquet from "../models/CustomBouquet.js";
import mongoose from "mongoose";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadThree } from "../middleware/upload.js";

const router = express.Router();

/* -------------------------
   SLUG HELPER
------------------------- */

const makeSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ------------------------------------
        GET ALL PRODUCTS
        /product
        /product?categoryId=xxxx
------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = {};

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }

    const products = await Product.find(filter)
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to fetch products",
    });
  }
});

/* ------------------------------------
        GET FLOWER PRODUCTS
------------------------------------ */
router.get("/Flowers", async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: "flowers",
      isActive: true,
    });

    if (!category)
      return res.status(404).json({
        msg: "Flower category not found",
      });

    const products = await Product.find({
      categoryId: category._id,
      isActive: true,
    })
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("FLOWER FETCH ERROR:", err);
    res.status(500).json({
      msg: "Failed to fetch flowers",
    });
  }
});

/* ------------------------------------
        GET CHOCOLATE PRODUCTS
------------------------------------ */
router.get("/Chocolate", async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: "chocolate",
      isActive: true,
    });

    if (!category)
      return res.status(404).json({
        msg: "Chocolate category not found",
      });

    const products = await Product.find({
      categoryId: category._id,
      isActive: true,
    })
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("CHOCOLATE FETCH ERROR:", err);
    res.status(500).json({
      msg: "Failed to fetch chocolates",
    });
  }
});

/* ------------------------------------
        GET PRODUCT BY SLUG
------------------------------------ */
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("categoryId");

    if (!product)
      return res.status(404).json({
        msg: "Product not found",
      });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Fetch failed",
    });
  }
});

/* ------------------------------------
        GET SINGLE PRODUCT BY ID
------------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ msg: "Invalid product id" });

    const product = await Product.findById(req.params.id).populate(
      "categoryId",
    );

    if (!product)
      return res.status(404).json({
        msg: "Product not found",
      });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to fetch product",
    });
  }
});

/* ------------------------------------
        CREATE PRODUCT
------------------------------------ */
router.post(
  "/add",
  requireAuth,
  requireAdmin,
  uploadThree,
  async (req, res) => {
    try {
      const { name, price, description, categoryId } = req.body;

      if (!name || !price || !categoryId)
        return res.status(400).json({
          msg: "Missing fields",
        });

      if (!mongoose.Types.ObjectId.isValid(categoryId))
        return res.status(400).json({
          msg: "Invalid category id",
        });

      const baseSlug = makeSlug(name);

      let slug = baseSlug;
      let count = 1;

      while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${count++}`;
      }

      const images = req.files?.map((f) => f.path) || [];

      const product = await Product.create({
        name,
        slug,
        price,
        description,
        categoryId,
        images,
      });

      const populated = await product.populate("categoryId");

      res.status(201).json(populated);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: "Create product failed",
      });
    }
  },
);

/* ------------------------------------
        UPDATE PRODUCT
------------------------------------ */
router.put("/:id", requireAuth, requireAdmin, uploadThree, async (req, res) => {
  try {
    const { name, price, description, categoryId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({
        msg: "Invalid product id",
      });

    const update = {};

    if (name) {
      update.name = name;

      const baseSlug = makeSlug(name);

      let slug = baseSlug;
      let count = 1;

      while (
        await Product.findOne({
          slug,
          _id: { $ne: req.params.id },
        })
      ) {
        slug = `${baseSlug}-${count++}`;
      }

      update.slug = slug;
    }

    if (price) update.price = price;
    if (description) update.description = description;

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      update.categoryId = categoryId;
    }

    if (req.files?.length) {
      update.images = req.files.map((f) => f.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("categoryId");

    if (!product)
      return res.status(404).json({
        msg: "Product not found",
      });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Update failed",
    });
  }
});

/* ------------------------------------
        DELETE PRODUCT + CLEAN BOUQUET MAP
------------------------------------ */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({
        msg: "Invalid id",
      });

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({
        msg: "Product not found",
      });

    // 🔥 remove from bouquet config
    await CustomBouquet.deleteMany({
      product: req.params.id,
    });

    res.json({
      msg: "Product deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Delete failed",
    });
  }
});

export default router;
