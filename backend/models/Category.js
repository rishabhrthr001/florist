import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String, // Cloudinary URL
      required: true,
    },
    section: {
      type: String, // 'shop-by-category', 'celebrate-love', 'cherished-celebrations', etc.
      default: 'general',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
