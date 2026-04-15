
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773230067427.jpg";

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
    const productName = "Sweet Affection Chocolate & Red Rose Teddy Bouquet";
    let baseSlug = "sweet-affection-chocolate-red-rose-teddy-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A delightful fusion of sweetness and romance. This luxurious bouquet features fresh red roses combined with a selection of premium chocolates, including KitKats and Cadbury favorites. Accented with delicate white baby's breath and a charming cuddly teddy bear mascot, it's the perfect treat for your special someone.\n\n**This Product Consists of**:\n- **Roses**: 6-8 Fresh premium red roses.\n- **Chocolates**: 4-6 KitKat bars and 3-5 assorted premium chocolate bars (Dairy Milk/Munch).\n- **Cuddly Companion**: 1 Small premium brown teddy bear mascot attached to the wrapping.\n- **Fillers**: Abundant white baby's breath (Gypsophila).\n- **Wrapping**: Signature light yellow/cream premium parchment.\n- **Finishing**: Charming teddy bear accent and professional florist's tie.\n\n**Suitable for**: Birthdays, anniversaries, apologies, Valentine's Day, or simply to sweeten someone's day.",
      images: [uploadRes.secure_url],
      price: 1450,
      categoryId: category._id,
      tags: ["chocolate bouquet", "kitkat", "red roses", "teddy bouquet", "gift", "sweet", "romantic", "birthday"],
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
