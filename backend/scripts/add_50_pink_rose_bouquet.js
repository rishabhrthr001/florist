
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773239468762.jpg";

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
    const categoryBySlug = await Category.findOne({ slug: "big-bunches" });
    if (!categoryBySlug) throw new Error("Category 'big-bunches' not found");
    console.log("Found Category:", categoryBySlug.name, categoryBySlug._id);

    // 3. Create Product
    const productName = "Pink Radiance 50 Rose Grand Bouquet";
    let baseSlug = "pink-radiance-50-rose-grand-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A stunning and voluminous arrangement that radiates elegance and charm. This grand bouquet features **50 premium hand-selected blush pink roses**, arranged with meticulous care to create a dense, breathtaking display of floral beauty. Hand-wrapped in signature multi-layered pink premium translucent parchment and finished with a grand magenta multi-layered satin bow.\n\n**This Grand Product Consists of**:\n- **Blush Perfection**: 50 Premium hand-selected blush pink roses.\n- **Packaging**: Signature multi-layered pink premium translucent parchment hand-wrapping.\n- **Finishing**: Large magenta multi-layered luxury ribbon bow.\n\n**Suitable for**: Significant anniversaries, grand romantic gestures, milestone birthdays, or as an unforgettable gift that radiates love, admiration, and grace.",
      images: [uploadRes.secure_url],
      price: 4500,
      categoryId: categoryBySlug._id,
      tags: ["50 roses", "pink roses", "grand bouquet", "anniversary", "birthday", "luxury", "big bunch", "flowers"],
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
