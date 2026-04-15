
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315598077.jpg",
    name: "Blushing Peach Carnation Cloud Bouquet",
    slug: "blushing-peach-carnation-cloud",
    description: "A soft and voluminous bouquet featuring a dense cluster of premium peach-tinted carnations. Expertly wrapped in layered pink translucent paper and tied with a matching pink bow. A perfect expression of gentle affection and grace.\n\n**Suitable for**: Mother's Day, Birthdays, Appreciation, or as a sweet surprise for a loved one.",
    price: 1399,
    categorySlug: "flowers",
    tags: ["peach carnations", "pink wrapping", "soft aesthetic", "gift", "anniversary", "birthday", "gentle bloom"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315659358.jpg",
    name: "Royal Amethyst Dendrobium Orchid Symphony",
    slug: "royal-amethyst-dendrobium-orchid-symphony",
    description: "A striking and exotic arrangement of vibrant purple Dendrobium orchids, standing tall in their natural grace. Wrapped in high-impact purple translucent paper and finished with a royal blue star bow. This arrangement brings a touch of tropical luxury to any occasion.\n\n**Suitable for**: Congratulations, Corporate Gifting, Luxury surprises, or as a bold statement piece.",
    price: 1899,
    categorySlug: "flowers",
    tags: ["purple orchids", "dendrobium", "exotic", "royal purple", "luxury bouquet", "gift", "vibrant", "orchids"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315741382.jpg",
    name: "Cuddly Crimson Joy Teddy & Chocolate Bouquet",
    slug: "cuddly-crimson-joy-teddy-chocolate-bouquet",
    description: "The ultimate celebration of sweetness and affection. This delightful kit includes a soft red plush teddy bear nestled among vibrant yellow lilies and red carnations, surrounded by premium Cadbury Dairy Milk chocolate bars. Expertly hand-wrapped in cream paper with a grand red satin bow. It's a complete gift experience in one beautiful bouquet.\n\n**Includes**: Plush Red Teddy Bear, 5x Cadbury Dairy Milk Bars, Yellow Lilies, Red Carnations, and Premium Wrapping.",
    price: 2199,
    categorySlug: "birthday",
    tags: ["teddy bear", "chocolates", "dairy milk", "gift combo", "yellow lilies", "kids gift", "birthday bouquet", "red teddy"]
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
        premiumWrapping: p.categorySlug === "birthday" || p.price > 2000
      });

      const saved = await newProduct.save();
      console.log("Product saved successfully:", saved.name, "at Rs.", saved.price);
    }

    console.log("All products processed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
