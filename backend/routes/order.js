import express from "express";
import Order from "../models/Order.js";
import OrderCounter from "../models/orderCounter.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { getIO } from "../socket/index.js";

const router = express.Router();

/* ---------------- HELPERS ---------------- */

const getDateKey = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}${dd}${yy}`;
};

const generateOrderId = async () => {
  const dateKey = getDateKey();

  const counter = await OrderCounter.findOneAndUpdate(
    { date: dateKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `FLR-${dateKey}-${String(counter.seq).padStart(4, "0")}`;
};

/* ---------------- CREATE ORDER ---------------- */
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      deliverySlot,
      deliveryDate,
      isGift,
      gift,
      items,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      notes,
    } = req.body;

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      userId: req.user._id,
      customerName,
      phone,
      address,
      deliverySlot,
      deliveryDate,
      isGift,
      gift,
      items,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",
      notes,
    });

    const io = getIO();

    // 🔥 realtime → admins
    io.to("admin").emit("new-order", order);

    // 🔥 realtime → that user
    io.to(`user:${req.user._id.toString()}`).emit("new-order", order);

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create order" });
  }
});

/* ---------------- USER: MY ORDERS ---------------- */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
});

/* ---------------- ADMIN: ALL ORDERS ---------------- */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
});

/* ---------------- ADMIN: UPDATE STATUS ---------------- */
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    const io = getIO();

    // 🔥 realtime → admins
    io.to("admin").emit("order-updated", order);

    // 🔥 realtime → that user
    io.to(`user:${order.userId.toString()}`).emit("order-updated", order);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});

export default router;
