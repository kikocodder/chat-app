import { API_BASE_URL } from "../api/client";

interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: number;
  isOnline?: boolean;
  showStatusDot?: boolean;
}

const COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-sky-400",
  "bg-indigo-400",
  "bg-violet-400",
  "bg-pink-400",
];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({
  username,
  avatarUrl,
  size = 44,
  isOnline,
  showStatusDot = false,
}: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  const src = avatarUrl ? (avatarUrl.startsWith("http") ? avatarUrl : `${API_BASE_URL}${avatarUrl}`) : null;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={username}
          className="h-full w-full rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full font-semibold text-white ${colorForName(
            username
          )}`}
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          {initials}
        </div>
      )}
      {showStatusDot && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-300"
          }`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
