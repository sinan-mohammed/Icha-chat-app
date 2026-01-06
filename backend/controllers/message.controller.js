import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ===============================
// GET USERS FOR SIDEBAR (CONTACTS ONLY)
// ===============================
export const getUsersForSidebar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("contacts", "_id fullName profilePic email")
      .select("contacts");

    res.status(200).json(user.contacts);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===============================
// SEARCH USER BY EMAIL
// ===============================
export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select(
      "_id fullName profilePic email"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent adding yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in searchUserByEmail:", error.message);
    res.status(500).json({ message: "Search failed" });
  }
};

// ===============================
// ADD USER TO CONTACTS (🔥 FIXED: MUTUAL SAVE)
// ===============================
export const addToContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID required" });
    }

    // 🔥 Add contact to BOTH users (this fixes refresh issue)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { contacts: contactId },
    });

    await User.findByIdAndUpdate(contactId, {
      $addToSet: { contacts: userId },
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error in addToContacts:", error.message);
    res.status(500).json({ message: "Failed to add contact" });
  }
};

// ===============================
// GET MESSAGES
// ===============================
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===============================
// SEND MESSAGE
// ===============================
export const sendMessage = async (req, res) => {
  try {
    const { text, image, vanishAfterSeen } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      vanishAfterSeen: Boolean(vanishAfterSeen),
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===============================
// MARK MESSAGE AS SEEN (⏱️ DELAYED VANISH)
// ===============================
export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.seen) {
      return res.sendStatus(200);
    }

    message.seen = true;
    await message.save();

    if (message.vanishAfterSeen) {
      setTimeout(async () => {
        const deletedMessage = await Message.findByIdAndDelete(messageId);
        if (!deletedMessage) return;

        const senderSocketId = getReceiverSocketId(deletedMessage.senderId);
        const receiverSocketId = getReceiverSocketId(deletedMessage.receiverId);

        if (senderSocketId) {
          io.to(senderSocketId).emit("deleteMessage", { messageId });
        }

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("deleteMessage", { messageId });
        }
      }, 3000);
    }

    res.sendStatus(200);
  } catch (error) {
    console.log("Error in markMessageAsSeen:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
