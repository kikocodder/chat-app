import { useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ avatarUrl: res.data.avatarUrl });
    } catch {
      setError("Failed to upload avatar");
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch("/users/me", { username, bio });
      updateUser({ username: res.data.username, bio: res.data.bio });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">Edit profile</h2>

        <div className="mb-5 flex flex-col items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="relative">
            <Avatar username={user?.username || "?"} avatarUrl={user?.avatarUrl} size={84} />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition hover:bg-black/30 hover:text-white">
              <span className="text-xs">Change</span>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Hey there! I'm using PulseChat"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
