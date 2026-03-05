
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  image: String,
  section: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true }
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mangalam database");

    const categoriesData = [
      // 1. Shop by Category (Section: shop-by-category)
      { name: "Birthdays", slug: "birthday", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=300&q=80", section: "shop-by-category" },
      { name: "Anniversary", slug: "anniversary", image: "/categories-new/anniversary.png", section: "shop-by-category" },
      { name: "Chocolates", slug: "chocolates", image: "/categories-new/chocolates.png", section: "shop-by-category" },
      { name: "Cakes", slug: "cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80", section: "shop-by-category" },
      { name: "Bouquets", slug: "bouquets", image: "https://images.unsplash.com/photo-1522673607200-1648832cee98?w=300&q=80", section: "shop-by-category" },
      { name: "Plants", slug: "plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&q=80", section: "shop-by-category" },
      { name: "Big Bunches", slug: "big-bunches", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300&q=80", section: "shop-by-category" },
      
      // 2. Celebrate Love (Section: celebrate-love)
      { name: "Wedding", slug: "wedding", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80", section: "celebrate-love" },
      { name: "Anniversary Love", slug: "anniversary-love", image: "/categories-new/anniversary.png", section: "celebrate-love" },
      { name: "Romantic Flowers", slug: "flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&q=80", section: "celebrate-love" },
      { name: "For Girlfriend", slug: "girlfriend", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300&q=80", section: "celebrate-love" },
      { name: "For Boyfriend", slug: "boyfriend", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300&q=80", section: "celebrate-love" },
      { name: "Miss You", slug: "miss-you", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&q=80", section: "celebrate-love" },

       // 3. Cherished Celebrations (Section: cherished-celebrations)
      { name: "Teddy Bouquet", slug: "teddy-bouquet", image: "/icons-new/teddy_new.png", section: "cherished-celebrations" },
      { name: "Chocolate Bouquet", slug: "chocolate-bouquet", image: "/icons-new/chocolate_new.png", section: "cherished-celebrations" },
      { name: "Memorial", slug: "memorial", image: "/icons-new/memorial.png", section: "cherished-celebrations" },
      { name: "Fruit Basket", slug: "fruit-basket", image: "/icons-new/fruit.png", section: "cherished-celebrations" },
      { name: "Exotic Flowers", slug: "exotic", image: "/icons-new/exotic.png", section: "cherished-celebrations" },
      { name: "Garland", slug: "garland", image: "/icons-new/jaimala.png", section: "cherished-celebrations" }
    ];

    console.log("Emptying categories...");
    await Category.deleteMany({});

    console.log("Seeding 19 accurate categories...");
    await Category.insertMany(categoriesData);

    console.log("Success! Celebrate Love now has its 6 items.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
