import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Get message history between the logged-in user and :userId
router.get("/:userId", requireAuth, async (req: AuthRequest, res) => {
  const me = req.user!.userId;
  const other = req.params.userId;
  const cursor = req.query.cursor as string | undefined;
  const take = 30;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me, receiverId: other },
        { senderId: other, receiverId: me },
      ],
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  // Mark messages from "other" as seen since the viewer is now reading them
  const unseenIds = messages
    .filter((m) => m.receiverId === me && !m.seenAt)
    .map((m) => m.id);
  if (unseenIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unseenIds } },
      data: { seenAt: new Date() },
    });
  }

  res.json(messages.reverse());
});

export default router;
