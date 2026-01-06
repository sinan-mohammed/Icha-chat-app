import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],              // 🔥 contacts only
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ===============================
  // GET CONTACTS (SIDEBAR USERS)
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
      return res.data; // return found user
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
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  },

  // ===============================
  // SOCKET SUBSCRIBE
  // ===============================
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // New incoming message
    socket.on("newMessage", (newMessage) => {
      const isFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // 🔥 Vanish-after-seen delete
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
    socket.off("deleteMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
