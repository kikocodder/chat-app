import { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../api/client";
import { ClientEvent, ServerEvent } from "../types";

type Listener = (event: ServerEvent) => void;

interface SocketContextValue {
  sendEvent: (event: ClientEvent) => void;
  subscribe: (listener: Listener) => () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    let cancelled = false;

    function connect() {
      const wsUrl = API_BASE_URL.replace(/^http/, "ws");
      const ws = new WebSocket(`${wsUrl}/ws?token=${encodeURIComponent(token!)}`);
      wsRef.current = ws;

      ws.onmessage = (msgEvent) => {
        try {
          const data: ServerEvent = JSON.parse(msgEvent.data);
          listenersRef.current.forEach((listener) => listener(data));
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        // Attempt to reconnect after a short delay
        reconnectTimer.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token]);

  const sendEvent = useCallback((event: ClientEvent) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  return (
    <SocketContext.Provider value={{ sendEvent, subscribe }}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
