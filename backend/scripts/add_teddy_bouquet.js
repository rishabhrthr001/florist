
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773217555334.jpg";

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

    // 2. Get category (Try teddy-bouquet first, then bouquets)
    let category = await Category.findOne({ slug: "teddy-bouquet" });
    if (!category) {
        category = await Category.findOne({ slug: "bouquets" });
    }
    if (!category) throw new Error("Category 'teddy-bouquet' or 'bouquets' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "So Sweet Teddy & Pink Rose Hamper";
    let baseSlug = "so-sweet-teddy-pink-rose-hamper";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "Delight your loved ones with our signature 'So Sweet' Hamper. This adorable gift features a lush base of premium pink roses and baby's breath, presented in a unique vintage-style Parisian box. Perched on top is a cuddly white teddy bear clutching a 'So Sweet' heart and a matching pink rose.\n\nCombined with elegant ribbons and artisanal wrapping, this is the ultimate combination of elegance and cuteness.\n\nSuitable for: Birthdays, Anniversaries, Proposals, or a sweet surprise for a special someone.",
      images: [uploadRes.secure_url],
      price: 1450,
      categoryId: category._id,
      tags: ["roses", "teddy bouquet", "pink", "gift", "hamper", "anniversary", "birthday"],
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
