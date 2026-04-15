
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773239329839.jpg";

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
    const productName = "Moonlight Elegance White Rose & Chocolate Indulgence";
    let baseSlug = "moonlight-elegance-white-rose-chocolate-indulgence";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A sophisticated blend of pure elegance and sweet indulgence. This stunning bouquet features ethereal white roses paired with a curated selection of premium chocolates and treats. Expertly hand-wrapped in signature midnight-black premium parchment with a soft peach lining, and finished with a shimmering silver mesh bow.\n\n**This Product Consists of**:\n- **Main Flowers**: 10-12 Selected premium long-stemmed white roses.\n- **Sweet Indulgence**: 1 Godiva Dark Chocolate bar, 1 Hershey's Creamy Milk Chocolate bar.\n- **Treats**: 3 Selective Kinder Joy eggs for a playful touch.\n- **Floral Accents**: Deep purple cluster chrysanthemums and clouds of white baby's breath.\n- **Packaging**: Signature multi-layered midnight-black premium parchment with a peach-toned inner lining.\n- **Finishing**: Large shimmering silver-toned mesh ribbon bow.\n\n**Suitable for**: Birthdays, graduation celebrations, romantic surprises, or as a sophisticated 'congratulations' gift for chocolate lovers.",
      images: [uploadRes.secure_url],
      price: 1750,
      categoryId: category._id,
      tags: ["white roses", "chocolate", "godiva", "hersheys", "kinder joy", "birthday", "gift", "luxury", "bouquet"],
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
