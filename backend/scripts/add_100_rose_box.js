
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773230242345.jpg";

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
    const productName = "Royal Velvet 100 Red Rose Luxury Grand Box";
    let baseSlug = "royal-velvet-100-red-rose-luxury-grand-box";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "Witness the ultimate monument of love. This breathtaking grand arrangement features **100 selected premium red roses**, meticulously hand-placed into a luxurious, oversized rectangular matte black gift box. Finished with signature crimson red ribbons and a grand satin bow, this arrangement is designed for those once-in-a-lifetime moments that demand nothing less than perfection.\n\n**This Grand Product Consists of**:\n- **Ultimate Luxury**: 100 Selected premium long-stemmed red roses.\n- **Packaging**: Premium oversized matte black rectangular gift box.\n- **Finishing**: Dual-layered signature red satin ribbons and a grand central bow.\n\n**Suitable for**: Significant anniversaries, grand romantic proposals, luxury corporate gifting, or making a powerful, unforgettable statement of love.",
      images: [uploadRes.secure_url],
      price: 9500,
      categoryId: categoryBySlug._id,
      tags: ["red roses", "luxury box", "100 roses", "anniversary", "grand gesture", "romance", "premium", "big bunch"],
      isActive: true,
      premiumWrapping: false // The luxury box is the primary presentation
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
