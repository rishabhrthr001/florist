import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        "https://mangalamflorist.com",
        "https://www.mangalamflorist.com",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173"
      ].filter(Boolean),
      credentials: true,
    },
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("_id role");

      if (!user) return next(new Error("User not found"));

      socket.user = {
        id: user._id.toString(),
        role: user.role,
      };

      next();
    } catch (err) {
      console.log("Socket auth failed:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;

    console.log(`⚡ Socket connected: ${id} (${role})`);

    // Join base rooms
    if (role === "admin") {
      socket.join("admin");
    } else {
      socket.join(`user:${id}`);
    }

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${id}`);
    });
  });
};

export const getIO = () => io;
