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
// ✅ CORS (DEV + PROD SAFE)
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",      // local dev
      "https://icha-chat-app.onrender.com" // change if Render gives different URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

// =======================
// ✅ API ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// =======================
// ✅ SERVE FRONTEND (PROD)
// =======================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(process.cwd(), "frontend", "dist");

  app.use(express.static(frontendPath));

  // ❗ IMPORTANT FIX: use "/*" NOT "*"
  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// =======================
// ✅ START SERVER
// =======================
server.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);
  connectDB();
});
