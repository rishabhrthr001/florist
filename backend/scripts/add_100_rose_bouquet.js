
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773237157586.jpg";

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
    const categoryBySlug = await Category.findOne({ slug: "big-bunches" });
    if (!categoryBySlug) throw new Error("Category 'big-bunches' not found");
    console.log("Found Category:", categoryBySlug.name, categoryBySlug._id);

    // 3. Create Product
    const productName = "Midnight Passion 100 Red Rose Grand Bouquet";
    let baseSlug = "midnight-passion-100-red-rose-grand-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "The ultimate declaration of undying love. This massive grand bouquet features **100 selected premium long-stemmed red roses**, arranged into a perfect, dense dome of crimson beauty. Accented with a delicate outer ring of fresh white baby's breath and hand-wrapped in signature midnight-black premium multi-layered parchment. Finished with a grand crimson red multi-layered satin bow.\n\n**This Grand Product Consists of**:\n- **Ultimate Romance**: 100 Selected premium long-stemmed red roses.\n- **Accents**: Outer halo of fresh white baby's breath (Gypsophila).\n- **Packaging**: Signature midnight-black premium multi-layered parchment hand-wrapping.\n- **Finishing**: Large ruby red multi-layered luxury ribbon bow.\n\n**Suitable for**: Grand romantic proposals, diamond anniversaries, major milestones, or any occasion that demands the absolute maximum expression of love and devotion.",
      images: [uploadRes.secure_url],
      price: 8500,
      categoryId: categoryBySlug._id,
      tags: ["100 roses", "red roses", "grand bouquet", "anniversary", "proposal", "luxury", "big bunch", "romance"],
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
