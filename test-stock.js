import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./backend/models/Product.js";

dotenv.config({ path: "./backend/.env" });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).limit(5);
  for (let p of products) {
    console.log(`Product: ${p.name}, isOutOfStock: ${p.isOutOfStock}`);
  }
  
  // Try changing one product
  const p = products[0];
  console.log("Setting to true...");
  p.isOutOfStock = true;
  await p.save();
  
  const p2 = await Product.findById(p._id);
  console.log("After save:", p2.isOutOfStock);
  process.exit(0);
}

run();
