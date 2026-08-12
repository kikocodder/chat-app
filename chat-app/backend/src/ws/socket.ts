import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { URL } from "url";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { ClientEvent, ServerEvent } from "../types";

interface AuthedSocket extends WebSocket {
  userId?: string;
  username?: string;
  isAlive?: boolean;
}

// userId -> set of open sockets (a user may have multiple tabs/devices)
const connections = new Map<string, Set<AuthedSocket>>();

function send(ws: AuthedSocket, event: ServerEvent) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function sendToUser(userId: string, event: ServerEvent) {
  const sockets = connections.get(userId);
  if (!sockets) return;
  for (const ws of sockets) send(ws, event);
}

function broadcastPresence(userId: string, isOnline: boolean, lastSeen: Date) {
  const event: ServerEvent = {
    type: "presence",
    userId,
    isOnline,
    lastSeen: lastSeen.toISOString(),
  };
  // Broadcast to everyone currently connected; the client filters by relevance
  for (const sockets of connections.values()) {
    for (const ws of sockets) send(ws, event);
  }
}

export function initWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws: AuthedSocket, req) => {
    try {
      const url = new URL(req.url || "", "http://localhost");
      const token = url.searchParams.get("token");
      if (!token) {
        ws.close(4001, "Missing token");
        return;
      }
      const payload = verifyToken(token);
      ws.userId = payload.userId;
      ws.username = payload.username;
      ws.isAlive = true;
    } catch {
      ws.close(4002, "Invalid token");
      return;
    }

    const userId = ws.userId!;
    if (!connections.has(userId)) connections.set(userId, new Set());
    connections.get(userId)!.add(ws);

    await prisma.user.update({ where: { id: userId }, data: { isOnline: true } });
    broadcastPresence(userId, true, new Date());

    // Deliver any messages that were sent while this user was offline
    const undelivered = await prisma.message.findMany({
      where: { receiverId: userId, deliveredAt: null },
    });
    if (undelivered.length > 0) {
      const now = new Date();
      await prisma.message.updateMany({
        where: { id: { in: undelivered.map((m) => m.id) } },
        data: { deliveredAt: now },
      });
      for (const m of undelivered) {
        sendToUser(m.senderId, { type: "message:delivered", messageId: m.id, receiverId: userId });
      }
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", async (raw) => {
      let event: ClientEvent;
      try {
        event = JSON.parse(raw.toString());
      } catch {
        send(ws, { type: "error", error: "Invalid JSON payload" });
        return;
      }

      try {
        switch (event.type) {
          case "message:send": {
            const { receiverId, content, tempId } = event;
            if (!content?.trim()) return;

            const receiverIsOnline = connections.has(receiverId);
            const message = await prisma.message.create({
              data: {
                senderId: userId,
                receiverId,
                content: content.trim(),
                deliveredAt: receiverIsOnline ? new Date() : null,
              },
            });

            const payload = {
              id: message.id,
              tempId,
              senderId: message.senderId,
              receiverId: message.receiverId,
              content: message.content,
              createdAt: message.createdAt.toISOString(),
              deliveredAt: message.deliveredAt ? message.deliveredAt.toISOString() : null,
              seenAt: message.seenAt ? message.seenAt.toISOString() : null,
            };

            // Echo back to sender (with tempId so the UI can reconcile optimistic message)
            send(ws, { type: "message:new", message: payload });
            // Forward to receiver if online
            sendToUser(receiverId, { type: "message:new", message: { ...payload, tempId: undefined } });
            break;
          }

          case "message:seen": {
            const { senderId } = event;
            const now = new Date();
            const result = await prisma.message.updateMany({
              where: { senderId, receiverId: userId, seenAt: null },
              data: { seenAt: now },
            });
            if (result.count > 0) {
              sendToUser(senderId, { type: "message:seen", senderId: userId, seenAt: now.toISOString() });
            }
            break;
          }

          case "typing": {
            sendToUser(event.receiverId, {
              type: "typing",
              senderId: userId,
              isTyping: event.isTyping,
            });
            break;
          }

          default:
            send(ws, { type: "error", error: "Unknown event type" });
        }
      } catch (err) {
        console.error("WS handler error:", err);
        send(ws, { type: "error", error: "Server error handling event" });
      }
    });

    ws.on("close", async () => {
      const set = connections.get(userId);
      set?.delete(ws);
      if (set && set.size === 0) {
        connections.delete(userId);
        const lastSeen = new Date();
        await prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeen } });
        broadcastPresence(userId, false, lastSeen);
      }
    });
  });

  // Heartbeat to drop dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as AuthedSocket;
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  return wss;
}
