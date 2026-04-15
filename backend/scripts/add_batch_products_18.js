
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

const productsData = [
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332004088.jpg",
    name: "Crimson Elegance Rose Bouquet",
    slug: "crimson-elegance-rose-bouquet",
    description: "A sophisticated and classic arrangement of premium red roses. This bouquet features high-quality roses nestled in a bed of lush green palm leaves and a delicate cloud of white baby's breath. Expertly hand-wrapped in layered white translucent paper and finished with a voluminous pink satin bow. A perfect symbol of grace and timeless affection.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, or expressing deep admiration.",
    price: 1899,
    categorySlug: "flowers",
    tags: ["red roses", "classic", "romance", "gift", "anniversary", "elegant", "babys breath", "palm leaves"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332072007.jpg",
    name: "Pink & Magenta Carnation Radiance Bouquet",
    slug: "pink-magenta-carnation-radiance-bouquet",
    description: "A vibrant and joyful celebration of color. This stunning bouquet features a beautiful mix of bi-color pink-and-white carnations and deep magenta-purple carnations. Expertly hand-wrapped in layered cream designer paper and finished with a crisp white satin bow. A symbol of admiration, joy, and cheerful energy.\n\n**Suitable for**: Birthdays, Thank You gifts, Mother's Day, or brightening someone's day with a burst of color.",
    price: 1599,
    categorySlug: "flowers",
    tags: ["pink carnations", "magenta carnations", "joyful", "vibrant", "gift", "birthday", "admiration", "cheerful"]
  }
];

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

    for (const p of productsData) {
      console.log(`Processing: ${p.name}...`);
      
      // 1. Upload to Cloudinary
      console.log(`Uploading ${p.imagePath} to Cloudinary...`);
      const uploadRes = await cloudinary.v2.uploader.upload(p.imagePath, {
        folder: "products",
      });
      console.log("Uploaded:", uploadRes.secure_url);

      // 2. Get category
      const category = await Category.findOne({ slug: p.categorySlug });
      if (!category) {
          console.warn(`Category '${p.categorySlug}' not found, skipping ${p.name}`);
          continue;
      }

      // 3. Create Product
      let slug = p.slug;
      const existing = await Product.findOne({ slug });
      if (existing) {
          slug += "-" + Math.floor(Math.random() * 1000);
      }
      
      const newProduct = new Product({
        name: p.name,
        slug: slug,
        description: p.description,
        images: [uploadRes.secure_url],
        price: p.price,
        categoryId: category._id,
        tags: p.tags,
        isActive: true,
        premiumWrapping: p.price > 2000
      });

      const saved = await newProduct.save();
      console.log("Product saved successfully:", saved.name, "at Rs.", saved.price);
    }

    console.log("Batch processed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
