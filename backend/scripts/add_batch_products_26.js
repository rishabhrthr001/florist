
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773338042441.jpg",
    name: "Royal Amethyst & Azure Mist Garden Vase",
    slug: "royal-amethyst-azure-mist-garden-vase",
    description: "A majestic and unique vertical arrangement that captures the essence of a tranquil garden. Featuring vibrant purple lisianthus and roses, accented with striking azure-blue baby's breath and fresh green button chrysanthemums. This sophisticated piece is presented in a clear glass cylinder vase against a clean marble-style backdrop. A perfect statement piece for modern interiors or high-end gifting.\n\n**Suitable for**: Corporate gifts, Housewarming, Birthday surprises, or as a sophisticated home accent.",
    price: 2299,
    categorySlug: "flowers",
    tags: ["purple lisianthus", "blue babys breath", "green chrysanthemums", "vase arrangement", "modern", "luxury", "vibrant", "statement piece"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773338093786.jpg",
    name: "Tri-Color Celebration Mixed Rose Bouquet",
    slug: "tri-color-celebration-mixed-rose-bouquet",
    description: "A joyful and festive celebration in a bouquet. This arrangement features a vibrant mix of premium scarlet red, sunny yellow, and pristine white roses, surrounded by a delicate cloud of white baby's breath. Strikingly hand-wrapped in bold red crepe paper and finished with a luxurious gold satin ribbon. A versatile and high-energy gift for any happy occasion.\n\n**Suitable for**: Birthdays, Congratulations, New Jobs, or simply to celebrate a special moment.",
    price: 1499,
    categorySlug: "flowers",
    tags: ["mixed roses", "red roses", "yellow roses", "white roses", "celebration", "festive", "gift bouquet", "vibrant"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773338206686.jpg",
    name: "Blushing Magenta Carnation Cloud",
    slug: "blushing-magenta-carnation-cloud",
    description: "A soft and voluminous cloud of exquisite carnations. This bouquet features a stunning combination of pink-and-white picotee carnations alongside deep magenta blooms, creating a beautiful gradient of pink tones. Elegantly hand-wrapped in cream-colored designer paper and finished with a large, pristine white satin bow. A truly graceful and feminine gift.\n\n**Suitable for**: Mother's Day, Thank You gifts, Thinking of You, or Anniversary surprises.",
    price: 1199,
    categorySlug: "flowers",
    tags: ["pink carnations", "magenta carnations", "picotee carnations", "soft", "feminine", "elegant", "appreciation", "cloud bouquet"]
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
