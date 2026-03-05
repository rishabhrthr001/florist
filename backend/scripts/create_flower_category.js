
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/65d7d9ff-6ab1-477e-a469-c48f35ca010b/luxury_flower_category_1772710080074.png";

async function createFlowerCategory() {
  try {
    console.log("Uploading image to Cloudinary...");
    const uploadRes = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "categories",
    });
    console.log("Upload successful:", uploadRes.secure_url);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    const categorySchema = new mongoose.Schema({
        name: String,
        slug: String,
        image: String,
        section: String
    });
    const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

    // Create or Update the Flowers Category
    // I'll place it in 'shop-by-category' section
    const result = await Category.findOneAndUpdate(
      { slug: "flowers" },
      { 
        name: "Flowers", 
        image: uploadRes.secure_url,
        section: "shop-by-category" 
      },
      { new: true, upsert: true }
    );

    console.log("Category 'Flowers' created/updated:", result.name);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

createFlowerCategory();
