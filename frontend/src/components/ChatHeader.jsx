import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div
      className="
        sticky top-0 z-20
        bg-base-100
        border-b border-base-300
        px-3 py-2
        flex items-center justify-between
      "
    >
      <div className="flex items-center gap-3">
        {/* 🔙 BACK BUTTON (MOBILE ONLY) */}
        <button
          onClick={() => setSelectedUser(null)}
          className="lg:hidden btn btn-ghost btn-circle"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Avatar */}
        <div className="avatar">
          <div className="size-10 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        {/* User info */}
        <div className="leading-tight">
          <h3 className="font-medium">{selectedUser.fullName}</h3>
          <p className="text-xs text-base-content/70">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* ❌ CLOSE BUTTON (DESKTOP ONLY) */}
      <button
        onClick={() => setSelectedUser(null)}
        className="hidden lg:flex btn btn-ghost btn-circle"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;
