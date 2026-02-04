import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already used" });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Signup failed" });
  }
});

router.post("/make-admin", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ msg: "Email, password and name required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ msg: "Wrong password" });

    user.role = "admin";
    user.name = name;

    await user.save();

    res.json({
      msg: "User promoted to admin",
      email,
      name,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to make admin" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      addresses: user.addresses || [],
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      createdAt: user.createdAt,
    };

    res.json({
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Login failed" });
  }
});

/* ---------- GOOGLE OAUTH ---------- */
router.post("/google", async (req, res) => {
  console.log("➡️ Google Auth Route Hit");
  try {
    const { token } = req.body;
    console.log("Token received:", !!token);

    if (!token) {
      return res.status(400).json({ msg: "Firebase token required" });
    }

    // Verify Token using Google's Public Endpoint
    // This avoids needing a service account key on the backend
    const googleVerifyURL = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    console.log("Verifying with:", googleVerifyURL.substring(0, 50) + "...");

    let payload;
    try {
      const verifyRes = await fetch(googleVerifyURL);
      payload = await verifyRes.json();
      console.log("Verification payload:", payload ? "Got payload" : "No payload");
    } catch (fetchErr) {
      console.error("Fetch error (Node version issue?):", fetchErr);
      return res.status(500).json({ msg: "Server fetch error" });
    }

    if (payload.error) {
      console.error("Token verification error:", payload.error);
      return res.status(401).json({ msg: "Invalid Google token: " + payload.error_description });
    }

    // Verify audience to ensure token is for YOUR app
    console.log("Audience:", payload.aud);
    /* 
    if (payload.aud !== "mangalam-71d5c") {
      console.error("Audience mismatch:", payload.aud);
      return res.status(401).json({ msg: "Invalid Google token audience" });
    } 
    */

    const { sub: uid, email, name, picture } = payload;
    console.log("User info:", { email, uid, name });

    if (!email) {
      return res.status(400).json({ msg: "Invalid Google token payload" });
    }

    // Find existing user by Google ID (using uid) or email
    let user = await User.findOne({
      $or: [{ googleId: uid }, { email }],
    });
    console.log("Found user:", !!user);

    if (user) {
      let changed = false;
      // Update Google ID if user exists but signed up with email/password
      if (!user.googleId) {
        user.googleId = uid;
        changed = true;
      }
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
        changed = true;
      }
      // Update name if valid name provided and current is "User" or empty
      if (name && (user.name === "User" || !user.name)) {
        user.name = name;
        changed = true;
      }

      if (changed) await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: name || "User",
        email,
        googleId: uid,
        profilePicture: picture,
      });
    }

    const appToken = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      addresses: user.addresses || [],
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    res.json({
      token: appToken,
      user: safeUser,
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ msg: "Google authentication failed" });
  }
});

export default router;
