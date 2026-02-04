import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ["user", "support"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["order", "product", "payment", "delivery", "other"],
            default: "other",
        },
        status: {
            type: String,
            enum: ["open", "in-progress", "resolved", "closed"],
            default: "open",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        messages: [messageSchema],
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
    },
    { timestamps: true }
);

// Index for faster queries
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

export default mongoose.model("Ticket", ticketSchema);
