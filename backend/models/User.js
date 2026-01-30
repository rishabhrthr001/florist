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
          type: String, // Home, Office etc
        },

        name: {
          type: String,
        },

        phone: {
          type: String,
        },

        street: {
          type: String,
        },

        city: {
          type: String,
        },

        state: {
          type: String,
        },

        postalCode: {
          type: String,
        },

        country: {
          type: String,
          default: "India",
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
