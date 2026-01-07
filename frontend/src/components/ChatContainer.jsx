import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { axiosInstance } from "../lib/axios";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();

  // 🔽 scroll anchor
  const bottomRef = useRef(null);

  // 🔒 Track messages already marked as seen
  const seenMessagesRef = useRef(new Set());

  // Fetch messages & subscribe
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  // Mark incoming messages as seen
  useEffect(() => {
    messages.forEach((message) => {
      const isIncoming = message.senderId !== authUser._id;
      const notSeen = !message.seen;
      const notProcessed = !seenMessagesRef.current.has(message._id);

      if (isIncoming && notSeen && notProcessed) {
        seenMessagesRef.current.add(message._id);
        axiosInstance.put(`/messages/seen/${message._id}`).catch(() => {});
      }
    });
  }, [messages, authUser._id]);

  // Auto scroll (mobile friendly)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      {/* MESSAGE LIST */}
      <div
        className="
          flex-1
          overflow-y-auto
          overflow-x-hidden
          p-4
          space-y-4
          pb-32   /* 🔥 space for fixed input */
        "
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id
                ? "chat-end"
                : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col max-w-[85%]">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="max-w-[200px] rounded-md mb-2"
                />
              )}

              {message.text && <p>{message.text}</p>}

              {message.vanishAfterSeen && !message.seen && (
                <span className="text-[10px] text-gray-400 mt-1">
                  Disappears after seen
                </span>
              )}
            </div>
          </div>
        ))}

        {/* 🔽 SCROLL ANCHOR */}
        <div ref={bottomRef} />
      </div>

      {/* INPUT (FIXED AT BOTTOM) */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
