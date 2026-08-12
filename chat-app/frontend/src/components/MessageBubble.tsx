import { format } from "date-fns";
import { Message } from "../types";

interface Props {
  message: Message;
  isMine: boolean;
}

function TickIcon({ state }: { state: "sending" | "sent" | "delivered" | "seen" }) {
  if (state === "sending") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" className="text-gray-300">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" />
      </svg>
    );
  }
  const color = state === "seen" ? "text-sky-300" : "text-white/70";
  if (state === "sent") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={color}>
        <path d="M2 8.5L6 12.5L14 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // delivered or seen: double tick
  return (
    <svg width="19" height="15" viewBox="0 0 20 16" fill="none" className={color}>
      <path d="M1 8.5L5 12.5L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 8.5L10.5 12.5L18.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MessageBubble({ message, isMine }: Props) {
  let tickState: "sending" | "sent" | "delivered" | "seen" = "sent";
  if (message.pending) tickState = "sending";
  else if (message.seenAt) tickState = "seen";
  else if (message.deliveredAt) tickState = "delivered";
  else tickState = "sent";

  return (
    <div className={`flex w-full ${isMine ? "justify-end" : "justify-start"} px-2 py-0.5`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isMine
            ? "rounded-br-sm bg-brand-500 text-white"
            : "rounded-bl-sm bg-white text-gray-800"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">
          {message.content}
        </p>
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            isMine ? "text-white/70" : "text-gray-400"
          }`}
        >
          <span>{format(new Date(message.createdAt), "h:mm a")}</span>
          {isMine && <TickIcon state={tickState} />}
        </div>
      </div>
    </div>
  );
}
