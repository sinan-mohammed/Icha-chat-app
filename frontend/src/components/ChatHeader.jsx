import { X, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // 🔥 PANIC ACTION
  const handlePanic = () => {
    window.location.replace("https://www.youtube.com");
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* LEFT: USER INFO */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* RIGHT: PANIC + CLOSE */}
        <div className="flex items-center gap-2">
          {/* 🔥 Panic Button */}
          <button
            onClick={handlePanic}
            className="btn btn-sm btn-error btn-circle"
            title="Panic Button"
          >
            <AlertTriangle size={18} />
          </button>

          {/* Close chat */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-sm btn-ghost btn-circle"
            title="Close Chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
