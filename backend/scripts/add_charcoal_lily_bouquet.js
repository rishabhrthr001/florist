
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773236807979.jpg";

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
    const productName = "Charcoal & Pink Lily Symphony Bouquet";
    let baseSlug = "charcoal-pink-lily-symphony-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A sophisticated and moody arrangement that exudes modern elegance. This striking bouquet features soft pink lilies and multiple stems of pink cluster chrysanthemums, punctuated by the bold presence of a radiant red carnation. Expertly hand-wrapped in signature charcoal-grey premium heavy parchment and finished with a luxurious chocolate-brown satin ribbon bow.\n\n**This Product Consists of**:\n- **Main Flowers**: 3-4 Large premium pink Oriental lilies and 3-5 elegant pink lily buds.\n- **Bold Accent**: 1 Selected radiant red premium carnation.\n- **Floral Depth**: Abundant stems of pink daisy chrysanthemums.\n- **Texture**: Fresh white baby's breath (Gypsophila).\n- **Packaging**: Signature charcoal-grey/black premium textured parchment wrapping.\n- **Finishing**: Large chocolate-brown luxury satin ribbon bow.\n\n**Suitable for**: Anniversaries, sophisticated birthdays, apologies, or as a high-fashion gift for someone who appreciates bold, modern aesthetics.",
      images: [uploadRes.secure_url],
      price: 1450,
      categoryId: category._id,
      tags: ["pink lily", "red carnation", "charcoal wrapping", "modern", "luxury", "bouquet", "flowers", "pink and black"],
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
