
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

const productData = {
  imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773330892758.jpg",
  name: "Red & White Rose Eternal Romance Bouquet",
  slug: "red-white-rose-eternal-romance-bouquet",
  description: "A timeless and elegant symphony of love. This beautiful bouquet features a perfect blend of premium red and white roses, symbolizing passion and purity. Accented with delicate white baby's breath and expertly hand-wrapped in layered cream translucent paper. Finished with a charming dual-toned red and white bow. A classic choice for expressing deep affection.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, or as a gentle floral gesture to someone special.",
  price: 1599,
  categorySlug: "flowers",
  tags: ["red roses", "white roses", "romance", "gift", "anniversary", "classic bouquet", "babys breath", "eternal love"]
};

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

    console.log(`Processing: ${productData.name}...`);
    
    // 1. Upload to Cloudinary
    console.log(`Uploading ${productData.imagePath} to Cloudinary...`);
    const uploadRes = await cloudinary.v2.uploader.upload(productData.imagePath, {
      folder: "products",
    });
    console.log("Uploaded:", uploadRes.secure_url);

    // 2. Get category
    const category = await Category.findOne({ slug: productData.categorySlug });
    if (!category) {
        console.error(`Category '${productData.categorySlug}' not found.`);
        process.exit(1);
    }

    // 3. Create Product
    let slug = productData.slug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productData.name,
      slug: slug,
      description: productData.description,
      images: [uploadRes.secure_url],
      price: productData.price,
      categoryId: category._id,
      tags: productData.tags,
      isActive: true,
      premiumWrapping: false
    });

    const saved = await newProduct.save();
    console.log("Product saved successfully:", saved.name, "at Rs.", saved.price);

    console.log("Process completed.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
