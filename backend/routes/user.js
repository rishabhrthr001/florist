import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* -------------------------
   UPDATE PROFILE INFO
   PATCH /user/me
------------------------- */

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { phone, address } = req.body;

    const update = {};

    if (phone) update.phone = phone;
    if (address) update.address = address;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to update profile",
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to fetch profile",
    });
  }
});

export default router;
