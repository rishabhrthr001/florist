import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Human readable order number
    orderId: {
      type: String,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    deliveryType: {
      type: String,
      enum: ["standard", "scheduled"],
      default: "standard",
    },

    deliverySlot: {
       type: String,
       default: "day"
    },

    deliveryDate: {
      type: String, // Storing as YYYY-MM-DD
      default: null
    },

    deliveryTime: {
      type: String, // String like 14:30 or "ASAP"
      default: "ASAP"
    },

    isGift: Boolean,

    gift: {
      name: String,
      phone: String,
      address: String,
      includeGiftCard: {
        type: Boolean,
        default: false,
      },
      giftMessage: String,
    },

    /* ---------------- ITEMS ---------------- */

    items: [
      {
        productId: {
          type: String,
          ref: "Product",
          default: null,
        },

        isCustom: {
          type: Boolean,
          default: false,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number, // snapshot final price
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        image: String,
        hasPremiumWrapping: {
          type: Boolean,
          default: false,
        },

        vase: {
          id: String,
          name: String,
          price: Number,
          image: String
        },

        /* -------- CUSTOM BOUQUET SNAPSHOT -------- */

        custom: {
          base: {
            id: String,
            name: String,
            price: Number,
          },

          ribbon: {
            id: String,
            name: String,
            price: Number,
          },

          paper: {
            id: String,
            name: String,
            price: Number,
          },

          message: String,

          vase: {
            id: String,
            name: String,
            price: Number,
          },

          additions: [
            {
              item: {
                id: String,
                name: String,
                price: Number,
              },
              qty: Number,
            },
          ],
        },
      },
    ],

    specialRequest: {
      type: String,
      default: null,
    },

    /* ---------------- TOTALS ---------------- */

    subtotal: Number,
    deliveryCharge: Number,
    totalAmount: Number,

    /* ---------------- PAYMENT ---------------- */

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    /* ---------------- ORDER STATUS ---------------- */

    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "delivered", "cancelled"],
      default: "placed",
    },

    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
