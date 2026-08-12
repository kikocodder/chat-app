# PulseChat — Real-Time Chat App

A Telegram-style real-time chat application.

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + `ws` (WebSocket) + JWT auth
- **Database:** PostgreSQL via Prisma ORM

## Features

- Email/username + password auth (JWT)
- Profile: username, bio, avatar picture upload
- User search / contact list
- Real-time messaging over WebSocket
- Online / offline presence + **"last seen"** timestamps
- Per-message timestamps
- Message status ticks like Telegram/WhatsApp: sending → sent (✓) → delivered (✓✓ grey) → **seen (✓✓ blue)**
- Typing indicator
- Auto-reconnecting WebSocket client
- Responsive layout (mobile-friendly sidebar/chat toggle)

---

## 1. Prerequisites

- Node.js 18+
- npm
- PostgreSQL (or Docker, to run it via the included `docker-compose.yml`)

## 2. Start PostgreSQL

Easiest way, with Docker:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password `postgres` / `postgres` and database `chatapp` (matches the default `.env.example`).

If you already have Postgres running locally, just create a database and point `DATABASE_URL` at it instead.

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env if your DB credentials/port differ, and set a real JWT_SECRET

npm install
npx prisma migrate dev --name init   # creates tables in Postgres
npm run dev                          # starts API + WebSocket server on :4000
```

The backend serves:
- REST API at `http://localhost:4000/api`
- WebSocket at `ws://localhost:4000/ws`
- Uploaded avatars at `http://localhost:4000/uploads/...`

## 4. Frontend setup

In a new terminal:

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000

npm install
npm run dev             # starts Vite dev server on :5173
```

Open `http://localhost:5173`, register two different accounts (e.g. in two browser windows/incognito tabs), and start chatting between them in real time.

---

## Project structure

```
chat-app/
├── docker-compose.yml       # Postgres for local dev
├── backend/
│   ├── prisma/schema.prisma # User & Message models
│   └── src/
│       ├── index.ts         # Express app + HTTP server bootstrap
│       ├── routes/          # auth, users, messages REST endpoints
│       ├── middleware/auth.ts
│       ├── lib/             # prisma client, jwt helpers
│       ├── ws/socket.ts     # WebSocket server: messaging, presence, typing
│       └── types.ts         # Shared WS event types
└── frontend/
    └── src/
        ├── context/         # AuthContext, SocketContext
        ├── pages/           # Login, Register, Chat
        ├── components/      # Sidebar, ChatWindow, MessageBubble, MessageInput,
        │                     Avatar, ProfileModal
        └── api/client.ts    # Axios instance with JWT header injection
```

## How the real-time flow works

1. On login, the frontend receives a JWT and opens a WebSocket connection to `/ws?token=<jwt>`. The server verifies the token before accepting the connection.
2. Sending a message emits a `message:send` WS event; the server persists it via Prisma, then pushes a `message:new` event to both the sender (to reconcile the optimistic UI bubble) and the receiver (if online).
3. If the receiver is online, `deliveredAt` is set immediately; otherwise it's set — and the sender notified — the next time that user connects.
4. Opening a conversation (or receiving a message while it's open) sends `message:seen`, which stamps `seenAt` on the relevant messages and notifies the original sender so their tick marks turn blue.
5. On connect/disconnect, the server flips the user's `isOnline` flag and `lastSeen` timestamp in Postgres and broadcasts a `presence` event so everyone's contact list updates live.
6. A 30s ping/pong heartbeat detects and cleans up dead connections.

## Notes / things you may want to extend

- Group chats aren't included — the schema/WS layer is 1:1 direct messaging only, but `Message` already has clean sender/receiver fields to build group chat on top of.
- Message pagination uses a `cursor` query param on `GET /api/messages/:userId`, but the frontend currently only loads the latest page — wire up "load older messages on scroll" if you need full history.
- Avatars are stored on local disk under `backend/uploads`; swap `multer.diskStorage` for an S3-compatible client for production deployments.
- Rotate `JWT_SECRET` and use HTTPS/WSS in production; the WebSocket client already derives `wss://` automatically when `VITE_API_URL` is `https://`.
