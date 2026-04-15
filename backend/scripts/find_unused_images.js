
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const IMAGE_DIR = "/Users/rishabhrathore/.gemini/antigravity/brain/d762eb4a-bdda-45dc-b8d0-bc8a5e8d70bf";

async function findUnused() {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
        images: [String]
    }));

    const products = await Product.find({}, "images");
    const dbImages = new Set();
    products.forEach(p => {
        p.images.forEach(img => {
            // Extract the filename from Cloudinary URL if possible, or just keep the whole thing
            // But since I don't know the exact mapping, I'll rely on listing the scripts I've run if possible.
            // Actually, I'll just check if the files exist in the scripts I've created.
        });
    });

    const files = fs.readdirSync(IMAGE_DIR).filter(f => f.startsWith("media__") && f.endsWith(".jpg"));
    
    // I will read all my script files in the backend/scripts directory to see which local files they used.
    const scriptDir = "/Users/rishabhrathore/Desktop/manga/backend/scripts";
    const scriptFiles = fs.readdirSync(scriptDir);
    const usedFiles = new Set();
    
    scriptFiles.forEach(sf => {
        const content = fs.readFileSync(path.join(scriptDir, sf), 'utf8');
        files.forEach(f => {
            if (content.includes(f)) {
                usedFiles.add(f);
            }
        });
    });

    const unused = files.filter(f => !usedFiles.has(f));
    console.log("Unused files count:", unused.length);
    console.log("Unused files:", JSON.stringify(unused, null, 2));
    
    process.exit(0);
}

findUnused();
