import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ProfileModal from "../components/ProfileModal";
import { useSocket } from "../context/SocketContext";
import { User } from "../types";

export default function Chat() {
  const { subscribe } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [presenceMap, setPresenceMap] = useState<
    Record<string, { isOnline: boolean; lastSeen: string }>
  >({});

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === "presence") {
        setPresenceMap((prev) => ({
          ...prev,
          [event.userId]: { isOnline: event.isOnline, lastSeen: event.lastSeen },
        }));
      }
    });
    return unsubscribe;
  }, [subscribe]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className={`${selectedUser ? "hidden sm:flex" : "flex"} h-full`}>
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          presenceMap={presenceMap}
          onOpenProfile={() => setShowProfile(true)}
        />
      </div>

      <div className={`${selectedUser ? "flex" : "hidden sm:flex"} h-full flex-1`}>
        {selectedUser ? (
          <ChatWindow
            otherUser={selectedUser}
            presence={presenceMap[selectedUser.id]}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
