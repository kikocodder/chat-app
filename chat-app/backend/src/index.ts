import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import messageRoutes from "./routes/messages";
import { initWebSocketServer } from "./ws/socket";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), UPLOAD_DIR)));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`API + WebSocket server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
