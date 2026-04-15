
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773229035484.jpg";

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
    const productName = "Amethyst Lotus & Fragrant Stock Symphony";
    let baseSlug = "amethyst-lotus-fragrant-stock-symphony";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A rare and regal arrangement that combines the sacred beauty of the lotus with the vertical elegance of fragrant stocks. This stunning bouquet features a central, vibrant purple lotus surrounded by soft pink lotus blossoms and tall, aromatic purple stocks. Hand-wrapped in layers of lavender translucent premium parchment and finished with a sparkling silver bow.\n\n**This Product Consists of**:\n- **Premium Feature**: 1 Rare vibrant purple lotus (Nelumbo) and 4-6 soft pink lotus blossoms.\n- **Vertical Grace**: 3-5 Fragrant purple stock (Matthiola incana) spikes.\n- **Texture**: Clouds of fresh white baby's breath.\n- **Packaging**: Dual-layered lavender translucent premium parchment.\n- **Finishing**: Sparkling silver glitter ribbon with a floral accent.\n\n**Suitable for**: Spiritual celebrations, grand expressions of respect, anniversaries, or for those who appreciate the unique beauty of aquatic flowers.",
      images: [uploadRes.secure_url],
      price: 1650,
      categoryId: category._id,
      tags: ["lotus", "purple lotus", "stocks", "fragrant", "purple", "lavender", "pink", "bouquet", "unique", "regal"],
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
