
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

const imagePath = "/Users/rishabhrathore/.gemini/antigravity/brain/0369984b-cab7-453c-b4f9-b350e6e8c3bb/media__1773239629406.jpg";

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
    const category = await Category.findOne({ slug: "birthday" });
    if (!category) throw new Error("Category 'birthday' not found");
    console.log("Found Category:", category.name, category._id);

    // 3. Create Product
    const productName = "Gourmet Snack & Bloom Celebration Bouquet";
    let baseSlug = "gourmet-snack-bloom-celebration-bouquet";
    let slug = baseSlug;
    const existing = await Product.findOne({ slug });
    if (existing) {
        slug += "-" + Math.floor(Math.random() * 1000);
    }
    
    const newProduct = new Product({
      name: productName,
      slug: slug,
      description: "A vibrant and playful celebration of snacks and blooms! This grand bouquet is a treasure trove for foodies, featuring a mountain of assorted premium snacks carefully arranged amongst a lush bed of fresh flowers. It captures the perfect balance between sweet indulgence and floral beauty. Towering white stock flowers provide height, while roses and carnations add a classic touch. Hand-wrapped in signature azure-blue gold-flecked parchment with a double-layered bow.\n\n**This Product Consists of**:\n- **Snack Selection**: Assorted large packs of savory chips/balls, multiple Dairy Milk bars, KitKat bars, Bournville dark chocolate, and crunchy chocolate bars.\n- **Floral Tower**: 2-3 Stately white Stock flowers.\n- **Roses & Carnations**: A mix of premium pink and red roses, with bright orange bicolored carnations.\n- **Floral Fillers**: Abundant white cluster chrysanthemums and purple seasonal cluster flowers.\n- **Packaging**: Signature azure-blue premium parchment with gold-flecked accent layers.\n- **Finishing**: Double-layered bow featuring ruby red satin and shimmering magenta ribbon.\n\n**Suitable for**: Birthdays, movie nights, 'Thinking of You', graduation, or a fun surprise for any snack lover who appreciates both treats and blooms.",
      images: [uploadRes.secure_url],
      price: 2250,
      categoryId: category._id,
      tags: ["snack bouquet", "chocolate", "chips", "birthday", "graduation", "gift", "roses", "stock flowers", "fun", "blue"],
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
