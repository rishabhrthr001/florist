
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331362927.jpg",
    name: "Ferrero Rocher & Red Rose Passionate Indulgence Bouquet",
    slug: "ferrero-rocher-red-rose-passionate-indulgence-bouquet",
    description: "A luxurious and high-impact gift that combines the timeless passion of premium red roses with the decadent crunch of golden Ferrero Rocher chocolates. Nestled within a delicate cloud of white baby's breath and expertly hand-wrapped in vibrant red floral paper with a matching satin bow. A perfect indulgence for a truly special someone.\n\n**Suitable for**: Significant Anniversaries, Romantic surprises, Birthdays, or when you want to make an unforgettable grand gesture.",
    price: 2199,
    categorySlug: "flowers",
    tags: ["red roses", "ferrero rocher", "chocolate bouquet", "luxury", "romance", "gift", "passionate", "anniversary", "premium"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331432860.jpg",
    name: "Ivory Lily & White Mum Serenity Bouquet",
    slug: "ivory-lily-white-mum-serenity-bouquet",
    description: "A serene and sophisticated arrangement featuring large, fragrant white Oriental lilies and fluffy white chrysanthemums. Accented with cheerful orange carnations and a delicate mist of white baby's breath. Expertly hand-wrapped in layered crisp white translucent paper and finished with a soft pink satin bow. A symbol of peace, purity, and elegant beauty.\n\n**Suitable for**: Get Well Soon, Sympathy, Birthdays, or as a graceful home decor accent.",
    price: 1899,
    categorySlug: "flowers",
    tags: ["white lilies", "white chrysanthemums", "orange carnations", "serenity", "purity", "gift", "graceful", "classic bouquet"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331508830.jpg",
    name: "Gilded Amethyst & Ivory Lily Grandeur Bouquet",
    slug: "gilded-amethyst-ivory-lily-grandeur-bouquet",
    description: "A magnificent and regal floral display. This grand bouquet features towering white Oriental lilies surrounded by a lush bed of deep burgundy chrysanthemums and vibrant purple statice. Uniquely hand-wrapped in high-quality cream paper and finished with a striking gold mesh/netting for an ultra-luxurious look. A truly grand and sophisticated floral masterpiece.\n\n**Suitable for**: Grand celebrations, Milestone Anniversaries, Luxury gifting, or as a spectacular centerpiece.",
    price: 2499,
    categorySlug: "flowers",
    tags: ["white lilies", "burgundy chrysanthemums", "purple statice", "gold mesh", "luxury", "grandeur", "gift", "regal", "premium flowers"]
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
