
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const categorySchema = new mongoose.Schema({ name: String, slug: String, isActive: { type: Boolean, default: true } });
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  images: [String],
  price: Number,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isOutOfStock: { type: Boolean, default: false }
});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let vaseCat = await Category.findOne({ slug: "vases" });
  if (!vaseCat) {
    vaseCat = await Category.create({ name: "Vases", slug: "vases" });
    console.log("Created Vases category");
  }

  const vases = [
    {
      name: "Classic Glass Bud Vase",
      slug: "classic-glass-bud-vase",
      description: "A simple yet elegant clear glass bud vase, perfect for single stems or small bunches.",
      images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800"],
      price: 299,
      tags: ["vase", "glass", "clear"]
    },
    {
      name: "Modern Ceramic White Vase",
      slug: "modern-ceramic-white-vase",
      description: "Minimalist matte white ceramic vase that complements any bouquet.",
      images: ["https://images.unsplash.com/photo-1612115539052-fc6027376c9c?auto=format&fit=crop&q=80&w=800"],
      price: 499,
      tags: ["vase", "ceramic", "white"]
    },
    {
      name: "Vintage Amber Glass Vase",
      slug: "vintage-amber-glass-vase",
      description: "Add a touch of warmth with this beautiful amber-colored glass vase.",
      images: ["https://images.unsplash.com/photo-1574483764053-f725178619bc?auto=format&fit=crop&q=80&w=800"],
      price: 399,
      tags: ["vase", "vintage", "amber"]
    },
    {
      name: "Tall Crystalline Fluted Vase",
      slug: "tall-crystalline-fluted-vase",
      description: "A tall, elegant vase with fluted details, perfect for long-stemmed lilies.",
      images: ["https://images.unsplash.com/photo-1603509206782-f38b813b6329?auto=format&fit=crop&q=80&w=800"],
      price: 899,
      tags: ["vase", "crystal", "tall"]
    }
  ];

  for (const v of vases) {
    const exists = await Product.findOne({ slug: v.slug });
    if (!exists) {
      await Product.create({ ...v, categoryId: vaseCat._id });
      console.log(`Added ${v.name}`);
    }
  }

  console.log("Done");
  process.exit(0);
}

run();
