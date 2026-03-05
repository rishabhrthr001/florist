
import mongoose from "mongoose";
import dotenv from "dotenv";
import Tag from "../models/Tag.js";
import Product from "../models/Product.js";

dotenv.config();

const frontendTags = [
  "wedding", "anniversary", "birthday", "roses", "lilies", "sunflowers", 
  "orchids", "carnations", "mixed", "exotic", "garland", "bouquets", "thinking-of-you", 
  "sorry", "flowers", "girlfriend", "boyfriend", "miss-you", "baby-shower", 
  "retirement", "new-born", "wellness", "thank-you", "best-wishes", "housewarming"
];

async function syncTags() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected for Tag Synchronization...");

    // 1. Clear and Seed Tag Model
    await Tag.deleteMany({});
    const tagObjects = frontendTags.map(tag => ({
      name: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' '),
      slug: tag,
      isActive: true
    }));
    await Tag.insertMany(tagObjects);
    console.log(`Seeded ${tagObjects.length} tags into the Tag model.`);

    // 2. Clean up product tags
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      if (product.tags && product.tags.length > 0) {
        const cleanedTags = product.tags.filter(t => frontendTags.includes(t.toLowerCase()));
        
        if (cleanedTags.length !== product.tags.length) {
          product.tags = cleanedTags;
          await product.save();
          updatedCount++;
        }
      }
    }

    console.log(`Cleaned up tags for ${updatedCount} products.`);
    console.log("Tag synchronization complete!");
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
}

syncTags();
