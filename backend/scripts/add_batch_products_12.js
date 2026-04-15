
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773320211080.jpg",
    name: "Scarlet Rose & Rajnigandha Fragrant Grace",
    slug: "scarlet-rose-rajnigandha-fragrant-grace",
    description: "A traditional and soulful arrangement featuring velvety scarlet roses and the intoxicating fragrance of fresh Rajnigandha (Tube Roses). Expertly hand-wrapped in soft cream paper and finished with a voluminous pink and white ribbon bow. A timeless gift for meaningful celebrations.\n\n**Suitable for**: Anniversaries, Romantic surprises, Home decor, or as a sophisticated floral gift.",
    price: 1599,
    categorySlug: "flowers",
    tags: ["red roses", "rajnigandha", "tube rose", "fragrant", "classic", "gift", "anniversary", "soulful"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773320298184.jpg",
    name: "Magenta Majestic Lily in Gilded Golden Vase",
    slug: "magenta-majestic-lily-gilded-golden-vase",
    description: "A magnificent display of vibrant magenta lilies, blooming with regal splendor. Presented in a sophisticated, hand-etched golden gilded vase and finished with a delicate gold mesh ribbon. This arrangement exudes luxury and refinement.\n\n**Suitable for**: Grand celebrations, Luxury decor, Corporate gifting, or as a spectacular anniversary surprise.",
    price: 3299,
    categorySlug: "flowers",
    tags: ["magenta lilies", "golden vase", "luxury decor", "elegant", "sophisticated", "gift", "premium flowers", "vase arrangement"]
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
