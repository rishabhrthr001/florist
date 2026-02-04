import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      default: "General Inquiry",
    },

    message: {
      type: String,
      required: true,
    },

    source: {
      type: String, // hero / product / footer / contact-page
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("SupportMessage", supportSchema);

