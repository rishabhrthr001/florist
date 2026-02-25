import express from "express";
import Order from "../models/Order.js";
import OrderCounter from "../models/orderCounter.js";
import Product from "../models/Product.js";
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

/* ---------------- CUSTOM PRICE CALC ---------------- */

const calcCustomPrice = (custom) => {
  const base = custom.base.price;
  const wrapper = custom.wrapper?.price || 0;
  const ribbon = custom.ribbon?.price || 0;

  const additionsTotal = custom.additions.reduce(
    (sum, a) => sum + a.item.price * a.qty,
    0,
  );

  return base + wrapper + ribbon + additionsTotal;
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
      deliveryCharge,
      paymentMethod,

      // ✅ DELIVERY PREFERENCES
      deliveryType,
      deliveryTime,

      // ✅ SPECIAL REQUEST
      specialRequest,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "No items in order" });
    }

    let verifiedItems = [];
    let serverSubtotal = 0;

    for (const item of items) {
      /* -------- CUSTOM BOUQUET -------- */
      if (item.isCustom) {
        if (!item.custom)
          return res.status(400).json({ msg: "Missing custom bouquet data" });

        const serverPrice = calcCustomPrice(item.custom);

        if (serverPrice !== item.price) {
          return res.status(400).json({
            msg: "Custom bouquet price mismatch",
          });
        }

        serverSubtotal += serverPrice * item.quantity;

        verifiedItems.push({
          ...item,
          price: serverPrice,
        });

        /* -------- NORMAL PRODUCT -------- */
      } else {
        const product = await Product.findById(item.productId);

        if (!product) return res.status(400).json({ msg: "Invalid product" });

        if (product.price !== item.price) {
          return res.status(400).json({
            msg: "Product price mismatch",
          });
        }

        serverSubtotal += product.price * item.quantity;

        verifiedItems.push(item);
      }
    }

    const serverTotal = serverSubtotal + deliveryCharge;

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      userId: req.user._id,

      customerName,
      phone,
      address,
      deliverySlot,
      deliveryType,
      deliveryDate,
      deliveryTime,

      isGift,
      gift,

      items: verifiedItems,

      subtotal: serverSubtotal,
      deliveryCharge,
      totalAmount: serverTotal,

      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",

      // ✅ SAVED
      specialRequest: specialRequest || null,
    });

    const io = getIO();

    io.to("admin").emit("new-order", order);
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
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

router.get(
  "/today/delivered-total",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const orders = await Order.find({
        orderStatus: "delivered",
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      res.json({
        date: start.toISOString().split("T")[0],
        totalValue,
        ordersCount: orders.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: "Failed to calculate today's delivered total",
      });
    }
  },
);

/* ---------------- ADMIN: ACTIVE ORDERS ---------------- */

router.get("/active", requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: {
        $nin: ["delivered", "cancelled"],
      },
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch active orders" });
  }
});

export default router;
