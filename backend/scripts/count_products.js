
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function count() {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}));
    const total = await Product.countDocuments();
    console.log("Total products:", total);
    process.exit(0);
}
count();
