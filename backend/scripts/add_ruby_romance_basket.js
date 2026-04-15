
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773229668397.jpg";

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
    const productName = "Ruby Romance & Teddy Floral Basket";
    let baseSlug = "ruby-romance-teddy-floral-basket";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A heartwarming and vibrant gift basket that perfectly blends romance and cuteness. Featuring a regal display of pink Oriental lilies and magenta stocks, complemented by deep red classic roses. This golden textured basket also includes a soft, cuddly red teddy bear holding a 'Just For You' heart, making it an ideal gift for expressing affection.\n\n**This Premium Product Consists of**:\n- **Premium Blooms**: 3-4 High-quality pink Oriental lilies.\n- **Vibrant Accents**: 3-5 Stems of fragrant magenta stocks.\n- **Classic Romance**: 4-6 Selected deep red roses.\n- **Cuddly Companion**: 1 Small premium red teddy bear (approx. 6 inches).\n- **Fillers**: Delicate white baby's breath and fresh greenery.\n- **Packaging**: Luxury gold-textured gift basket with handles.\n- **Finishing**: Signature pink satin ribbon bow.\n\n**Suitable for**: Birthdays, anniversaries, romantic gestures, Valentine's Day, or expressing deep affection.",
      images: [uploadRes.secure_url],
      price: 1250,
      categoryId: category._id,
      tags: ["roses", "teddy bouqyet", "lilies", "stocks", "gift", "romantic", "birthday"],
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
