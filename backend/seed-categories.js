import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
  }
);
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
async function run() {
  await mongoose.connect("mongodb+srv://rishabhrthr001_db_user:Mu84n5izmLeGyMkT@cluster0.h4prauj.mongodb.net/");
  await Category.insertMany([
    { name: "Plants", slug: "plants", image: "https://placehold.co/400x400/eeeeee/aaaaaa?text=Plants" },
    { name: "Big Bunches", slug: "big-bunches", image: "https://placehold.co/400x400/eeeeee/aaaaaa?text=Big+Bunches" }
  ]);
  console.log("Categories Added");
  process.exit(0);
}
run();
