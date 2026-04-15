
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Define temporary schemas to access data
    const categorySchema = new mongoose.Schema({ name: String, slug: String });
    const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

    const productSchema = new mongoose.Schema({
      name: String,
      slug: String,
      description: String,
      tags: [String],
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    });
    const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

    const products = await Product.find({}).populate('categoryId').lean();
    
    const exportData = products.map(p => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      tags: p.tags,
      category: p.categoryId ? p.categoryId.name : "N/A",
      categorySlug: p.categoryId ? p.categoryId.slug : "N/A"
    }));

    fs.writeFileSync("all_products.json", JSON.stringify(exportData, null, 2));
    console.log(`Exported ${exportData.length} products to all_products.json`);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
