
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/8414bf7c-829d-4959-994c-0ca49f7ea034/media__1774895630663.jpg";

async function pushToCloudinary() {
  try {
    console.log("Uploading rose image to Cloudinary...");
    const uploadRes = await cloudinary.uploader.upload(imagePath, {
      folder: "categories",
      public_id: "flowers_category_rose",
      overwrite: true,
    });
    
    console.log("Upload successful:", uploadRes.secure_url);

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const categorySchema = new mongoose.Schema({
        name: String,
        slug: String,
        image: String,
        section: String
    });
    const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

    // Update or create the "Flowers" category
    const result = await Category.findOneAndUpdate(
      { slug: "flowers" },
      { 
        name: "Flowers", 
        image: uploadRes.secure_url,
        section: "main" // Assuming 'main' or similar based on other scripts
      },
      { new: true, upsert: true }
    );

    console.log("Category 'Flowers' updated/created in DB:", result.name);
    process.exit(0);
  } catch (err) {
    console.error("Error pushing to Cloudinary/DB:", err);
    process.exit(1);
  }
}

pushToCloudinary();
