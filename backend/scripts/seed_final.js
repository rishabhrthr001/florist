
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  section: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  images: [String],
  categoryId: mongoose.Schema.Types.ObjectId,
  tags: [String],
  isActive: { type: Boolean, default: true }
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mangalam database");

    // 1. Define Categories
    const categoriesData = [
      { name: "Birthdays", slug: "birthday", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=300&q=80", section: "shop-by-category" },
      { name: "Anniversary", slug: "anniversary", image: "/categories-new/anniversary.png", section: "shop-by-category" },
      { name: "Chocolates", slug: "chocolates", image: "/categories-new/chocolates.png", section: "shop-by-category" },
      { name: "Cakes", slug: "cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80", section: "shop-by-category" },
      { name: "Bouquets", slug: "bouquets", image: "https://images.unsplash.com/photo-1522673607200-1648832cee98?w=300&q=80", section: "shop-by-category" },
      { name: "Plants", slug: "plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&q=80", section: "shop-by-category" },
      { name: "Big Bunches", slug: "big-bunches", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300&q=80", section: "shop-by-category" },
      
      // Celebrate Love
      { name: "Wedding", slug: "wedding", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80", section: "celebrate-love" },
      { name: "Romantic Flowers", slug: "flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&q=80", section: "celebrate-love" },
      
      // Cherished Celebrations
      { name: "Garland", slug: "garland", image: "/icons-new/jaimala.png", section: "cherished-celebrations" }
    ];

    console.log("Clearing old categories...");
    await Category.deleteMany({});
    
    console.log("Inserting new categories...");
    const createdCats = await Category.insertMany(categoriesData);
    console.log(`Inserted ${createdCats.length} categories.`);

    // 2. Map existing products to categories
    const products = await Product.find({});
    console.log(`Found ${products.length} products to categorize.`);

    const bouquetCat = createdCats.find(c => c.slug === 'bouquets');
    const chocolateCat = createdCats.find(c => c.slug === 'chocolates');
    const flowersCat = createdCats.find(c => c.slug === 'flowers');

    for (const p of products) {
      let targetCatId = bouquetCat._id; // Default to bouquets
      
      const name = p.name.toLowerCase();
      if (name.includes('hershey') || name.includes('chocolate')) {
        targetCatId = chocolateCat._id;
      } else if (name.includes('orchid') || name.includes('rose') || name.includes('lily')) {
        // If it's a specific flower, maybe it belongs in flowers cat or bouquet
        targetCatId = bouquetCat._id;
      }

      await Product.updateOne({ _id: p._id }, { $set: { categoryId: targetCatId } });
    }

    console.log("Products updated with valid category IDs.");
    console.log("\nDatabase check complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
