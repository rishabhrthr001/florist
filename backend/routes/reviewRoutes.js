import express from "express";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { slug, rating, comment } = req.body;

    if (!slug || !rating || !comment)
      return res.status(400).json({ msg: "Missing fields" });

    const product = await Product.findOne({ slug });

    if (!product) return res.status(404).json({ msg: "Product not found" });

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      rating,
      comment,
    });

    const populated = await review.populate([
      { path: "user", select: "name" },
      { path: "product", select: "name slug" },
    ]);

    req.io.emit("new-review", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create review" });
  }
});

router.get("/product/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) return res.status(404).json({ msg: "Product not found" });

    const reviews = await Review.find({
      product: product._id,
    })
      .populate("user", "name")
      .populate("replies.user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch reviews" });
  }
});

/* ---------------- REPLY TO REVIEW ---------------- */
router.post("/:id/reply", requireAuth, async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) return res.status(400).json({ msg: "Comment required" });

    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ msg: "Review not found" });

    review.replies.push({
      user: req.user._id,
      comment,
    });

    await review.save();

    const populated = await review.populate([
      { path: "replies.user", select: "name" },
      { path: "product", select: "name slug" },
    ]);

    req.io.emit("review-replied", populated);

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Reply failed" });
  }
});

/* ---------------- ADMIN DELETE REVIEW ---------------- */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    res.json({ msg: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name slug")
      .populate("replies.user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch reviews" });
  }
});

export default router;
