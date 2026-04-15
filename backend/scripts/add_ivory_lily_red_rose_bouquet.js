
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
  imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773330648275.jpg",
  name: "Ivory Lily & Crimson Rose Elegance Bouquet",
  slug: "ivory-lily-crimson-rose-elegance-bouquet",
  description: "A breathtaking and sophisticated blend of purity and passion. This stunning bouquet features large, fragrant white Oriental lilies and premium deep red roses, beautifully balanced with a delicate cloud of white baby's breath. Expertly hand-wrapped in layered cream translucent paper and finished with a voluminous red satin bow. A truly timeless choice for special moments.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, Graduations, or as a grand floral gesture.",
  price: 2499,
  categorySlug: "flowers",
  tags: ["white lilies", "red roses", "elegance", "romance", "premium", "gift", "anniversary", "birthday", "classic bouquet"]
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
      premiumWrapping: true
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
