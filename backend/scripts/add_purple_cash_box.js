
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773226863286.jpg";

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
    const productName = "Purple Majesty Birthday Cash Box";
    let baseSlug = "purple-majesty-birthday-cash-box";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A show-stopping birthday gift that combines elegance with a generous gesture. This luxurious circular gift box in deep lavender is overflowing with a 'cloud' of soft pink baby's breath, cradling a stunning arrangement of ₹100 notes. Crowned with a shimmering rose gold heart-shaped foil balloon and a purple 'Happy Birthday' topper, it's the ultimate celebratory surprise.\n\n**This Premium Gift Consists of**:\n- **The Main Gesture**: 25-30 Freshly crisp ₹100 notes expertly arranged.\n- **Floral Base**: A dense, airy cloud of preserved or fresh pink baby's breath.\n- **Celebration Accents**: 1 Rose gold heart foil balloon and a 'Happy Birthday' acrylic topper.\n- **Packaging**: A premium circular velvet-finish gift box in deep royal purple.\n- **Finishing**: Hand-tied with a coordinated purple satin ribbon.\n\n**Suitable for**: Grand birthday surprises, milestone celebrations, or as a uniquely practical yet beautiful gift for loved ones who deserve the best.",
      images: [uploadRes.secure_url],
      price: 5500,
      categoryId: category._id,
      tags: ["cash box", "money bouquet", "birthday", "gift set", "₹100 notes", "pink flowers", "balloon", "luxury"],
      isActive: true,
      premiumWrapping: false // Box is the primary feature
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
