
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773316093491.jpg";

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
    const category = await Category.findOne({ slug: "anniversary" });
    if (!category) throw new Error("Category 'anniversary' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Silver 50th Jubilee Mixed Flora Gala Crate";
    let baseSlug = "silver-50th-jubilee-mixed-flora-gala-crate";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A vibrant and joyous celebration of a 50th milestone. This grand floral gala features a rich tapestry of yellow lilies, deep red roses, and a kaleidoscope of colorful chrysanthemums and micro-mums, all nestled in a rustic wooden crate. Crowned with two majestic silver foil balloons forming the number '50', it is the perfect centerpiece for a landmark anniversary or birthday.\n\n**Includes**: Silver '50' Foil Balloons, Rustic Wooden Crate, Premium Yellow Lilies, Red Roses, and Vibrant Mixed Blooms.",
      images: [uploadRes.secure_url],
      price: 4999,
      categoryId: category._id,
      tags: ["50th anniversary", "50th birthday", "silver jubilee", "mixed flowers", "yellow lilies", "red roses", "wooden crate", "hallmark celebration", "landmark gift", "premium"],
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
