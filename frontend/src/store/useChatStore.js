import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],              // contacts only
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ===============================
  // GET CONTACTS
  // ===============================
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load contacts"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ===============================
  // SEARCH USER BY EMAIL
  // ===============================
  searchUserByEmail: async (email) => {
    try {
      const res = await axiosInstance.get(
        `/messages/search?email=${email}`
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "User not found"
      );
    }
  },

  // ===============================
  // ADD CONTACT
  // ===============================
  addContact: async (contactId) => {
    try {
      await axiosInstance.post("/messages/add-contact", {
        contactId,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add contact"
      );
      throw error;
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
      toast.error(
        error.response?.data?.message || "Failed to load messages"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ===============================
  // SEND MESSAGE
  // ===============================
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // ✅ append locally ONCE
      set((state) => ({
        messages: [...state.messages, res.data],
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  },

  // ===============================
  // SOCKET SUBSCRIBE (🔥 FIXED)
  // ===============================
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // 🔥 VERY IMPORTANT: remove old listeners FIRST
    socket.off("newMessage");
    socket.off("deleteMessage");

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });

    socket.on("deleteMessage", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter(
          (msg) => msg._id !== messageId
        ),
      }));
    });
  },

  // ===============================
  // SOCKET UNSUBSCRIBE
  // ===============================
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("deleteMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
