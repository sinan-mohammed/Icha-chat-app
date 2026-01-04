import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ===============================
// GET USERS FOR SIDEBAR
// ===============================
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
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

    // Avoid double processing
    if (message.seen) {
      return res.sendStatus(200);
    }

    message.seen = true;
    await message.save();

    // 🔥 DELAYED VANISH LOGIC
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
      }, 3000); // ⏱️ 3 seconds delay
    }

    res.sendStatus(200);
  } catch (error) {
    console.log("Error in markMessageAsSeen:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
