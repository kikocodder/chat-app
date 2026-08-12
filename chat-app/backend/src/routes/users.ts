import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const authReq = req as AuthRequest;
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${authReq.user!.userId}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// List / search users (excluding self)
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  const users = await prisma.user.findMany({
    where: {
      id: { not: req.user!.userId },
      ...(q ? { username: { contains: q, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      isOnline: true,
      lastSeen: true,
      bio: true,
    },
    orderBy: { username: "asc" },
    take: 50,
  });
  res.json(users);
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      isOnline: true,
      lastSeen: true,
      bio: true,
    },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  const { username, bio } = req.body as { username?: string; bio?: string };
  const data: { username?: string; bio?: string } = {};
  if (username) data.username = username;
  if (bio !== undefined) data.bio = bio;

  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: { id: true, username: true, avatarUrl: true, bio: true },
    });
    res.json(updated);
  } catch {
    res.status(409).json({ error: "Username already taken" });
  }
});

router.post("/me/avatar", requireAuth, upload.single("avatar"), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const avatarUrl = `/uploads/${req.file.filename}`;
  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { avatarUrl },
    select: { id: true, username: true, avatarUrl: true, bio: true },
  });
  res.json(updated);
});

export default router;
