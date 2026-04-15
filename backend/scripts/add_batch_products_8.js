
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319113553.jpg",
    name: "Blushing Meadow Mixed Floral Extravaganza",
    slug: "blushing-meadow-mixed-floral-extravaganza",
    description: "A lush and voluminous celebration of nature's finest. This spectacular arrangement features a dense tapestry of premium pink and white lilies, vibrant burgundy and soft pink chrysanthemums, and delicate purple filler flowers. Accented with a generous cloud of white baby's breath, it's a grand bouquet that makes any occasion feel monumental.\n\n**Suitable for**: Mother's Day, Birthdays, Anniversaries, or as a breathtaking centerpiece for special events.",
    price: 2899,
    categorySlug: "flowers",
    tags: ["mixed flowers", "pink lilies", "white lilies", "chrysanthemums", "vibrant", "grand bouquet", "gift", "babys breath", "luxury"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319229771.jpg",
    name: "Blush Pink Hydrangea Heritage Vase",
    slug: "blush-pink-hydrangea-heritage-vase",
    description: "Elegance in its purest form. A magnificent cluster of premium blush pink hydrangeas, known for their lush, voluminous petals and cloud-like appearance. Meticulously presented in a tall, sophisticated designer glass vase with a silver-toned base. A statement piece that brings a touch of high-end floral artistry to any room.\n\n**Suitable for**: Luxury home decor, Corporate gifting, Thinking of you, or as a sophisticated romantic gesture.",
    price: 3299,
    categorySlug: "flowers",
    tags: ["pink hydrangeas", "hydrangea vase", "luxury decor", "elegant", "sophisticated", "gift", "premium flowers", "vase arrangement"]
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
        premiumWrapping: p.price > 2500
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
