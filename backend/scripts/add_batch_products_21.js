
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332871062.jpg",
    name: "Sun-Kissed Radiance Sunflowers & Yellow Roses Vase",
    slug: "sun-kissed-radiance-sunflowers-yellow-roses-vase",
    description: "A bright and cheerful arrangement featuring a stunning sunflower as the centerpiece, surrounded by nearly a dozen sun-kissed yellow roses and elegant white lilies. Nestled in a bed of delicate baby's breath and presented in a modern glass cylinder vase. A perfect choice to radiate joy and positivity.\n\n**Suitable for**: Birthdays, Thank You gifts, Friendship surprises, or as a cheerful home decor accent.",
    price: 1999,
    categorySlug: "flowers",
    tags: ["sunflower", "yellow roses", "white lilies", "vase arrangement", "cheer", "friendship", "radiance"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332925421.jpg",
    name: "Milestone 40th Birthday Grand Floral Box",
    slug: "milestone-40th-birthday-grand-floral-box",
    description: "Celebrate a spectacular 40th milestone with this grand floral box. Featuring two large silver '40' balloons rising from a lush garden of bright yellow lilies, deep red carnations, purple chrysanthemums, and vibrant greenery. Neatly presented in a premium sage green designer box with gold accents. A truly memorable gift for a special day.\n\n**Suitable for**: 40th Birthday celebrations, Milestone achievements, or as a grand surprise gift.",
    price: 3499,
    categorySlug: "flowers",
    tags: ["40th birthday", "milestone", "yellow lilies", "mixed flowers", "balloons", "silver balloons", "birthday gift", "premium box"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773332986813.jpg",
    name: "Eternal Love Pink Heart Floral Wreath",
    slug: "eternal-love-pink-heart-floral-wreath",
    description: "A profound expression of love and devotion. This large, heart-shaped floral arrangement is meticulously crafted with a stunning ombre of pink roses, vibrant magenta carnations, and soft purple chrysanthemums. Accented with delicate white wax flowers. A beautiful and symbolic piece for anniversaries, romantic surprises, or as a heartfelt tribute.\n\n**Suitable for**: Significant Anniversaries, Romantic surprises, Heartfelt tributes, or Valentine's Day.",
    price: 3999,
    categorySlug: "flowers",
    tags: ["heart shape", "pink roses", "carnations", "romance", "anniversary", "tribute", "pink wreath", "heart floral"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773333032967.jpg",
    name: "Imperial White Rose Grandeur (100 Roses)",
    slug: "imperial-white-rose-grandeur-100-roses",
    description: "The ultimate statement of purity and grace. This spectacular bouquet consists of 100 premium long-stemmed white roses, creating a dense and majestic cloud of white blossoms. Accented with a delicate outer halo of baby's breath and expertly hand-wrapped in layered white designer paper with striking gold-foil borders. Finished with a luxurious white and silver satin ribbon. For when only the most extraordinary gesture will do.\n\n**Suitable for**: Grand Romantic Proposals, Weddings, Milestone Anniversaries, or as an unforgettable grand gesture.",
    price: 5999,
    categorySlug: "flowers",
    tags: ["white roses", "100 roses", "luxury", "purity", "wedding", "grand gesture", "premium wrap", "imperial"]
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
