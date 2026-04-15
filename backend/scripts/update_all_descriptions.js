
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

    const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
      name: String,
      description: String,
      tags: [String]
    }));

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update.`);

    let updatedCount = 0;

    for (const p of products) {
      const originalDesc = p.description || "";
      const name = p.name || "";
      const tags = p.tags || [];

      let contents = "";
      let suitability = "";

      // 1. Try to extract CONTENTS
      // Matches: "**This Product Consists of**:", "Primary Flowers:", etc.
      const contentsMatch = originalDesc.match(/(?:\*\*This Product Consists of\*\*|\*\*This Grand Product Consists of\*\*\*|\*\*This Premium Arrangement Consists of\*\*|Consists of|Primary Flowers|Product Consists of|Contents):?[\s\n]*([\s\S]*?)(?=\n\n|\r\n\r\n|\*\*|Suitable for|Occasions|Key Features|$)/i);
      
      if (contentsMatch && contentsMatch[1].trim()) {
        contents = contentsMatch[1].trim()
          .replace(/^- /gm, "") // remove bullets
          .replace(/\n/g, ", ") // join lines
          .replace(/\s+/g, " ") // clean whitespace
          .replace(/\*\*.*?\*\*/g, "") // remove bold markers if any
          .trim();
        if (contents.endsWith(",")) contents = contents.slice(0, -1);
      } else {
        // Fallback to name/tags
        contents = tags.length > 0 ? tags.slice(0, 4).join(", ") : name;
      }
      
      // 2. Try to extract SUITABILITY
      // Matches: "**Suitable for**:", "Ideal for:", etc.
      const suitMatch = originalDesc.match(/(?:\*\*Suitable for\*\*|Suitable for|Occasions|Ideal for):?[\s\n]*([\s\S]*?)(?=\n\n|\r\n\r\n|\*\*|$)/i);
      if (suitMatch && suitMatch[1].trim()) {
        suitability = suitMatch[1].trim()
          .replace(/^- /gm, "")
          .replace(/\n/g, ", ")
          .replace(/\s+/g, " ")
          .trim();
        if (suitability.endsWith(",")) suitability = suitability.slice(0, -1);
      } else {
        suitability = "Birthdays, anniversaries, and special celebrations";
      }

      if (contents.endsWith(".")) contents = contents.slice(0, -1);
      
      // Clean suitability
      suitability = suitability
        .replace(/^(?:ideal for|perfect for|good for|best for|for)\s+/i, "")
        .trim();
      if (suitability.endsWith(".")) suitability = suitability.slice(0, -1);

      // 3. Final cleanup and formatting
      if (!contents) contents = name;
      if (!suitability) suitability = "any special occasion";

      // Reformat contents to be more readable
      contents = contents
        .split(/[,;]/)
        .map(x => x.trim())
        .filter(x => x.length > 2)
        .map(x => x.toLowerCase())
        .join(" and ");
      
      if (contents.length > 250) contents = contents.substring(0, 247) + "...";
      
      const newDesc = `This product contains ${contents}. It is suitable for ${suitability.toLowerCase()}.`;

      p.description = newDesc;
      await p.save();
      updatedCount++;
      
      if (updatedCount % 50 === 0) {
        console.log(`Updated ${updatedCount} products...`);
      }
    }

    console.log(`Successfully updated descriptions for ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
