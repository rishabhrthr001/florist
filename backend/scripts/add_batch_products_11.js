
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

const productsData = [
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319940056.jpg",
    name: "Lavender Dream Premium Purple Tulip Bouquet",
    slug: "lavender-dream-premium-purple-tulip-bouquet",
    description: "A vision of pure elegance. This breathtaking bouquet features a cluster of premium, velvet-textured purple tulips, symbolizing royalty and deep admiration. Nestled among a delicate cloud of fresh white baby's breath, it is expertly hand-wrapped in layered seaglass-green translucent paper and finished with a sophisticated gold-striped ribbon bow. A choice that radiates grace and style.\n\n**Suitable for**: Spring greetings, Appreciation, Royalty-themed surprises, or as a chic floral accent.",
    price: 2299,
    categorySlug: "flowers",
    tags: ["purple tulips", "babys breath", "seaglass wrapping", "premium flowers", "gift", "elegant", "royalty", "spring bouquet"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773320076815.jpg",
    name: "Majestic Gilded Rose & Amethyst Orchid Velvet Symphony",
    slug: "majestic-gilded-rose-amethyst-orchid-velvet-symphony",
    description: "An architectural masterpiece of floral design. This grand arrangement features a lush base of golden-yellow premium roses, topped with a towering cascade of vibrant amethyst dendrobium orchids. Meticulously presented in a tall, soft pink velvet-covered designer vase and finished with a delicate white satin bow. The perfect centerpiece for a sophisticated celebration.\n\n**Suitable for**: Grand milestones, Luxury home decor, Corporate gifting, or as a spectacular anniversary surprise.",
    price: 3499,
    categorySlug: "flowers",
    tags: ["yellow roses", "purple orchids", "dendrobium", "velvet vase", "architectural floral", "luxury gift", "centerpiece", "grand display", "anniversary"]
  }
];

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Models
    const categorySchema = new mongoose.Schema({ name: String, slug: String });
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
      premiumWrapping: { type: Boolean, default: false }
    });
    const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

    for (const p of productsData) {
      console.log(`Processing: ${p.name}...`);
      
      // 1. Upload to Cloudinary
      console.log(`Uploading ${p.imagePath} to Cloudinary...`);
      const uploadRes = await cloudinary.v2.uploader.upload(p.imagePath, {
        folder: "products",
      });
      console.log("Uploaded:", uploadRes.secure_url);

      // 2. Get category
      const category = await Category.findOne({ slug: p.categorySlug });
      if (!category) {
          console.warn(`Category '${p.categorySlug}' not found, skipping ${p.name}`);
          continue;
      }

      // 3. Create Product
      let slug = p.slug;
      const existing = await Product.findOne({ slug });
      if (existing) {
          slug += "-" + Math.floor(Math.random() * 1000);
      }
      
      const newProduct = new Product({
        name: p.name,
        slug: slug,
        description: p.description,
        images: [uploadRes.secure_url],
        price: p.price,
        categoryId: category._id,
        tags: p.tags,
        isActive: true,
        premiumWrapping: p.price > 2500
      });

      const saved = await newProduct.save();
      console.log("Product saved successfully:", saved.name, "at Rs.", saved.price);
    }

    console.log("Batch processed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
