
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331903023.jpg",
    name: "Blushing Peach Carnation Cloud Bouquet",
    slug: "blushing-peach-carnation-cloud-bouquet",
    description: "A breathtaking and voluminous cloud of soft peach carnations. This lush bouquet features dozens of premium carnations, symbolizing admiration and pure love, accented with delicate white baby's breath. Expertly hand-wrapped in layered soft pink translucent paper and finished with a matching pink satin bow. A symbol of grace and gentle affection.\n\n**Suitable for**: Mother's Day, Birthdays, Thank You gifts, or a thoughtful surprise for someone who loves soft pastel tones.",
    price: 1799,
    categorySlug: "flowers",
    tags: ["peach carnations", "pink carnations", "soft", "graceful", "gift", "birthday", "admiration", "pastel"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773331956915.jpg",
    name: "Lavender Dream Rose Symphony",
    slug: "lavender-dream-rose-symphony",
    description: "An ethereal and enchanting floral arrangement. This stunning bouquet features a dozen premium lavender-purple roses, symbolizing mystery and enchantment, beautifully punctuated with a delicate mist of white baby's breath. Expertly hand-wrapped in layered pink translucent paper and finished with a vibrant magenta satin bow. A truly unique and sophisticated floral masterpiece.\n\n**Suitable for**: Romantic surprises, Anniversaries, Birthdays, or expressing enchantment and unique affection.",
    price: 1699,
    categorySlug: "flowers",
    tags: ["lavender roses", "purple roses", "enchantment", "mystery", "gift", "romance", "unique", "sophisticated"]
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
