
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773262526861.jpg";

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
    const categoryName = "Birthdays";
    const category = await Category.findOne({ slug: "birthday" });
    if (!category) throw new Error("Category 'birthday' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Blush & Gold Celebration Gift Basket";
    let baseSlug = "blush-gold-celebration-gift-basket";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "Make every celebration unforgettable with our Blush & Gold Celebration Basket. This elegant wicker hamper combines a lush seasonal arrangement of pink chrysanthemums and white Baby's Breath with a premium gift box hand-wrapped in sophisticated gold-marbled paper. Adorned with magnifique oversized bows in cream and magenta satin, it's the perfect all-in-one gift for grand surprises.\n\n**Suitable for**: Birthdays, Job Promotions, Grand Openings, or any festive milestone.",
      images: [uploadRes.secure_url],
      price: 2499,
      categoryId: category._id,
      tags: ["gift basket", "hamper", "pink flowers", "celebration", "birthday", "anniversary", "luxury", "wicker", "premium gifting"],
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
