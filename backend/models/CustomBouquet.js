import mongoose from "mongoose";

const customBouquetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["base", "flower", "chocolate", "ribbon", "filler", "paper", "vase"],
      required: true,
    },

    // ONLY for flower & chocolate
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    // ONLY for base & ribbon
    name: String,
    price: Number,
    image: String,

    isActive: {
      type: Boolean,
      default: true,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CustomBouquet", customBouquetSchema);
