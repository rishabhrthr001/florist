import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* -------------------------
   GET PROFILE
------------------------- */

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch profile" });
  }
});

/* -------------------------
   UPDATE BASIC PROFILE
------------------------- */

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { phone, name } = req.body;

    const update = {};
    if (phone) update.phone = phone;
    if (name) update.name = name;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
});

/* ============================
      ADDRESS ROUTES
============================ */

/* ============================
      ADDRESS ROUTES
============================ */

const DELHI_PIN_REGEX = /^1100\d{2}$/;

const validateAddressPayload = (addr) => {
  const required = [
    addr.label,
    addr.name,
    addr.phone,
    addr.addressLine1,
    addr.landmark,
    addr.city,
    addr.state,
    addr.postalCode,
  ];

  if (required.some((v) => !v || !v.trim())) {
    return "All address fields are required";
  }

  if (!DELHI_PIN_REGEX.test(addr.postalCode)) {
    return "We currently deliver only inside Delhi";
  }

  return null;
};

/* -------------------------
   ADD ADDRESS
------------------------- */

router.post("/addresses", requireAuth, async (req, res) => {
  try {
    const error = validateAddressPayload(req.body);
    if (error) return res.status(400).json({ msg: error });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const newAddress = req.body;

    // first address auto-default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // if marked default → unset others
    if (newAddress.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push(newAddress);

    await user.save();

    const updated = await User.findById(user._id).select("-password");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to add address" });
  }
});

/* -------------------------
   UPDATE ADDRESS
------------------------- */

router.patch("/addresses/:id", requireAuth, async (req, res) => {
  try {
    const error = validateAddressPayload(req.body);
    if (error) return res.status(400).json({ msg: error });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ msg: "Address not found" });

    Object.assign(addr, req.body);

    if (req.body.isDefault) {
      user.addresses.forEach((a) => {
        if (a._id.toString() !== addr._id.toString()) {
          a.isDefault = false;
        }
      });
    }

    await user.save();

    const updated = await User.findById(user._id).select("-password");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update address" });
  }
});

/* -------------------------
   DELETE ADDRESS
------------------------- */

router.delete("/addresses/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const wasDefault = user.addresses.find(
      (a) => a._id.toString() === req.params.id && a.isDefault,
    );

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.id,
    );

    // if default removed → set first as default
    if (wasDefault && user.addresses.length) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    const updated = await User.findById(user._id).select("-password");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to delete address" });
  }
});

/* -------------------------
   SET DEFAULT ADDRESS
------------------------- */

router.patch("/addresses/:id/default", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    let found = false;

    user.addresses.forEach((a) => {
      if (a._id.toString() === req.params.id) {
        a.isDefault = true;
        found = true;
      } else {
        a.isDefault = false;
      }
    });

    if (!found) return res.status(404).json({ msg: "Address not found" });

    await user.save();

    const updated = await User.findById(user._id).select("-password");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to set default address" });
  }
});

export default router;
