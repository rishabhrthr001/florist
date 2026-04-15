
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773235918222.jpg";

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
    const productName = "Blush & Ivory Garden Mist Bouquet";
    let baseSlug = "blush-ivory-garden-mist-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A lush and romantic garden-style arrangement that captures the essence of a morning mist. This stunning bouquet blends delicate light pink roses with ruffled carnations and crisp white cluster daisies. The addition of aromatic silver dollar eucalyptus provides a modern, botanical touch. Hand-wrapped in vibrant pink premium parchment with a luxury gold-toned lining, and finished with a grand multi-layered satin bow.\n\n**This Product Consists of**:\n- **Premium Roses**: 6-8 Delicate light pink roses.\n- **Soft Texture**: 5-7 Ruffled pink carnations.\n- **Botanical Detail**: Fresh silver dollar eucalyptus stems and abundant white baby's breath.\n- **Floral Fillers**: Multiple stems of white cluster daisy chrysanthemums.\n- **Packaging**: Signature vibrant pink premium parchment hand-wrapping with a gold-toned inner lining.\n- **Finishing**: Large multi-layered pink satin ribbon bow.\n\n**Suitable for**: Anniversaries, romantic milestones, sweet sixteen birthdays, or as a sophisticated 'congratulations' gift.",
      images: [uploadRes.secure_url],
      price: 1250,
      categoryId: category._id,
      tags: ["pink roses", "carnations", "eucalyptus", "white daisies", "sweet", "romantic", "bouquet", "flowers", "garden style"],
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
