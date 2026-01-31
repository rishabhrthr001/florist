import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    addresses: [
      {
        label: {
          type: String, // Home / Office / Friend etc
          required: true,
          trim: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        phone: {
          type: String,
          required: true,
          trim: true,
        },

        addressLine1: {
          type: String,
          required: true,
          trim: true,
        },

        addressLine2: {
          type: String,
          trim: true,
          default: "",
        },

        landmark: {
          type: String,
          required: true,
          trim: true,
        },

        city: {
          type: String,
          required: true,
          default: "Delhi",
        },

        state: {
          type: String,
          required: true,
          default: "Delhi",
        },

        postalCode: {
          type: String,
          required: true,
          match: [/^1100\d{2}$/, "Delivery only inside Delhi"],
        },

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    lastOrderAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
