
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315980426.jpg",
    name: "Blushing Meadow Lily & Carnation Symphony",
    slug: "blushing-meadow-lily-carnation-symphony",
    description: "A vibrant and lush arrangement featuring premium pink lilies, bold magenta carnations, and a cloud of soft pink chrysanthemums. Expertly hand-wrapped in layered pink and white translucent paper and finished with a grand pink satin bow. A spectacular choice for expressing joy and admiration.\n\n**Suitable for**: Anniversaries, Birthdays, Graduations, or any occasion that calls for a grand floral gesture.",
    price: 2299,
    categorySlug: "flowers",
    tags: ["pink lilies", "carnations", "chrysanthemums", "vibrant pink", "bouquet", "anniversary", "birthday", "gift", "luxury"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773316030638.jpg",
    name: "Golden 50th Jubilee Majestic Floral Crate",
    slug: "golden-50th-jubilee-majestic-floral-crate",
    description: "A grand and celebratory floral masterpiece designed for a 50th Milestone. This architectural arrangement features a lush bed of soft pink roses, vibrant purple matthiola, and deep burgundy chrysanthemums, all set within a rustic wooden crate. The backdrop consists of tall, slender green stalks accented with purple blooms, framing a glittering blue '50' sign. A truly monumental gift for a once-in-a-lifetime celebration.\n\n**Includes**: Glittering '50' Sign, Rustic Wooden Crate, Premium Pink Roses, Purple Matthiola, and Architectural Greenery.",
    price: 5499,
    categorySlug: "anniversary",
    tags: ["50th anniversary", "50th birthday", "milestone gift", "pink roses", "purple flowers", "wooden crate", "grand display", "architectural floral", "premium"]
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
        premiumWrapping: p.price > 3000
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
