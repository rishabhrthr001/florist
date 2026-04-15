
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773236673527.jpg";

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
    const category = await Category.findOne({ slug: "big-bunches" });
    if (!category) throw new Error("Category 'big-bunches' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Regal Amethyst & Rose Grand Floral Masterpiece";
    let baseSlug = "regal-amethyst-rose-grand-floral-masterpiece";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "An absolute titan of floral design, this grand arrangement is an exercise in symmetry and vibrant luxury. Featuring majestic pink and magenta lilies at its heart, it is flanked by towering spires of royal purple Stock flowers and a dense base of sweetheart roses and mixed chrysanthemums. Architectural red decorative sticks add height and a modern edge to this traditional masterpiece.\n\n**This Product Consists of**:\n- **Lilies**: 4-6 Majestic pink and magenta Oriental lilies.\n- **Roses**: 10-12 Selected sweetheart pink roses.\n- **Texture**: Multiple stems of royal purple Stock/Snapdragons.\n- **Chrysanthemums**: A mix of white cluster carnations and deep burgundy bicolored chrysanthemums.\n- **Accents**: Tall red decorative architectural sticks for height.\n- **Fillers**: Fresh white baby's breath and lush tropical palm greenery.\n- **Presentation**: Arranged in a premium concealed florist's base for long-lasting freshness.\n\n**Suitable for**: Significant anniversaries, grand romantic gestures, corporate grand openings, or as a centerpiece for luxury events.",
      images: [uploadRes.secure_url],
      price: 3500,
      categoryId: category._id,
      tags: ["grand arrangement", "lilies", "purple stock", "pink roses", "luxury", "big bunch", "anniversary", "corporate gift"],
      isActive: true,
      premiumWrapping: false // This is a self-standing grand arrangement
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
