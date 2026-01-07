import { X, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // 🚨 PANIC BUTTON ACTION
  const handleEmergency = () => {
    window.location.href = "https://www.youtube.com";
  };

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
      {/* LEFT SIDE */}
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

      {/* RIGHT SIDE ACTIONS */}
      <div className="flex items-center gap-1">
        {/* 🚨 EMERGENCY BUTTON (MOBILE + DESKTOP) */}
        <button
          onClick={handleEmergency}
          className="btn btn-ghost btn-circle text-red-500"
          title="Emergency"
        >
          <AlertTriangle size={20} />
        </button>

        {/* ❌ CLOSE BUTTON (DESKTOP ONLY) */}
        <button
          onClick={() => setSelectedUser(null)}
          className="hidden lg:flex btn btn-ghost btn-circle"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
