import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import CustomBouquet from "../models/CustomBouquet.js";
import mongoose from "mongoose";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadThree } from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

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

const extractPublicId = (url) => {
  try {
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;
    let path = splitUrl[1].replace(/^v\d+\//, "");
    const lastDotIndex = path.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    return path;
  } catch (err) {
    return null;
  }
};

/* ------------------------------------
        GET UNIQUE TAGS
------------------------------------ */
router.get("/tags", async (req, res) => {
  try {
    const tags = await Product.distinct("tags");
    res.json(tags.filter(Boolean));
  } catch (err) {
    console.error("TAGS FETCH ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch tags" });
  }
});

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
      const category = await Category.findById(categoryId);
      if (category) {
        // Find if the categoryId matches, OR if the category slug matches a tag
        filter.$or = [
          { categoryId },
          { tags: { $regex: new RegExp(`^${category.slug}$`, "i") } } // Case-insensitive exact match
        ];
      } else {
        filter.categoryId = categoryId;
      }
    }

    // Support direct tag querying too just in case
    const { tag } = req.query;
    if (tag) {
      filter.tags = { $regex: new RegExp(tag, "i") };
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
      let tags = [];
      if (req.body.tags) {
        tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags);
      }

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
        tags,
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
    let tags = undefined;
    if (req.body.tags !== undefined) {
      try {
        tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags);
      } catch(e) { /* silent fail on parse */ }
    }

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
    if (tags !== undefined) update.tags = tags;

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

    // 🔥 delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        const publicId = extractPublicId(imgUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudErr) {
            console.error("Cloudinary delete error:", cloudErr);
          }
        }
      }
    }

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
