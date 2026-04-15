
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773226325426.jpg";

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
    const productName = "Golden Rays Sunflower & Daisy Bouquet";
    let baseSlug = "golden-rays-sunflower-daisy-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "Capture the essence of a sun-drenched field with our Golden Rays Bouquet. This vibrant arrangement showcases massive, premium sunflowers as the stars of the show, perfectly complemented by a cheerful cluster of sunny yellow daisy chrysanthemums.\n\nHand-wrapped in elegant ivory-cream parchment and finished with a shimmering gold satin ribbon. It's a guaranteed way to bring a smile to anyone's face.\n\n**This Product Consists of**:\n- **Premium Flowers**: 3-4 Large premium sunflowers.\n- **Accents**: Fresh yellow daisy chrysanthemums.\n- **Fillers**: Delicate white wax flowers and assorted greenery.\n- **Wrapping**: Premium ivory-cream parchment paper.\n- **Finishing**: Elegant gold satin ribbon bow.\n\n**Suitable for**: Birthdays, graduation celebrations, well-wishes, or simply to brighten someone's day with golden sunshine.",
      images: [uploadRes.secure_url],
      price: 1350,
      categoryId: category._id,
      tags: ["sunflowers", "yellow", "daisies", "cheerful", "birthday", "celebration", "bouquet", "golden"],
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
