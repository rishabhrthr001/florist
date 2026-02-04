import express from "express";
import Ticket from "../models/Ticket.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create a new ticket
router.post("/", requireAuth, async (req, res) => {
    try {
        const { subject, category, message, orderId } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ msg: "Subject and message are required" });
        }

        const ticket = await Ticket.create({
            user: req.user._id,
            subject,
            category: category || "other",
            orderId: orderId || null,
            messages: [
                {
                    sender: "user",
                    content: message,
                },
            ],
        });

        res.status(201).json(ticket);
    } catch (err) {
        console.error("Create ticket error:", err);
        res.status(500).json({ msg: "Failed to create ticket" });
    }
});

// Get all tickets for the logged-in user
router.get("/my-tickets", requireAuth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select("-messages"); // Exclude messages for list view

        res.json(tickets);
    } catch (err) {
        console.error("Get tickets error:", err);
        res.status(500).json({ msg: "Failed to fetch tickets" });
    }
});

// Get a single ticket with messages
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("orderId", "orderNumber totalAmount status");

        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }

        res.json(ticket);
    } catch (err) {
        console.error("Get ticket error:", err);
        res.status(500).json({ msg: "Failed to fetch ticket" });
    }
});

// Add a message to a ticket
router.post("/:id/message", requireAuth, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ msg: "Message content is required" });
        }

        const ticket = await Ticket.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }

        if (ticket.status === "closed") {
            return res.status(400).json({ msg: "Cannot add message to closed ticket" });
        }

        ticket.messages.push({
            sender: "user",
            content,
        });

        // Reopen if it was resolved
        if (ticket.status === "resolved") {
            ticket.status = "open";
        }

        await ticket.save();

        res.json(ticket);
    } catch (err) {
        console.error("Add message error:", err);
        res.status(500).json({ msg: "Failed to add message" });
    }
});

// Close a ticket (user can close their own tickets)
router.patch("/:id/close", requireAuth, async (req, res) => {
    try {
        const ticket = await Ticket.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: "closed" },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }

        res.json(ticket);
    } catch (err) {
        console.error("Close ticket error:", err);
        res.status(500).json({ msg: "Failed to close ticket" });
    }
});

// ========== ADMIN ROUTES ==========

// Get all tickets (admin only)
router.get("/admin/all", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const tickets = await Ticket.find(query)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Ticket.countDocuments(query);

        res.json({
            tickets,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (err) {
        console.error("Admin get tickets error:", err);
        res.status(500).json({ msg: "Failed to fetch tickets" });
    }
});

// Admin reply to ticket
router.post("/admin/:id/reply", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        const { content, status } = req.body;

        if (!content) {
            return res.status(400).json({ msg: "Message content is required" });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }

        ticket.messages.push({
            sender: "support",
            content,
        });

        if (status) {
            ticket.status = status;
        } else if (ticket.status === "open") {
            ticket.status = "in-progress";
        }

        await ticket.save();

        res.json(ticket);
    } catch (err) {
        console.error("Admin reply error:", err);
        res.status(500).json({ msg: "Failed to send reply" });
    }
});

// Update ticket status (admin only)
router.patch("/admin/:id/status", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        const { status, priority } = req.body;

        const updateFields = {};
        if (status) updateFields.status = status;
        if (priority) updateFields.priority = priority;

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).populate("user", "name email");

        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }

        res.json(ticket);
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ msg: "Failed to update ticket" });
    }
});

export default router;
