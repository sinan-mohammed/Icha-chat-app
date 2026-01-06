import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "../lib/db.js";
import authRoutes from "../routes/auth.route.js";
import messageRoutes from "../routes/message.route.js";
import { app, server } from "../lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://icha-chat-app.onrender.com"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// =======================
// API ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// =======================
// FRONTEND (PRODUCTION)
// =======================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(process.cwd(), "frontend", "dist");

  app.use(express.static(frontendPath));

  // ✅ Node 22 SAFE catch-all
  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// =======================
// START SERVER
// =======================
server.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);
  connectDB();
});
