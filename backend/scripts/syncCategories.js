import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Category Model (Redefine here for the script)
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    section: { type: String, default: 'general' },
    featured: { type: Boolean, default: false },
    description: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const CATEGORIES_DATA = [
  // Shop Categories
  { name: "Birthdays", slug: "birthday", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80", section: "shop-by-category" },
  { name: "Anniversary", slug: "anniversary", localImage: "../../frontend/public/categories-new/anniversary.png", section: "shop-by-category" },
  { name: "Chocolates", slug: "chocolates", localImage: "../../frontend/public/categories-new/chocolates.png", section: "shop-by-category" },
  { name: "Cakes", slug: "cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", section: "shop-by-category" },
  { name: "Balloon Decor", slug: "decorations", localImage: "../../frontend/public/categories-new/balloons.png", section: "shop-by-category" },
  { name: "Plants", slug: "plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80", section: "shop-by-category" },
  { name: "Big Bunches", slug: "big-bunches", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&q=80", section: "shop-by-category" },

  // Celebrate Love
  { name: "Wedding", slug: "wedding", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", section: "celebrate-love" },
  { name: "Anniversary (Love)", slug: "anniversary-love", localImage: "../../frontend/public/categories-new/anniversary.png", section: "celebrate-love" },
  { name: "Thinking Of You", slug: "thinking-of-you", localImage: "../../frontend/public/categories-new/thinking.png", section: "celebrate-love" },
  { name: "I Am Sorry", slug: "sorry", localImage: "../../frontend/public/categories-new/sorry.png", section: "celebrate-love" },
  { name: "Romantic Flowers", slug: "flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80", section: "celebrate-love" },
  { name: "For Girlfriend", slug: "girlfriend", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80", section: "celebrate-love" },
  { name: "For Boyfriend", slug: "boyfriend", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80", section: "celebrate-love" },
  { name: "Miss You", slug: "miss-you", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80", section: "celebrate-love" },

  // Cherished Celebrations
  { name: "Baby Shower", slug: "baby-shower", localImage: "../../frontend/public/banners/icon_baby_shower.png", section: "cherished-celebrations" },
  { name: "Retirement", slug: "retirement", localImage: "../../frontend/public/banners/icon_retirement.png", section: "cherished-celebrations" },
  { name: "New Born", slug: "new-born", localImage: "../../frontend/public/categories-new/newborn.png", section: "cherished-celebrations" },
  { name: "Wellness & Care", slug: "wellness", localImage: "../../frontend/public/categories-new/wellness.png", section: "cherished-celebrations" },
  { name: "Thank You", slug: "thank-you", localImage: "../../frontend/public/categories-new/thankyou.png", section: "cherished-celebrations" },
  { name: "Best Wishes", slug: "best-wishes", localImage: "../../frontend/public/categories-new/bestwishes.png", section: "cherished-celebrations" },
  { name: "Balloons (Celebration)", slug: "balloons-celebration", localImage: "../../frontend/public/categories-new/balloons.png", section: "cherished-celebrations" },
  { name: "Housewarming", slug: "housewarming", localImage: "../../frontend/public/categories-new/housewarming.png", section: "cherished-celebrations" },

  // Favourite Flowers
  { name: "Classic Roses", slug: "roses", localImage: "../../frontend/public/bouquets/bouquet_roses_1771938143113.png", section: "favourite-flowers" },
  { name: "White Lilies", slug: "lilies", localImage: "../../frontend/public/bouquets/bouquet_lilies_1771939456508.png", section: "favourite-flowers" },
  { name: "Bright Sunflowers", slug: "sunflowers", localImage: "../../frontend/public/bouquets/bouquet_sunflowers_1771938400635.png", section: "favourite-flowers" },
  { name: "Purple Orchids", slug: "orchids", localImage: "../../frontend/public/bouquets/bouquet_orchids_1771938645237.png", section: "favourite-flowers" },
  { name: "Soft Carnations", slug: "carnations", localImage: "../../frontend/public/bouquets/bouquet_carnations_1771938818246.png", section: "favourite-flowers" },
  { name: "Mixed Blooms", slug: "mixed", localImage: "../../frontend/public/bouquets/bouquet_mixed_1771939118931.png", section: "favourite-flowers" },
];

async function sync() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    for (const cat of CATEGORIES_DATA) {
      let imageUrl = cat.image;

      if (cat.localImage) {
        const fullPath = path.resolve(__dirname, cat.localImage);
        if (fs.existsSync(fullPath)) {
          console.log(`Uploading ${cat.name} to Cloudinary...`);
          const result = await cloudinary.uploader.upload(fullPath, {
            folder: "mangalam/categories",
            public_id: cat.slug,
          });
          imageUrl = result.secure_url;
          console.log(`Uploaded: ${imageUrl}`);
        } else {
          console.warn(`Local file not found for ${cat.name}: ${fullPath}`);
        }
      }

      const updateData = {
        name: cat.name,
        slug: cat.slug,
        image: imageUrl,
        section: cat.section,
        isActive: true,
      };

      await Category.findOneAndUpdate(
        { slug: cat.slug },
        updateData,
        { upsert: true, new: true }
      );
      console.log(`Synced Category: ${cat.name}`);
    }

    console.log("All categories synced successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
}

sync();
