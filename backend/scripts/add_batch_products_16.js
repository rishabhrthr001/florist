
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331758734.jpg",
    name: "Azure Meadow & Indigo Blossom Symphony",
    slug: "azure-meadow-indigo-blossom-symphony",
    description: "A serene and textural arrangement featuring a stunning mix of pristine white Oriental lilies and deep indigo-purple roses. Accented with creamy white hydrangeas and a delicate mist of baby's breath. Expertly hand-wrapped in layered sky-blue paper and finished with a rustic jute twine tie. A symbol of tranquility and sophisticated beauty. Perfect for birthdays, thank you gifts, or home decor.\n\n**Suitable for**: Birthdays, Thank You gifts, Get Well Soon, or as a graceful home decor accent.",
    price: 1899,
    categorySlug: "flowers",
    tags: ["white lilies", "purple roses", "indigo", "hydrangea", "serenity", "blue wrapping", "gift", "classic bouquet"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331835091.jpg",
    name: "Pastel Lily Grandeur Bouquet",
    slug: "pastel-lily-grandeur-bouquet",
    description: "A grand and fragrant floral masterpiece. This lush bouquet features a stunning mix of pristine white and soft pink Oriental lilies, representing purity and prosperity. Accented with delicate white baby's breath and expertly hand-wrapped in layered pink designer paper with a voluminous pink satin bow. A sophisticated choice for grand celebrations and milestone events.\n\n**Suitable for**: Grand celebrations, Milestone Anniversaries, Luxury gifting, or as a spectacular romantic surprise.",
    price: 2599,
    categorySlug: "flowers",
    tags: ["pink lilies", "white lilies", "fragrant", "grand", "gift", "anniversary", "celebration", "pink wrapping", "premium"]
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
