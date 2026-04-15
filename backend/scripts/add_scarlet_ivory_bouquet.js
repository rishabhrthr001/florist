
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773229946905.jpg";

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
    const productName = "Scarlet & Ivory Lily Harmony Bouquet";
    let baseSlug = "scarlet-ivory-lily-harmony-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A classic and striking arrangement that balances the purity of white lilies with the passionate energy of red carnations. This elegant bouquet is accented with cheerful white cluster chrysanthemums, creating a timeless symphony of colors. Hand-wrapped in translucent cream parchment and finished with a voluminous pink and white multi-layered ribbon bow.\n\n**This Product Consists of**:\n- **Main Flowers**: 3-4 Large premium white Oriental lilies.\n- **Bold Accents**: 5-6 Radiant red carnations.\n- **Cheerful Fillers**: Fresh white cluster daisy chrysanthemums.\n- **Packaging**: Premium translucent cream/light yellow parchment wrapping.\n- **Finishing**: Pink and white multi-layered luxury ribbon bow with a gift card.\n\n**Suitable for**: Birthdays, anniversaries, graduations, or expressing love and pride with a classic touch.",
      images: [uploadRes.secure_url],
      price: 1250,
      categoryId: category._id,
      tags: ["lily", "red carnation", "white lily", "red and white", "classic", "bouquet", "celebration"],
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
