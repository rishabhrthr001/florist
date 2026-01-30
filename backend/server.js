import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import connectDB from "./config/db.js";
import cloudinary from "./config/cloudinary.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import homeSectionRoutes from "./routes/homeSection.js";
import userRoutes from "./routes/user.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import orderRoutes from "./routes/order.js";

import { initSocket } from "./socket/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3002;

connectDB();

cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch((e) => console.log("❌ Cloudinary failed", e));

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/category", categoryRoutes);
app.use("/home-section", homeSectionRoutes);
app.use("/user", userRoutes);
app.use("/reviews", reviewRoutes);
app.use("/orders", orderRoutes);

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
