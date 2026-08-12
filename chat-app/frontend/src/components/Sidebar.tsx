import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import { User } from "../types";

interface Props {
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  presenceMap: Record<string, { isOnline: boolean; lastSeen: string }>;
  onOpenProfile: () => void;
}

function formatLastSeen(isOnline?: boolean, lastSeen?: string) {
  if (isOnline) return "online";
  if (!lastSeen) return "offline";
  return `last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
}

export default function Sidebar({ selectedUser, onSelectUser, presenceMap, onOpenProfile }: Props) {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .get("/users", { params: query ? { q: query } : {}, signal: controller.signal })
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  return (
    <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white sm:w-80">
      {/* Current user bar */}
      <div className="flex items-center gap-3 border-b border-gray-200 p-3">
        <button onClick={onOpenProfile} className="shrink-0">
          <Avatar username={user?.username || "?"} avatarUrl={user?.avatarUrl} size={42} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-800">{user?.username}</p>
          <p className="truncate text-xs text-gray-400">{user?.bio || "Available"}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          title="Log out"
        >
          Logout
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="px-4 py-3 text-sm text-gray-400">Loading users...</p>}
        {!loading && users.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-400">No users found</p>
        )}
        {users.map((u) => {
          const presence = presenceMap[u.id];
          const isOnline = presence?.isOnline ?? u.isOnline;
          const lastSeen = presence?.lastSeen ?? u.lastSeen;
          const active = selectedUser?.id === u.id;
          return (
            <button
              key={u.id}
              onClick={() => onSelectUser(u)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50 ${
                active ? "bg-brand-50" : ""
              }`}
            >
              <Avatar username={u.username} avatarUrl={u.avatarUrl} size={44} isOnline={isOnline} showStatusDot />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">{u.username}</p>
                <p className={`truncate text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                  {formatLastSeen(isOnline, lastSeen)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
