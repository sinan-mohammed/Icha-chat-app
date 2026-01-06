import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    searchUserByEmail,
    addContact,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const user = await searchUserByEmail(searchEmail.trim());
      setSearchResult(user);
    } catch {
      toast.error("User not found");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async () => {
    try {
      await addContact(searchResult._id);
      toast.success("Contact added");
      setSearchResult(null);
      setSearchEmail("");
      getUsers();
    } catch {
      toast.error("Failed to add contact");
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className={`
        h-full border-r border-base-300 flex flex-col
        w-full lg:w-72
        ${selectedUser ? "hidden lg:flex" : "flex"}
      `}
    >
      {/* HEADER */}
      <div className="border-b border-base-300 w-full p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-semibold text-lg">Contacts</span>
        </div>

        {/* 🔍 SEARCH */}
        <div className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="input input-bordered w-full"
          />
          <button
            onClick={handleSearch}
            className="btn btn-circle min-w-[44px] min-h-[44px]"
            disabled={isSearching}
          >
            <Search size={18} />
          </button>
        </div>

        {/* SEARCH RESULT */}
        {searchResult && (
          <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
            <div className="flex items-center gap-3">
              <img
                src={searchResult.profilePic || "/avatar.png"}
                className="size-10 rounded-full"
                alt={searchResult.fullName}
              />
              <span className="font-medium truncate">
                {searchResult.fullName}
              </span>
            </div>
            <button
              onClick={handleAddContact}
              className="btn btn-circle btn-primary min-w-[40px] min-h-[40px]"
            >
              <UserPlus size={18} />
            </button>
          </div>
        )}

        {/* ONLINE FILTER (DESKTOP ONLY) */}
        <div className="hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
        </div>
      </div>

      {/* CONTACT LIST */}
      <div className="overflow-y-auto w-full py-2">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full px-4 py-3 flex items-center gap-4
              hover:bg-base-300 active:bg-base-300
              ${selectedUser?._id === user._id ? "bg-base-300" : ""}`}
          >
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>

            <div className="text-left">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-6">
            No contacts yet
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
