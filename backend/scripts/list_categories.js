
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const categorySchema = new mongoose.Schema({ name: String, slug: String });
    const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
    const categories = await Category.find({});
    console.log("Categories:", JSON.stringify(categories, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
