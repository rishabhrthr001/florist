import mongoose from "mongoose";
import CustomBouquet from "./models/CustomBouquet.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  
  try {
    const items = await CustomBouquet.find({}).populate("product");
    console.log("Count:", items.length);
  } catch (err) {
    console.error("FIND ERROR:", err);
  }
  
  process.exit(0);
}
run();
