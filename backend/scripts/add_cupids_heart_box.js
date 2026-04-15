
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773237470138.jpg";

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
    const category = await Category.findOne({ slug: "birthday" });
    if (!category) throw new Error("Category 'birthday' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Cupid's Heart Red Rose Luxury Hat Box";
    let baseSlug = "cupids-heart-red-rose-luxury-hat-box";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A majestic and romantic arrangement presented in a signature sky-blue cylindrical hat box. This ornate piece features a dense bed of premium red sweetheart roses accented with delicate white baby's breath. A unique heart-shaped metallic frame rises from the arrangement, accompanied by two long-stemmed roses tied with a shimmering silver bow. The box is further adorned with a decorative red silk rose and a matching silver bow for a truly luxurious finish.\n\n**This Product Consists of**:\n- **Main Flowers**: 15-20 Premium red sweetheart roses.\n- **Texture**: Abundant fresh white baby's breath (Gypsophila).\n- **Arched Feature**: Two tall-standing long-stemmed red roses with a silver mesh bow.\n- **Architectural Accent**: Heart-shaped metallic decorative frame.\n- **Container**: Signature sky-blue cylindrical luxury hat box.\n- **Box Adornment**: Hand-tied red silk rose with a silver ribbon bow.\n\n**Suitable for**: Anniversaries, grand romantic gestures, Valentine's Day, or a spectacular birthday surprise for someone special.",
      images: [uploadRes.secure_url],
      price: 1850,
      categoryId: category._id,
      tags: ["red roses", "hat box", "luxury", "romance", "anniversary", "birthday", "heart", "flowers"],
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
