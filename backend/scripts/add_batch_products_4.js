
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315830470.jpg",
    name: "Amethyst Empress & Orchid Whisper Bouquet",
    slug: "amethyst-empress-orchid-whisper-bouquet",
    description: "A regal and enchanting bouquet that blends the deep mystery of purple roses with the delicate elegance of white roses and bi-color purple-fringed carnations. Expertly hand-wrapped in soft pink translucent paper and finished with a grand white satin bow and a decorative floral message card. A true choice for someone special.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, or expressing deep admiration.",
    price: 1999,
    categorySlug: "flowers",
    tags: ["purple roses", "white roses", "carnations", "pink wrapping", "luxury", "gift", "anniversary", "birthday", "majestic"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773315890338.jpg",
    name: "Burgundy Velvet & Baby's Breath Vase Symphony",
    slug: "burgundy-velvet-babys-breath-vase-symphony",
    description: "A rich and dramatic arrangement featuring deep burgundy chrysanthemums clustered in a dense, velvet-like display. Accented with a generous cloud of white baby's breath, it is uniquely presented in an elegant tall amber-toned ribbed glass vase. A sophisticated statement of style.\n\n**Suitable for**: Home decor, Corporate gifting, Thinking of you, or as a centerpiece for evening gatherings.",
    price: 1699,
    categorySlug: "flowers",
    tags: ["burgundy flowers", "chrysanthemums", "amber vase", "babys breath", "sophisticated", "home decor", "gift", "rich colors"]
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
        premiumWrapping: p.price > 1800
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
