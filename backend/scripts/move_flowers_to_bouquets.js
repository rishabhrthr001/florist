
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log("Connected to MongoDB");

    const flowersCategoryId = "69a968d47f7d69ffaac855dc";
    const bouquetsCategoryId = "69a95fca11fb54a4ddb04aa4";

    const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
      categoryId: mongoose.Schema.Types.ObjectId
    }));

    console.log(`Moving all products from category ID ${flowersCategoryId} to ${bouquetsCategoryId}...`);
    
    // Convert strings to ObjectIds for the query
    const result = await Product.updateMany(
      { categoryId: new mongoose.Types.ObjectId(flowersCategoryId) },
      { $set: { categoryId: new mongoose.Types.ObjectId(bouquetsCategoryId) } }
    );

    console.log(`Successfully moved ${result.modifiedCount} products to Bouquets.`);
    
    // Optional: Check if any products are left in Flowers
    const remainingCount = await Product.countDocuments({ categoryId: new mongoose.Types.ObjectId(flowersCategoryId) });
    console.log(`Products remaining in Flowers: ${remainingCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
