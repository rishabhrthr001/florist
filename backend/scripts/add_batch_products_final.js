
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
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773260887285.jpg",
    name: "Ivory Lily & Ruby Carnation Glow Bouquet",
    slug: "ivory-lily-ruby-carnation-glow-bouquet",
    description: "A bright and elegant arrangement featuring pristine white Oriental lilies and vibrant ruby-red carnations. Accented with lush baby's breath and greenery, it is expertly hand-wrapped in layered cream paper and finished with a grand pink and white ribbon bow. A choice that radiates warmth and grace.\n\n**Suitable for**: Anniversaries, Birthdays, Festive Gifting, or as a graceful floral surprise.",
    price: 1699,
    categorySlug: "flowers",
    tags: ["white lilies", "red carnations", "cream wrapping", "pink bow", "vibrant", "gift", "anniversary", "birthday"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773262042885.jpg",
    name: "Blushing Peach Lily & Ivory Mum Symphony",
    slug: "blushing-peach-lily-ivory-mum-symphony",
    description: "A soft and harmonious blend of premium peach-tinted lilies, large white chrysanthemums, and bi-color pink and white carnations. Expertly hand-wrapped in layered peach and pink translucent paper and finished with a matching pink satin bow. This bouquet is a masterpiece of gentle beauty.\n\n**Suitable for**: Mother's Day, Romantic surprises, Appreciation, or as a sophisticated floral gift.",
    price: 2199,
    categorySlug: "flowers",
    tags: ["peach lilies", "white mums", "bi-color carnations", "peach wrapping", "soft aesthetic", "gift", "anniversary", "luxury"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773311360487.jpg",
    name: "Magenta Mist & Golden Mum Meadow Symphony",
    slug: "magenta-mist-golden-mum-meadow-symphony",
    description: "A vibrant and textural meadow arrangement featuring bold magenta Oriental lilies, sunny yellow-heart chrysanthemums, and clusters of purple static flowers. Expertly hand-wrapped in soft pink translucent paper and finished with a voluminous pink satin bow. A grand and colorful celebration of nature.\n\n**Suitable for**: Celebrations, Birthdays, Congratulations, or to brighten anyone's day.",
    price: 2299,
    categorySlug: "flowers",
    tags: ["magenta lilies", "yellow mums", "purple static", "pink wrapping", "vibrant meadow", "gift", "celebration", "birthday"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773312462526.jpg",
    name: "Rustic Amethyst Lily & Daisy Charm Bouquet",
    slug: "rustic-amethyst-lily-daisy-charm-bouquet",
    description: "A stunning and organic arrangement that blends the luxury of pink Oriental lilies with the playful charm of purple daisies. Uniquely hand-wrapped in high-quality kraft brown paper and finished with a golden mesh ribbon bow. A perfect balance of rustic styling and floral elegance.\n\n**Suitable for**: Home decor, Thoughtful gifting, Birthdays, or as a unique romantic surprise.",
    price: 1899,
    categorySlug: "flowers",
    tags: ["pink lilies", "purple daisies", "kraft paper", "gold bow", "rustic charm", "gift", "unique wrapping", "amethyst"]
  },
  {
    imagePath: "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf/media__1773314623645.jpg",
    name: "Ethereal Cream Rose & Carnation Whisper",
    slug: "ethereal-cream-rose-carnation-whisper",
    description: "A gentle and sophisticated arrangement featuring velvety cream roses and pristine white carnations, accented with delicate baby's breath. Expertly hand-wrapped in soft yellow translucent paper and finished with a natural twine bow. This bouquet exudes a sense of pure, ethereal beauty.\n\n**Suitable for**: Appreciation, Congratulations, Thinking of you, or as a graceful home accent.",
    price: 1499,
    categorySlug: "flowers",
    tags: ["cream roses", "white carnations", "yellow wrapping", "twine bow", "ethereal", "gift", "gentle bloom", "nature"]
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
