
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

async function deleteRoseImage() {
  try {
    const publicId = "categories/flowers_category_rose";
    console.log(`Deleting image ${publicId} from Cloudinary...`);
    
    const deleteRes = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary response:", deleteRes);

    if (deleteRes.result === "ok") {
        console.log("Delete successful.");
    } else {
        console.log("Deletion failed or image not found.");
    }

    console.log("Connecting to MongoDB to reset category image...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const categorySchema = new mongoose.Schema({
        name: String,
        slug: String,
        image: String,
        section: String
    });
    const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

    // Reset the image for "Flowers" category (setting it to null or an empty string)
    const result = await Category.findOneAndUpdate(
      { slug: "flowers" },
      { $unset: { image: "" } }, // Remove the image field
      { new: true }
    );

    console.log("Category 'Flowers' reset in DB:", result ? result.name : "Category not found");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting image/DB refresh:", err);
    process.exit(1);
  }
}

deleteRoseImage();
