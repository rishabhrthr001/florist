import mongoose from "mongoose";

const homeSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "hot-picks",
        "seasonal",
        "for-him",
        "for-her",
        "anniversary",
        "atelier",
      ],
    },

    title: String,

    items: [
      {
        position: {
          type: Number,
          required: true,
        },

        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("HomeSection", homeSectionSchema);
