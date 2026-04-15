
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773237377976.jpg";

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
    const productName = "Azure & Blush Rose Orchid Symphony";
    let baseSlug = "azure-blush-rose-orchid-symphony";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A breathtaking and modern arrangement that blends the classic romance of roses with the exotic allure of orchids. This stunning bouquet features selected premium white and blush pink roses, harmoniously paired with vibrant electric blue Dendrobium orchids. Hand-wrapped in layers of light azure-blue premium parchment with a refined gold-bordered trim and finished with a shimmering silver ribbon bow.\n\n**This Product Consists of**:\n- **Main Flowers**: 6-8 Selected premium white and light pink roses.\n- **Exotic Accents**: 5-7 Stems of vibrant electric blue Dendrobium orchids and green orchid buds.\n- **Texture**: Abundant clouds of fresh white baby's breath (Gypsophila).\n- **Packaging**: Signature light azure-blue premium parchment hand-wrapping with a luxury gold-bordered top trim.\n- **Finishing**: Large shimmering silver-toned luxury ribbon bow.\n\n**Suitable for**: Modern birthdays, unique anniversaries, corporate celebrations, or for those who appreciate a sophisticated and unconventional color palette.",
      images: [uploadRes.secure_url],
      price: 1550,
      categoryId: category._id,
      tags: ["roses", "white roses", "pink roses", "blue orchids", "lavender", "azure", "modern", "exotic", "bouquet", "flowers"],
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
