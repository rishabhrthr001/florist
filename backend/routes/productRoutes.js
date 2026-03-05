import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import CustomBouquet from "../models/CustomBouquet.js";
import mongoose from "mongoose";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadFields } from "../middleware/upload.js";
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
  uploadFields,
  async (req, res) => {
    try {
      const { name, price, description, categoryId, premiumWrapping } = req.body;
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

      const images = [];
      if (req.files['image0']) images.push(req.files['image0'][0].path);
      if (req.files['image1']) images.push(req.files['image1'][0].path);
      if (req.files['image2']) images.push(req.files['image2'][0].path);

      const product = await Product.create({
        name,
        slug,
        price,
        description,
        categoryId,
        tags,
        images,
        premiumWrapping: premiumWrapping === "true" || premiumWrapping === true,
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
router.put("/:id", requireAuth, requireAdmin, uploadFields, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, categoryId, premiumWrapping } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Update name and handle slug if name changed
    if (name && name !== product.name) {
      product.name = name;
      const baseSlug = makeSlug(name);
      let slug = baseSlug;
      let count = 1;

      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${count++}`;
      }
      product.slug = slug;
    }

    // Update basic fields if they are in the body
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description;

    // Handle tags
    if (req.body.tags !== undefined) {
      try {
        product.tags = Array.isArray(req.body.tags) 
          ? req.body.tags 
          : JSON.parse(req.body.tags);
      } catch (e) {
        console.error("TAG PARSE ERROR:", e);
      }
    }

    // Handle Category
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      product.categoryId = categoryId;
    }

    // Handle Premium Wrapping
    if (premiumWrapping !== undefined) {
      product.premiumWrapping = premiumWrapping === "true" || premiumWrapping === true;
    }

    // Handle Images Positionally
    let finalImages = [];
    try {
      // Frontend should send existingImages as a JSON array of 3 slots: [url, null, url]
      finalImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [...product.images];
    } catch (e) {
      finalImages = [...product.images];
    }

    // Ensure we have 3 slots to work with
    while (finalImages.length < 3) finalImages.push(null);

    if (req.files['image0']) finalImages[0] = req.files['image0'][0].path;
    if (req.files['image1']) finalImages[1] = req.files['image1'][0].path;
    if (req.files['image2']) finalImages[2] = req.files['image2'][0].path;

    product.images = finalImages.filter(img => img && typeof img === 'string');

    await product.save();
    
    const populated = await product.populate("categoryId");
    res.json(populated);
  } catch (err) {
    console.error("PRODUCT UPDATE ERROR:", err);
    res.status(500).json({ 
      msg: err.message || "Update failed",
      error: err.name
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
