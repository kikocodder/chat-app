// Messages the CLIENT sends to the server over the WebSocket
export type ClientEvent =
  | { type: "message:send"; tempId: string; receiverId: string; content: string }
  | { type: "message:seen"; senderId: string }
  | { type: "typing"; receiverId: string; isTyping: boolean };

// Messages the SERVER sends to the client over the WebSocket
export type ServerEvent =
  | {
      type: "message:new";
      message: {
        id: string;
        tempId?: string;
        senderId: string;
        receiverId: string;
        content: string;
        createdAt: string;
        deliveredAt: string | null;
        seenAt: string | null;
      };
    }
  | { type: "message:delivered"; messageId: string; receiverId: string }
  | { type: "message:seen"; senderId: string; seenAt: string }
  | { type: "presence"; userId: string; isOnline: boolean; lastSeen: string }
  | { type: "typing"; senderId: string; isTyping: boolean }
  | { type: "error"; error: string };
