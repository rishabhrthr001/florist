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

    deliverySlot: {
      type: String,
      enum: ["day", "night"],
      required: true,
    },

    deliveryDate: Date,

    isGift: Boolean,

    gift: {
      name: String,
      phone: String,
      address: String,
    },

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
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        image: String,

        custom: {
          flowers: [
            {
              flowerId: String,
              name: String,
              quantity: Number,
              price: Number,
            },
          ],

          wrapper: String,
          ribbon: String,
          message: String,
        },
      },
    ],

    subtotal: Number,
    deliveryCharge: Number,
    totalAmount: Number,

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
