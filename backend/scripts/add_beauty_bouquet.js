
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773223145734.jpg";

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

    // 1. Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const uploadRes = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "products",
    });
    console.log("Uploaded:", uploadRes.secure_url);

    // 2. Get category
    const categoryName = "Beauty Combos";
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
        category = await Category.findOne({ slug: "gifts" }) || await Category.findOne({ slug: "bouquets" });
    }
    
    if (!category) throw new Error("Category not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Glamour Haven Beauty & Rose Bouquet";
    let baseSlug = "glamour-haven-beauty-rose-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A dream combination for the makeup lover, this unique bouquet blends the beauty of fresh flowers with a curated selection of premium beauty products. Nestled among delicate pink roses and baby's breath is a complete glamour kit.\n\n**This Premium Combo Consists of**:\n- **Fresh Flowers**: 4-6 Soft pink roses accented with white baby's breath.\n- **Eyes & Face**: An 'Ariyas Fantasy' eyeshadow palette with versatile shimmering and matte tones.\n- **Brushes**: A professional-grade plush makeup powder brush.\n- **Eyeliner & Eyebrows**: Precision eyeliner and a Hilary Rhoda double-ended eyebrow pencil.\n- **Lip Care**: 2 Liquid matte lip colors in trendy shades.\n- **Extras**: A beautiful designer pendant necklace and a Hilary Rhoda skincare tube.\n\n**Suitable for**: Birthdays, bridesmaids' gifts, teenage celebrations, or as a grand 'Thinking of you' gesture for anyone who loves beauty and self-care.",
      images: [uploadRes.secure_url],
      price: 2450,
      categoryId: category._id,
      tags: ["makeup", "beauty", "combo", "roses", "gift set", "eyeshadow", "perfume", "jewelry"],
      isActive: true,
      premiumWrapping: true
    });

    const saved = await newProduct.save();
    console.log("Product saved successfully:", saved.name, "at Rs.", saved.price);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
