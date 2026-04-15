
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773226004033.jpg";

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
    const productName = "Ivory Cloud Hydrangea & Purple Lisianthus Bouquet";
    let baseSlug = "ivory-cloud-hydrangea-purple-lisianthus-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A centerpiece of pure elegance, this bouquet features a massive, cloud-like white hydrangea as its heart. It's surrounded by regal purple lisianthus and sprays of delicate purple sea lavender, all nestled among fresh green foliage and airy baby's breath. Hand-wrapped in premium frosted parchment with golden trim and tied with a sophisticated gold-and-white braided cord.\n\n**This Product Consists of**:\n- **Main Feature**: 1 Oversized premium white hydrangea.\n- **Contrast Flowers**: 4-6 Regal purple lisianthus/eustoma blossoms.\n- **Texture**: Sprays of purple statice or limonium and fresh white baby's breath.\n- **Packaging**: Premium frosted translucent wrapping with elegant gold-bordered edges.\n- **Finishing**: Hand-tied with a luxury gold-and-white braided twine cord.\n\n**Suitable for**: Centerpieces, grand gestures, elegant surprises, or as a sophisticated thank-you gift.",
      images: [uploadRes.secure_url],
      price: 1550,
      categoryId: category._id,
      tags: ["hydrangea", "purple", "white", "lisianthus", "elegant", "bouquet", "gift", "luxury"],
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
