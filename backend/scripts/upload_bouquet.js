
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/65d7d9ff-6ab1-477e-a469-c48f35ca010b/luxury_floral_bouquet_1772708398030.png";

async function uploadAndSync() {
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

    // Update the Category
    const result = await Category.findOneAndUpdate(
      { slug: "bouquets" },
      { image: uploadRes.secure_url },
      { new: true, upsert: true }
    );

    console.log("Category updated:", result.name);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

uploadAndSync();
