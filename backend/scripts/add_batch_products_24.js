
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773337622389.jpg",
    name: "Classic Crimson Rose & Tuberose Symphony",
    slug: "classic-crimson-rose-tuberose-symphony",
    description: "A timeless and aromatic blend of premium red roses and fragrant white tuberoses (Rajnigandha). This bouquet combines the deep passion of scarlet roses with the sweet, lingering scent of fresh tuberose blooms. Expertly hand-wrapped in layered cream translucent paper and finished with a voluminous pink and white decorative ribbon. A perfect choice for traditional celebrations or romantic evenings.\n\n**Suitable for**: Anniversaries, Romantic surprises, Home decor, or Traditional occasions where fragrance and beauty are key.",
    price: 1499,
    categorySlug: "flowers",
    tags: ["red roses", "tuberose", "rajnigandha", "fragrant", "classic", "anniversary", "traditional", "aromatic"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773337742212.jpg",
    name: "Golden Sun & Orange Lily Garden Vase",
    slug: "golden-sun-orange-lily-garden-vase",
    description: "A vibrant and joyful celebration of sunshine and warmth. This stunning vase arrangement features bright sunflowers, elegant orange Asiatic lilies, and pristine white carnations, accented with fresh green button chrysanthemums and a mist of baby's breath. Presented in a clear glass cylinder vase, this arrangement brings a burst of energy and happiness to any space.\n\n**Suitable for**: Birthdays, Get Well Soon, Congratulations, or brightening up a workspace or home.",
    price: 1899,
    categorySlug: "flowers",
    tags: ["sunflowers", "orange lilies", "white carnations", "vase arrangement", "vibrant", "joyful", "birthday", "get well soon"]
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
