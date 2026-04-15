
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773318860741.jpg",
    name: "Serene Azure & Ivory Lily Symphony",
    slug: "serene-azure-ivory-lily-symphony",
    description: "A tranquil and sophisticated arrangement featuring premium white lilies, blue-tinted carnations, and tall stems of white matthiola. Accented with lush baby's breath and greenery, it is expertly hand-wrapped in a luxurious deep navy blue paper with a delicate twine finish. A cool and calming choice for elegant gifting.\n\n**Suitable for**: Congratulations, Get Well Soon, Sympathy, or to bring a sense of peace to any space.",
    price: 2199,
    categorySlug: "flowers",
    tags: ["blue carnations", "white lilies", "navy wrapping", "serene", "elegant bouquet", "gift", "calming", "matthiola"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773318952216.jpg",
    name: "Blushing Rose & Carnation Romance",
    slug: "blushing-rose-carnation-romance",
    description: "A vibrant and joyful blend of premium red roses and soft pink carnations. Accented with delicate white baby's breath and expertly hand-wrapped in soft pink translucent paper with a matching pink satin bow. A perfect expression of youthful love and admiration.\n\n**Suitable for**: Anniversaries, Romantic surprises, Birthdays, or as a sweet floral gesture.",
    price: 1399,
    categorySlug: "flowers",
    tags: ["red roses", "pink carnations", "pink wrapping", "youthful romance", "gift", "anniversary", "birthday", "sweet"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319018750.jpg",
    name: "Midnight Amethyst Bi-Color Rose Grandeur",
    slug: "midnight-amethyst-bi-color-rose-grandeur",
    description: "A striking and high-impact bouquet featuring a cluster of premium bi-color pink and white roses. Magnificently presented in dramatic black textured paper wrapping and finished with a soft pink satin bow. A bold and sophisticated statement of style.\n\n**Suitable for**: High-fashion gifting, Anniversaries, Romantic surprises, or as a dramatic centerpiece.",
    price: 1799,
    categorySlug: "flowers",
    tags: ["bi-color roses", "pink roses", "black wrapping", "sophisticated", "luxury bouquet", "gift", "dramatic", "modern"]
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
