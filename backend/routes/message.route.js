import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  markMessageAsSeen,

  // 🔥 NEW (email-based contacts)
  searchUserByEmail,
  addToContacts,
} from "../controllers/message.controller.js";

const router = express.Router();

// ===============================
// SIDEBAR (CONTACTS ONLY)
// ===============================
router.get("/users", protectRoute, getUsersForSidebar);

// ===============================
// SEARCH USER BY EMAIL
// ===============================
router.get("/search", protectRoute, searchUserByEmail);

// ===============================
// ADD USER TO CONTACTS
// ===============================
router.post("/add-contact", protectRoute, addToContacts);

// ===============================
// GET CHAT MESSAGES
// ===============================
router.get("/:id", protectRoute, getMessages);

// ===============================
// SEND MESSAGE
// ===============================
router.post("/send/:id", protectRoute, sendMessage);

// ===============================
// MARK MESSAGE AS SEEN (VANISH TRIGGER)
// ===============================
router.put("/seen/:messageId", protectRoute, markMessageAsSeen);

export default router;
