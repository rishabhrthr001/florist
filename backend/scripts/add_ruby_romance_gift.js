
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773221579879.jpg";

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
    // This looks like a teddy/gift combination, let's try 'bouquets' or 'flowers'
    let category = await Category.findOne({ slug: "teddy-bouquet" });
    if (!category) {
        category = await Category.findOne({ slug: "bouquets" });
    }
    if (!category) {
        category = await Category.findOne({ slug: "flowers" });
    }
    
    if (!category) throw new Error("Suitable category not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Ruby Romance Teddy & Lily Handbag Gift";
    let baseSlug = "ruby-romance-teddy-lily-handbag-gift";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "Surprise your loved ones with this adorable and elegant gift set. Nestled within a luxurious gold quilted designer handbag, this arrangement **features vibrant maroon lilies, deep red roses, and pink stock flowers**, accented with delicate baby's breath.\n\nCompleting this sweet gesture is a plush red 'Just For You' teddy bear, making it a complete package of love and luxury.\n\n**Suitable for**: Valentine's Day, Romantic surprises, Birthdays, or 'Just Because' moments that require an extra special touch.",
      images: [uploadRes.secure_url],
      price: 1850,
      categoryId: category._id,
      tags: ["teddy", "lily", "roses", "handbag", "gift set", "romance", "luxury", "red"],
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
