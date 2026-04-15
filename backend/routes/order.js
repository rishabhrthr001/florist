import express from "express";
import Order from "../models/Order.js";
import OrderCounter from "../models/orderCounter.js";
import Product from "../models/Product.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
// getIO removed
import { sendOrderNotificationToAdmin, sendOrderConfirmationToCustomer } from "../utils/emailService.js";

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
  if (!custom || !custom.base) return 0;
  
  const base = custom.base.price || 0;
  const paper = custom.paper?.price || custom.wrapper?.price || 0;
  const ribbon = custom.ribbon?.price || 0;

  const additionsTotal = (custom.additions || []).reduce(
    (sum, a) => sum + (a.item?.price || 0) * (a.qty || 0),
    0,
  );

  const vase = custom.vase?.price || 0;
  
  return base + paper + ribbon + additionsTotal + vase;
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
            msg: `Custom bouquet price mismatch. Server calc: ${serverPrice}, Got: ${item.price}`,
          });
        }

        serverSubtotal += serverPrice * item.quantity;

        // Create a clean item object for the DB
        const dbItem = { ...item };
        // Remove the temporary frontend 'custom-XXX' ID to avoid Mongoose CastErrors
        if (typeof dbItem._id === 'string' && dbItem._id.startsWith('custom-')) {
          delete dbItem._id;
        }

        verifiedItems.push({
          ...dbItem,
          price: serverPrice,
        });

        /* -------- NORMAL PRODUCT -------- */
      } else {
        const product = await Product.findById(item.productId);

        if (!product) return res.status(400).json({ msg: "Invalid product" });

        // Calculate expected price based on premium wrapping
        // If product has premiumWrapping: true -> price is same
        // If product has premiumWrapping: false AND item.hasPremiumWrapping: true -> price + 300
        let expectedPrice = product.price;
        if (!product.premiumWrapping && item.hasPremiumWrapping) {
          expectedPrice += 300;
        }

        if (item.vase && item.vase.price) {
          expectedPrice += item.vase.price;
        }

        if (expectedPrice !== item.price) {
          return res.status(400).json({
            msg: `Product price mismatch for ${product.name}. Expected ${expectedPrice}, got ${item.price}`,
          });
        }

        serverSubtotal += expectedPrice * item.quantity;

        verifiedItems.push({
          ...item,
          slug: product.slug
        });
      }
    }

    const serverTotal = serverSubtotal;

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      userId: req.user._id,

      customerName,
      phone,
      address,
      deliverySlot: (deliveryType === 'scheduled' && deliveryTime) ? deliveryTime : (deliverySlot || "day"),
      deliveryType,
      deliveryDate,
      deliveryTime: (deliveryType === 'scheduled' && deliveryTime) ? deliveryTime : "ASAP",

      isGift,
      gift,

      items: verifiedItems,

      subtotal: serverSubtotal,
      deliveryCharge: 0,
      totalAmount: serverTotal,

      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",

      // ✅ SAVED
      specialRequest: specialRequest || null,
    });



    // Send Emails (Background)
    sendOrderNotificationToAdmin(order).catch(err => {
      console.error("Failed to send admin order email:", err);
    });

    sendOrderConfirmationToCustomer(order, req.user.email).catch(err => {
      console.error("Failed to send customer order confirmation:", err);
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create order" });
  }
});

/* ---------------- USER: MY ORDERS ---------------- */

router.get("/my", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
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
      .populate("items.productId", "name slug description")
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
      .populate("items.productId", "name slug description")
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
