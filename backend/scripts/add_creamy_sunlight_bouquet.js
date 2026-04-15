
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773217804357.jpg";

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
    const productName = "Creamy Sunlight Rose & Carnation Bouquet";
    let baseSlug = "creamy-sunlight-rose-carnation-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "Radiate warmth and elegance with our Creamy Sunlight Bouquet. This sophisticated arrangement **contains a lush density of pure white Carnations and delicate soft peach-toned Roses**, beautifully balanced with wisps of white Baby's Breath.\n\nProfessionally hand-wrapped in multiple layers of premium pale yellow parchment and finished with a shimmering cream satin bow. This bouquet is a masterpiece of subtle luxury.\n\n**Suitable for**: Formal celebrations, Wedding anniversaries, Thank-you gestures, or expressing high-end appreciation.",
      images: [uploadRes.secure_url],
      price: 1250,
      categoryId: category._id,
      tags: ["roses", "carnations", "peach", "white", "yellow", "bouquet", "gift", "premium", "elegant"],
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
