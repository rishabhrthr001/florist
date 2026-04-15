
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773226710972.jpg";

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
    const productName = "Blush Lavender Stock & Chrysanthemum Symphony";
    let baseSlug = "blush-lavender-stock-chrysanthemum-symphony";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A vertical masterpiece of soft textures and pastel elegance. This stunning bouquet features tall, fragrant spikes of lavender stocks rising from a dense cloud of blush pink and pristine white chrysanthemums. Hand-wrapped in premium frosted pink parchment and decorated with a coordinated multi-layered satin bow.\n\n**This Product Consists of**:\n- **Tall Feature**: 3-5 Fragrant lavender stock (Matthiola incana) stems.\n- **Main Blooms**: Fresh blush pink and white cluster chrysanthemums.\n- **Texture**: Delicate white baby's breath (Gypsophila) filler.\n- **Packaging**: Premium frosted baby pink parchment wrapping.\n- **Finishing**: Vibrant pink multi-layered satin ribbon bow with floral accent.\n\n**Suitable for**: Mother's Day, new baby celebrations, birthday surprises, or as a graceful 'Thank You' gesture.",
      images: [uploadRes.secure_url],
      price: 1150,
      categoryId: category._id,
      tags: ["stocks", "lavender", "chrysanthemums", "pink", "white", "fragrant", "bouquet", "gift"],
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
