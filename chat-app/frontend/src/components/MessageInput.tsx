import { KeyboardEvent, useRef, useState } from "react";

interface Props {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSend, onTyping }: Props) {
  const [value, setValue] = useState("");
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(text: string) {
    setValue(text);
    onTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1500);
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    onTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-3">
      <textarea
        className="max-h-32 flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        rows={1}
        placeholder="Type a message"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-40"
        aria-label="Send message"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L21 4L13 21L11 13L3 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
