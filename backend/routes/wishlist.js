import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* ============================
   GET WISHLIST
============================ */

router.get("/", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("wishlist");
        res.json(user.wishlist || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to fetch wishlist" });
    }
});

/* ============================
   ADD TO WISHLIST
============================ */

router.post("/", requireAuth, async (req, res) => {
    try {
        const { productId, name, price, image, slug } = req.body;

        if (!productId || !name || !price || !image || !slug) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        const user = await User.findById(req.user._id);

        // Check if already in wishlist
        const exists = user.wishlist.find(
            (item) => item.productId.toString() === productId
        );

        if (exists) {
            return res.status(400).json({ msg: "Already in wishlist" });
        }

        // Add to wishlist
        user.wishlist.push({
            productId,
            name,
            price,
            image,
            slug,
        });

        await user.save();

        res.json(user.wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to add to wishlist" });
    }
});

/* ============================
   REMOVE FROM WISHLIST
============================ */

router.delete("/:productId", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(
            (item) => item.productId.toString() !== req.params.productId
        );

        await user.save();

        res.json(user.wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to remove from wishlist" });
    }
});

/* ============================
   CLEAR WISHLIST
============================ */

router.delete("/", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = [];
        await user.save();

        res.json({ msg: "Wishlist cleared" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to clear wishlist" });
    }
});

/* ============================
   SYNC WISHLIST (MERGE)
============================ */

router.post("/sync", requireAuth, async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ msg: "Items must be an array" });
        }

        const user = await User.findById(req.user._id);

        // Merge: add items from localStorage that aren't already in backend
        for (const item of items) {
            const exists = user.wishlist.find(
                (w) => w.productId.toString() === item._id
            );

            if (!exists && item._id && item.name && item.price && item.image && item.slug) {
                user.wishlist.push({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    slug: item.slug,
                });
            }
        }

        await user.save();

        res.json(user.wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to sync wishlist" });
    }
});

export default router;
