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
import contactRoutes from "./routes/contactRoutes.js";
import ticketRoutes from "./routes/tickets.js";
import wishlistRoutes from "./routes/wishlist.js";
import customRoutes from "./routes/custom.js";

import { initSocket, getIO } from "./socket/index.js";

dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration for production
// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://mangalamflorist.com",
  "https://www.mangalamflorist.com",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Cloud Run uses PORT env variable (default 8080)
const PORT = process.env.PORT || 3001;

connectDB();

cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch((e) => console.log("❌ Cloudinary failed", e));

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  req.io = getIO();
  next();
});

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/category", categoryRoutes);
app.use("/home-section", homeSectionRoutes);
app.use("/user", userRoutes);
app.use("/reviews", reviewRoutes);
app.use("/orders", orderRoutes);
app.use("/contact", contactRoutes);
app.use("/tickets", ticketRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/custom-bouquet", customRoutes);
const server = http.createServer(app);

initSocket(server);

// Listen on 0.0.0.0 for Cloud Run
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
