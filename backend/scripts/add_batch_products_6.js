
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773318676958.jpg",
    name: "Regal Red Rose & Rajnigandha Fragrant Symphony",
    slug: "regal-red-rose-rajnigandha-fragrant-symphony",
    description: "A stunning and soulful combination of classic red roses and the intoxicating fragrance of fresh white Rajnigandha (Tube Roses). Accented with baby's breath and expertly hand-wrapped in elegant cream paper with a dual-toned red and white bow. This bouquet is a feast for the senses.\n\n**Suitable for**: Traditional celebrations, Anniversaries, Romantic surprises, or as a sophisticated floral gift.",
    price: 1599,
    categorySlug: "flowers",
    tags: ["red roses", "rajnigandha", "tube rose", "fragrant", "classic", "gift", "anniversary", "soulful"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773318737603.jpg",
    name: "Crimson & Ivory Rose Whisper Bouquet",
    slug: "crimson-ivory-rose-whisper-bouquet",
    description: "A gentle and romantic blend of premium red and white roses, signifying pure love and passion. Hand-wrapped in soft white translucent paper, this bouquet is a timeless and elegant expression of affection.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, or as a gentle floral gesture.",
    price: 1299,
    categorySlug: "flowers",
    tags: ["red roses", "white roses", "romance", "gift", "bouquet", "gentle", "anniversary", "ivory roses"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773318805315.jpg",
    name: "Midnight Garnet Red Rose Grandeur",
    slug: "midnight-garnet-red-rose-grandeur",
    description: "A magnificent and high-impact arrangement of dozens of premium red roses, surrounded by a delicate cloud of white baby's breath. Wrapped in bold red translucent paper and finished with a luxurious red satin bow. A grand gesture for a grand occasion.\n\n**Suitable for**: Proposing love, Milestone Anniversaries, Romantic surprises, or when you want to make a bold statement.",
    price: 2499,
    categorySlug: "flowers",
    tags: ["red roses", "grand bouquet", "luxury", "romance", "anniversary", "vibrant", "premium", "babys breath", "garnet red"]
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
