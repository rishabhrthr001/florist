
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773235430378.jpg";

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
    const productName = "Blush & Ivory Elegance Lily Bouquet";
    let baseSlug = "blush-ivory-elegance-lily-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A sophisticated and soft-hued arrangement that radiates grace and serenity. Centered around majestic white lilies and their elegant green buds, this bouquet is beautifully layered with ruffled pink carnations and delicate lavender-tipped cluster chrysanthemums. Hand-wrapped in premium pink translucent parchment for a truly romantic presentation.\n\n**This Product Consists of**:\n- **Main Flowers**: 3-4 Large premium white Oriental lilies and 2-3 elegant lily buds.\n- **Soft Accents**: 6-8 Selected blush pink carnations.\n- **Floral Depth**: Multiple stems of lavender-toned cluster daisy chrysanthemums.\n- **Texture**: Abundant fresh white baby's breath (Gypsophila).\n- **Packaging**: Premium multi-layered pink translucent parchment wrapping.\n- **Finishing**: Large matching pink multi-layered ribbon bow.\n\n**Suitable for**: Anniversaries, weddings, Mother's Day, or expressing high-class admiration and sympathy.",
      images: [uploadRes.secure_url],
      price: 1350,
      categoryId: category._id,
      tags: ["lilies", "carnations", "white lily", "pink bouquet", "flowers", "elegant"],
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
