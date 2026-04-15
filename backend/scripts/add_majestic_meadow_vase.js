
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773239401916.jpg";

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
    const productName = "Majestic Meadow Lily & Chrysanthemum Vase Symphony";
    let baseSlug = "majestic-meadow-lily-chrysanthemum-vase-symphony";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A tall and stately arrangement that brings the freshness of a wild meadow into any space. This sophisticated vase display features majestic white Oriental lilies and vibrant pink lilies, surrounded by dense clusters of bicolored burgundy and white chrysanthemums. Touches of soft pink carnations and airy baby's breath add depth and texture, all perfectly balanced in a classic square glass vase.\n\n**This Product Consists of**:\n- **Stately Lilies**: 2-3 Massive white Oriental lilies and 2-3 vibrant pink lilies with elegant buds.\n- **Floral Depth**: Dense clusters of deep burgundy bicolored daisy chrysanthemums.\n- **Brightness**: Stems of crisp white cluster chrysanthemum blossoms.\n- **Soft Texture**: Premium pink carnations and clouds of fresh white baby's breath.\n- **Greenery**: Lush tropical palm leaves and seasonal foliage.\n- **Container**: Large premium square clear glass vase.\n\n**Suitable for**: Home decor centerpieces, corporate receptions, elegant housewarming gifts, or as a grand gesture for life's biggest milestones.",
      images: [uploadRes.secure_url],
      price: 1850,
      categoryId: category._id,
      tags: ["lilies", "white lilies", "pink lilies", "chrysanthemums", "vase arrangement", "luxury", "home decor", "flowers"],
      isActive: true,
      premiumWrapping: false
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
