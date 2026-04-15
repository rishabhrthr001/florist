
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319316414.jpg",
    name: "Sun-Kissed Yellow Tulip Kraft Bouquet",
    slug: "sun-kissed-yellow-tulip-kraft-bouquet",
    description: "Elegant and minimalist. A cluster of premium sun-yellow tulips, known for their grace and simplicity. Expertly wrapped in thick brown kraft paper with a white paper liner and finished with a delicate white and yellow twine bow. A perfect choice for those who love understated luxury.\n\n**Suitable for**: Spring greetings, Appreciation, Congratulations, or as a chic floral accent.",
    price: 1499,
    categorySlug: "flowers",
    tags: ["yellow tulips", "kraft paper", "minimalist", "spring flowers", "gift", "elegant", "understated"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319352383.jpg",
    name: "Golden Radiance Sunflower & Daisy Symphony",
    slug: "golden-radiance-sunflower-daisy-symphony",
    description: "A burst of pure happiness. This vibrant bouquet features large, bold sunflowers surrounded by a dense cluster of cheerful yellow daisies and white filler flowers. Hand-wrapped in premium cream paper and finished with a voluminous orange satin bow. A radiant expression of joy.\n\n**Suitable for**: Birthdays, Thinking of you, Get Well Soon, or to bring sunshine into any home.",
    price: 1799,
    categorySlug: "flowers",
    tags: ["sunflowers", "yellow daisies", "vibrant", "cheerful", "gift", "birthday", "sunshine", "orange bow"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319467917.jpg",
    name: "Royal Golden Harvest Exotic Fruit & Rose Platter",
    slug: "royal-golden-harvest-exotic-fruit-rose-platter",
    description: "A monumental display of health and beauty. This grand gift features a large, gold-toned stand overflowing with premium exotic fruits—including lush grapes, pears, mangoes, and apples. The platter is crowned with a cluster of velvety red and white roses and veiled in a sophisticated fine white net. A truly elite gift for grand celebrations.\n\n**Suitable for**: Wedding gifts, Housewarming, Corporate gifting, or as an impressive centerpiece.",
    price: 6499,
    categorySlug: "anniversary",
    tags: ["fruit platter", "exotic fruits", "red roses", "white roses", "gold platter", "luxury gift", "grand gesture", "corporate gift", "healthy gift"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319553852.jpg",
    name: "Midnight Amethyst Lily & Purple Glow Bouquet",
    slug: "midnight-amethyst-lily-purple-glow-bouquet",
    description: "A deep and soulful floral masterpiece. Pristine white Oriental lilies are nestled among rich burgundy-purple chrysanthemums and delicate blue static flowers. This arrangement is magnificently hand-wrapped in soft cream paper and finished with a unique gold-flecked mesh ribbon. A regal and sophisticated choice.\n\n**Suitable for**: Milestone anniversaries, Elegant birthdays, or as a sophisticated romantic surprise.",
    price: 2399,
    categorySlug: "flowers",
    tags: ["white lilies", "purple chrysanthemums", "regal", "sophisticated bouquet", "gift", "anniversary", "gold mesh", "soulful"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773319606412.jpg",
    name: "Galaxy Gourmet & Glamour Gift Bouquet",
    slug: "galaxy-gourmet-glamour-gift-bouquet",
    description: "The ultimate 'everything' bouquet. This high-impact gift combines a variety of treats and essentials, including premium Galaxy, Fuse, and Perk chocolates, alongside high-quality Skincare (Garnier) and cosmetic items. Expertly hand-wrapped in soft cream paper and finished with a voluminous pink satin bow. A playful and impressive gift that covers all the bases.\n\n**Suitable for**: Birthdays, Graduation, Pampering gifts, or a unique surprise for her.",
    price: 3499,
    categorySlug: "birthday",
    tags: ["gift bouquet", "chocolate bouquet", "skincare gift", "garnier", "galaxy chocolates", "for her", "pampering", "unique gift", "birthday"]
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
