
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773236868126.jpg";

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

    // 1. Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const uploadRes = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "products",
    });
    console.log("Uploaded:", uploadRes.secure_url);

    // 2. Get category
    const category = await Category.findOne({ slug: "flowers" });
    if (!category) throw new Error("Category 'flowers' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Amethyst & Rose Quartz Pom-Pon Symphony";
    let baseSlug = "amethyst-rose-quartz-pom-pon-symphony";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A massive, dense bouquet of selected pom-pon daisy chrysanthemums in a vibrant gradient of amethyst purple, rose quartz pink, and deep magenta. Accented with misty clouds of fresh white baby's breath. Hand-wrapped in premium white textured parchment with an elegant gold-bordered top.\n\n**This Product Consists of**:\n- **Main Flowers**: 25-30 Stems of premium cluster pom-pon daisy chrysanthemums in mixed pink, purple, and magenta tones.\n- **Texture**: Abundant fresh white baby's breath (Gypsophila).\n- **Packaging**: Signature white premium textured parchment with an elegant gold-bordered top.\n- **Finishing**: Multiple layers of pink luxury satin ribbon.\n\n**Suitable for**: Mother's Day, anniversaries, congratulations, or for anyone who loves a dense, lush, and long-lasting floral arrangement.",
      images: [uploadRes.secure_url],
      price: 1650,
      categoryId: category._id,
      tags: ["chrysanthemums", "pink flowers", "purple flowers", "big bunch", "celebration", "flowers", "lush"],
      isActive: true,
      premiumWrapping: true
    });

    const saved = await newProduct.save();
    console.log("Product saved successfully:", saved.name, "at Rs.", saved.price);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
