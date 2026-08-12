export interface User {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  deliveredAt: string | null;
  seenAt: string | null;
  pending?: boolean;
}

export type ServerEvent =
  | { type: "message:new"; message: Message }
  | { type: "message:delivered"; messageId: string; receiverId: string }
  | { type: "message:seen"; senderId: string; seenAt: string }
  | { type: "presence"; userId: string; isOnline: boolean; lastSeen: string }
  | { type: "typing"; senderId: string; isTyping: boolean }
  | { type: "error"; error: string };

export type ClientEvent =
  | { type: "message:send"; tempId: string; receiverId: string; content: string }
  | { type: "message:seen"; senderId: string }
  | { type: "typing"; receiverId: string; isTyping: boolean };
