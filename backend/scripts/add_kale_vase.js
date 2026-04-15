
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773226552737.jpg";

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
    const productName = "Amethyst & Emerald Ornamental Kale Vase Arrangement";
    let baseSlug = "amethyst-emerald-ornamental-kale-vase";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A masterful display of botanical artistry that blends the exotic with the classic. This unique centerpiece features the striking, rose-like form of **ornamental purple kale**, paired beautifully with **regal pink lilies** and **pristine white roses**. Set in a clear cylindrical glass vase, it creates a vertical symphony of deep purples, soft pinks, and fresh whites.\n\n**This Premium Arrangement Consists of**:\n- **Unique Feature**: 2-3 Premium ornamental purple kale (Brassica) stems.\n- **Main Blooms**: 3-5 Long-stemmed pink lilies with buds.\n- **Elegance**: 5-6 Pristine white spray roses.\n- **Texture**: Clouds of fresh white and pink wax flowers (Chamelaucium).\n- **Packaging**: Clear premium cylindrical glass vase (Included).\n- **Finishing**: Natural stem display within the vase.\n\n**Suitable for**: Modern home decor, corporate reception desks, grand dining table centerpieces, or as a sophisticated gift for someone who appreciates unique botanical varieties.",
      images: [uploadRes.secure_url],
      price: 1950,
      categoryId: category._id,
      tags: ["ornamental kale", "lilies", "white roses", "vase", "luxury", "centerpiece", "unique", "modern"],
      isActive: true,
      premiumWrapping: false // Vase is the primary feature
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
