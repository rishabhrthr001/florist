
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773338271070.jpg",
    name: "Rustic Pink Carnation & Baby's Breath Bouquet",
    slug: "rustic-pink-carnation-babys-breath-bouquet",
    description: "A charming and rustic-style arrangement of lush pink carnations, perfectly accented with delicate white baby's breath. Hand-wrapped in eco-friendly brown kraft paper for a natural and sincere look, and finished with a bright pink ribbon. A sweet and thoughtful gesture for any occasion.\n\n**Suitable for**: Mother's Day, Thank You gifts, Thinking of You, or simply as a natural home decor accent.",
    price: 999,
    categorySlug: "flowers",
    tags: ["pink carnations", "babys breath", "rustic bouquet", "kraft paper", "natural", "eco-friendly wrap", "gift"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773338413782.jpg",
    name: "Midnight Amethyst Lisianthus & Statice Bouquet",
    slug: "midnight-amethyst-lisianthus-statice-bouquet",
    description: "A deep and mysterious arrangement of premium purple lisianthus and textured purple statice. This monochromatic purple bouquet exudes elegance and depth, hand-wrapped in light brown designer paper and finished with a natural jute twine for a sophisticated yet earthy aesthetic. A unique and high-end floral gift.\n\n**Suitable for**: Congratulations, Milestone achievements, Formal events, or as a sophisticated romantic surprise.",
    price: 1599,
    categorySlug: "flowers",
    tags: ["purple lisianthus", "purple statice", "monochromatic", "rustic elegance", "sophisticated", "gift", "premium flowers"]
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
        premiumWrapping: p.price > 2000
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
