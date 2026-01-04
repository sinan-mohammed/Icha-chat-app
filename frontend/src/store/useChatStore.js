import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ===============================
  // GET USERS
  // ===============================
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ===============================
  // GET MESSAGES
  // ===============================
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ===============================
  // SEND MESSAGE
  // ===============================
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // ===============================
  // SOCKET SUBSCRIBE
  // ===============================
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // 🔹 New incoming message
    socket.on("newMessage", (newMessage) => {
      const isFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // 🔥 DELETE MESSAGE (VANISH AFTER SEEN)
    socket.on("deleteMessage", ({ messageId }) => {
      set({
        messages: get().messages.filter(
          (msg) => msg._id !== messageId
        ),
      });
    });
  },

  // ===============================
  // SOCKET UNSUBSCRIBE
  // ===============================
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("deleteMessage"); // 🔥 IMPORTANT
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
