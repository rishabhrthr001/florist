
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
});

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773235618657.jpg";
const targetSlug = "scarlet-ivory-lily-harmony-bouquet";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const productSchema = new mongoose.Schema({
      name: String,
      slug: String,
      images: [String]
    });
    const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

    // 1. Find the product
    const product = await Product.findOne({ slug: targetSlug });
    if (!product) {
        console.error("Product not found:", targetSlug);
        process.exit(1);
    }
    console.log("Found Product:", product.name);

    // 2. Upload to Cloudinary
    console.log("Uploading duplicate image to Cloudinary...");
    const uploadRes = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "products",
    });
    console.log("Uploaded:", uploadRes.secure_url);

    // 3. Update image array
    if (product.images.length < 3) {
        product.images.push(uploadRes.secure_url);
        await product.save();
        console.log("Added as image #" + product.images.length);
    } else {
        console.log("Product already has 3 or more images. Skipping.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
