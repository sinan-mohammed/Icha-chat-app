import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  markMessageAsSeen, // 🔥 NEW
} from "../controllers/message.controller.js";

const router = express.Router();

// Sidebar users
router.get("/users", protectRoute, getUsersForSidebar);

// Get chat messages
router.get("/:id", protectRoute, getMessages);

// Send message
router.post("/send/:id", protectRoute, sendMessage);

// 🔥 MARK MESSAGE AS SEEN (VANISH TRIGGER)
router.put("/seen/:messageId", protectRoute, markMessageAsSeen);

export default router;
