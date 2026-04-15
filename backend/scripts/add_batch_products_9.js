
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315454481.jpg",
    name: "Siya Personalized Pink Balloon Celebration Hamper",
    slug: "siya-personalized-pink-balloon-celebration-hamper",
    description: "A delightful and deeply personal celebration in a basket. This curated hamper features a rustic hand-woven basket filled with gourmet treats and spa-style gifts, crowned with a cluster of vibrant pink balloons. A custom pink 'SIYA' bunting adds a unique, heart-warming touch to this perfect gift for her.\n\n**Includes**: Personalized 'SIYA' Bunting, Pink Balloon Cluster, Gourmet Treats, Spa Essentials, and a Premium Rustic Basket.",
    price: 2499,
    categorySlug: "birthday",
    tags: ["personalized gift", "siya", "pink balloons", "gift hamper", "celebration basket", "for her", "birthday gift", "custom name"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315343227.jpg",
    name: "Azure Mist & Ivory Lily Serenity Bouquet",
    slug: "azure-mist-ivory-lily-serenity-bouquet",
    description: "A cool and calming symphony of light blue-tinted Oriental lilies and pristine white lily buds. Expertly hand-wrapped in layered sky-blue translucent paper and finished with a matching blue satin bow. This arrangement evokes a sense of tranquil elegance and serene beauty.\n\n**Suitable for**: Anniversaries, Congratulations, Get Well Soon, or as a sophisticated floral gesture.",
    price: 1999,
    categorySlug: "flowers",
    tags: ["blue lilies", "white lilies", "azure mist", "serenity", "blue wrapping", "elegant bouquet", "gift", "anniversary", "sky blue"]
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
