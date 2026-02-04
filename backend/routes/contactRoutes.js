import express from "express";
import SupportMessage from "../models/SupportMessage.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ---------- SUBMIT CONTACT FORM (PUBLIC) ---------- */
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, subject, message, source } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ msg: "Name, email, phone, and message are required" });
        }

        const supportMessage = await SupportMessage.create({
            name,
            email,
            phone,
            subject: subject || "General Inquiry",
            message,
            source: source || "contact-page",
        });

        res.status(201).json({
            msg: "Message sent successfully",
            id: supportMessage._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to send message" });
    }
});

/* ---------- GET ALL MESSAGES (ADMIN) ---------- */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
    try {
        const messages = await SupportMessage.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email");

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to fetch messages" });
    }
});

/* ---------- MARK AS READ (ADMIN) ---------- */
router.put("/:id/read", requireAuth, requireAdmin, async (req, res) => {
    try {
        const message = await SupportMessage.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ msg: "Message not found" });
        }

        res.json(message);
    } catch (err) {
        res.status(500).json({ msg: "Failed to update message" });
    }
});

/* ---------- DELETE MESSAGE (ADMIN) ---------- */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const message = await SupportMessage.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({ msg: "Message not found" });
        }

        res.json({ msg: "Message deleted", id: req.params.id });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete message" });
    }
});

export default router;
