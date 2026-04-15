
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331260966.jpg",
    name: "KitKat & Ferrero Rocher Sweet Romance Chocolate Bouquet",
    slug: "kitkat-ferrero-rocher-sweet-romance-chocolate-bouquet",
    description: "A delightful and indulgent treat combining the crisp crunch of KitKat bars and the luxury of Ferrero Rocher chocolates. These sweet favorites are nestled in a delicate cloud of white baby's breath, expertly hand-wrapped in vibrant red paper and finished with a matching red satin bow. A perfect gift for the sweet-toothed romantic.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, Valentine's Day, or just because.",
    price: 1499,
    categorySlug: "flowers", // Often categorized under gifting/anniversary
    tags: ["chocolate bouquet", "kitkat", "ferrero rocher", "gift", "romance", "birthday", "anniversary", "sweet treat"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331296508.jpg",
    name: "Ethereal Amethyst Baby's Breath Cloud Bouquet",
    slug: "ethereal-amethyst-babys-breath-cloud-bouquet",
    description: "A stunning and airy floral floating arrangement. This voluminous bouquet features a grand cloud of white baby's breath, beautifully punctuated with clusters of deep purple statice flowers. Hand-wrapped in high-quality white designer paper with a sophisticated grey-black border and finished with a luxurious grey satin bow. A sophisticated choice for modern elegance.\n\n**Suitable for**: Luxury home decor, Anniversaries, Congratulations, or as a unique romantic surprise.",
    price: 1699,
    categorySlug: "flowers",
    tags: ["babys breath", "purple statice", "ethereal", "modern bouquet", "gift", "premium flowers", "grey ribbon", "designer wrap"]
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
