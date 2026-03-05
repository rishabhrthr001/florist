
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// We need the raw URI without the database name at the end
// process.env.MONGO_URI is now .../mangalam
// So we extract the base
const baseUri = process.env.MONGO_URI.substring(0, process.env.MONGO_URI.lastIndexOf('/'));

async function migrate() {
  const client = new MongoClient(baseUri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const testDb = client.db("test");
    const mangalamDb = client.db("mangalam");

    const collectionsToMigrate = [
      'categories',
      'products',
      'homesections',
      'banners',
      'users',
      'ordercounters'
    ];

    for (const collName of collectionsToMigrate) {
      console.log(`Migrating collection: ${collName}...`);
      const data = await testDb.collection(collName).find().toArray();
      
      if (data.length > 0) {
        // Clear target collection first to avoid duplicates if re-running
        await mangalamDb.collection(collName).deleteMany({});
        
        // Insert data
        await mangalamDb.collection(collName).insertMany(data);
        console.log(`Successfully moved ${data.length} documents for ${collName}`);
      } else {
        console.log(`Collection ${collName} is empty in test database.`);
      }
    }

    console.log("\nMigration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
