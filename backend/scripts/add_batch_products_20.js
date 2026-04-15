
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332138286.jpg",
    name: "Vibrant Garden Mixed Blossom Grandeur Bouquet",
    slug: "vibrant-garden-mixed-blossom-grandeur-bouquet",
    description: "A lively and voluminous celebration of nature's finest colors. This grand bouquet features a stunning mix of pristine white chrysanthemums, soft pink carnations, vibrant purple daisies/asters, and cheerful yellow chrysanthemums. Accented with a delicate mist of white baby's breath and expertly hand-wrapped in layered pink translucent paper with a matching pink satin bow. A perfect way to convey joy and admiration.\n\n**Suitable for**: Birthdays, Congratulations, Thank You gifts, or brightening someone's day with a grand floral gesture.",
    price: 1799,
    categorySlug: "flowers",
    tags: ["mixed flowers", "white chrysanthemums", "pink carnations", "purple daisies", "yellow chrysanthemums", "joyful", "grand", "gift", "birthday", "admiration"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332202518.jpg",
    name: "Passionate Ruby Rose Halo Bouquet",
    slug: "passionate-ruby-rose-halo-bouquet",
    description: "A striking and modern take on the classic symbol of love. This high-impact bouquet features a central core of premium red roses, beautifully framed by a delicate halo of white baby's breath. Expertly hand-wrapped in layered red translucent paper and finished with a voluminous red satin bow. A stunning choice for a romantic declaration or a significant anniversary.\n\n**Suitable for**: Romantic surprises, Anniversaries, Valentine's Day, or when you want to make a bold romantic statement.",
    price: 1599,
    categorySlug: "flowers",
    tags: ["red roses", "modern rose bouquet", "romance", "gift", "anniversary", "halo bouquet", "babys breath", "passionate"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332279096.jpg",
    name: "Midnight Ivory Hydrangea Grandeur",
    slug: "midnight-ivory-hydrangea-grandeur",
    description: "A statement of pure sophistication and modern luxury. This magnificent bouquet features oversized, lush ivory-white hydrangeas, symbolizing grace and heartfelt emotion. Accented with a sculptural arrangement of white baby's breath and dramatically hand-wrapped in high-quality matte black designer paper with elegant gold borders. Finished with a delicate silver ribbon. A truly striking and upscale floral masterpiece.\n\n**Suitable for**: Black-tie events, Luxury corporate gifting, Grand anniversaries, or making an unforgettable impression.",
    price: 2499,
    categorySlug: "flowers",
    tags: ["white hydrangea", "luxury", "black and gold", "modern", "grace", "gift", "premium flowers", "designer wrap", "hydrangea"]
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
