import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: String,
  section: String,
  slug: String
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const categories = await Category.find();
  console.log("Total Categories:", categories.length);
  categories.forEach(c => {
    console.log(`- ${c.name} (${c.section}) [${c.slug}]`);
  });
  process.exit(0);
}

check();
