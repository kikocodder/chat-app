import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Message, User } from "../types";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface Props {
  otherUser: User;
  presence?: { isOnline: boolean; lastSeen: string };
  onBack?: () => void;
}

function formatLastSeen(isOnline?: boolean, lastSeen?: string) {
  if (isOnline) return "online";
  if (!lastSeen) return "offline";
  const d = new Date(lastSeen);
  return `last seen ${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${d.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;
}

export default function ChatWindow({ otherUser, presence, onBack }: Props) {
  const { user: me } = useAuth();
  const { sendEvent, subscribe } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history when the selected conversation changes
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    api
      .get(`/messages/${otherUser.id}`)
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
    // Mark incoming messages from this user as seen
    sendEvent({ type: "message:seen", senderId: otherUser.id });
  }, [otherUser.id]);

  // Subscribe to realtime events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === "message:new") {
        const msg = event.message;
        const isThisConversation =
          (msg.senderId === otherUser.id && msg.receiverId === me?.id) ||
          (msg.senderId === me?.id && msg.receiverId === otherUser.id);
        if (!isThisConversation) return;

        setMessages((prev) => {
          if (msg.tempId) {
            // Reconcile optimistic message with the confirmed one from server
            const idx = prev.findIndex((m) => m.tempId === msg.tempId);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = { ...msg, pending: false };
              return copy;
            }
          }
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // If the message just arrived from the other user, mark it seen immediately (chat is open)
        if (msg.senderId === otherUser.id) {
          sendEvent({ type: "message:seen", senderId: otherUser.id });
        }
      }

      if (event.type === "message:delivered") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === event.messageId ? { ...m, deliveredAt: new Date().toISOString() } : m
          )
        );
      }

      if (event.type === "message:seen" && event.senderId === otherUser.id) {
        setMessages((prev) =>
          prev.map((m) => (m.receiverId === otherUser.id ? { ...m, seenAt: event.seenAt } : m))
        );
      }

      if (event.type === "typing" && event.senderId === otherUser.id) {
        setIsTyping(event.isTyping);
        if (typingResetRef.current) clearTimeout(typingResetRef.current);
        if (event.isTyping) {
          typingResetRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });
    return unsubscribe;
  }, [otherUser.id, me?.id, subscribe, sendEvent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(content: string) {
    const tempId = crypto.randomUUID();
    const optimistic: Message = {
      id: tempId,
      tempId,
      senderId: me!.id,
      receiverId: otherUser.id,
      content,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      seenAt: null,
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    sendEvent({ type: "message:send", tempId, receiverId: otherUser.id, content });
  }

  function handleTyping(typing: boolean) {
    sendEvent({ type: "typing", receiverId: otherUser.id, isTyping: typing });
  }

  const online = presence?.isOnline ?? otherUser.isOnline;
  const lastSeen = presence?.lastSeen ?? otherUser.lastSeen;

  return (
    <div className="flex h-full flex-1 flex-col bg-[#efe9e0]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white p-3 shadow-sm">
        {onBack && (
          <button onClick={onBack} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 sm:hidden" aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <Avatar username={otherUser.username} avatarUrl={otherUser.avatarUrl} size={42} isOnline={online} showStatusDot />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-800">{otherUser.username}</p>
          <p className={`truncate text-xs ${isTyping ? "text-brand-500" : online ? "text-green-500" : "text-gray-400"}`}>
            {isTyping ? "typing..." : formatLastSeen(online, lastSeen)}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3">
        {loading && <p className="px-4 py-3 text-center text-sm text-gray-400">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="px-4 py-3 text-center text-sm text-gray-400">
            No messages yet. Say hello to {otherUser.username}!
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.tempId ?? m.id} message={m} isMine={m.senderId === me?.id} />
        ))}
        {isTyping && (
          <div className="flex justify-start px-4 py-1">
            <div className="flex gap-1 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
