
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773225339082.jpg";

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
    const productName = "Magenta & Lime Zest Chrysanthemum Bouquet";
    let baseSlug = "magenta-lime-zest-chrysanthemum-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A high-contrast, energetic arrangement that brings a burst of modernity to traditional floristry. This bouquet features a dense mix of velvety deep magenta daisies and vibrant lime-green button chrysanthemums, beautifully set against soft cream parchment.\n\n**This Product Consists of**:\n- **Premium Flowers**: Deep magenta/burgundy daisy chrysanthemums.\n- **Bold Accents**: Fresh lime-green button chrysanthemums (Poms).\n- **Delicate Fillers**: White wax flower or baby's breath accents.\n- **Packaging**: Premium ivory-cream textured parchment wrapping.\n- **Finishing**: Lustrous bright pink multi-layered satin ribbon bow.\n\n**Suitable for**: Cheering someone up, office anniversary gifts, birthdays, or as a modern floral statement piece.",
      images: [uploadRes.secure_url],
      price: 1150,
      categoryId: category._id,
      tags: ["chrysanthemums", "magenta", "green", "contrast", "vibrant", "bouquet", "gift"],
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
