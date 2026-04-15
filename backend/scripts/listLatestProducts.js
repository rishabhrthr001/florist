
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({ name: String, slug: String, images: [String], createdAt: Date }));
  const count = await Product.countDocuments();
  console.log("Total products:", count);
  const products = await Product.find({}, { name: 1, slug: 1, createdAt: 1 }).sort({ _id: -1 }).limit(20);
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
run();
