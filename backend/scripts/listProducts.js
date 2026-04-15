
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({ name: String, slug: String, images: [String] }));
  const products = await Product.find({}, { name: 1, slug: 1, images: 1 }).limit(100);
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
run();
