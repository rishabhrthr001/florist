
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
});

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773225873718.jpg";
const productSlug = "pristine-elegance-white-rose-bouquet";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
        slug: String,
        images: [String]
    }));

    const product = await Product.findOne({ slug: productSlug });
    if (!product) {
        console.error("Product not found:", productSlug);
        process.exit(1);
    }

    if (product.images.length >= 3) {
        console.log("Product already has 3 images. Skipping.");
        process.exit(0);
    }

    console.log("Uploading additional image to Cloudinary...");
    const uploadRes = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "products",
    });
    
    product.images.push(uploadRes.secure_url);
    await product.save();
    
    console.log(`Image added to ${productSlug}. Total images: ${product.images.length}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
