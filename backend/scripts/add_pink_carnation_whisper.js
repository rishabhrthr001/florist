
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773229799076.jpg";

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
    const categoryName = "Flowers";
    const category = await Category.findOne({ slug: "flowers" });
    if (!category) throw new Error("Category 'flowers' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Blush Pink Carnation Whisper Bouquet";
    let baseSlug = "blush-pink-carnation-whisper-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A delicate and timeless expression of admiration and sweetness. This elegant bouquet features a lush cluster of premium pink carnations, symbolizing a mother's eternal love and pure affection. The ruffled petals create a soft, voluminous cloud, beautifully accented by fresh white baby's breath. It's hand-wrapped in sophisticated cream parchment and finished with a vibrant pink multi-layered ribbon bow.\n\n**This Product Consists of**:\n- **Premium Flowers**: 12-15 Fresh blush pink carnations.\n- **Accents**: Delicate white baby's breath (Gypsophila).\n- **Packaging**: Premium cream/ivory parchment paper wrapping.\n- **Finishing**: Large vibrant pink multi-layered ribbon bow.\n\n**Suitable for**: Mother's Day, birthdays, expressing gratitude, or as a romantic gesture of admiration.",
      images: [uploadRes.secure_url],
      price: 850,
      categoryId: category._id,
      tags: ["carnations", "pink", "blush", "mother's day", "bouquet", "flowers", "gift", "elegant"],
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
