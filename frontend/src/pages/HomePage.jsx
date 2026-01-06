import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer.jsx";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    // ⬇️ pt-16 pushes content below fixed navbar
    <div className="h-screen bg-base-200 pt-16">
      {/* MOBILE: full screen | DESKTOP: centered card */}
      <div className="h-full lg:flex lg:items-center lg:justify-center lg:px-4 lg:pt-20">
        <div
          className="
            bg-base-100
            h-full w-full
            lg:h-[calc(100vh-8rem)]
            lg:max-w-6xl
            lg:rounded-lg
            lg:shadow-xl
            overflow-hidden
          "
        >
          <div className="flex h-full">
            {/* CONTACT LIST */}
            <Sidebar />

            {/* DESKTOP VIEW */}
            <div className="hidden lg:flex flex-1">
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>

            {/* MOBILE VIEW */}
            <div className="flex lg:hidden flex-1">
              {selectedUser && <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
