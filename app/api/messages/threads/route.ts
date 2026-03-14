import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }]
    },
    orderBy: { createdAt: "desc" }
  });

  const threadsMap = new Map<
    string,
    { userId: string; lastMessage: string; updatedAt: Date }
  >();

  for (const m of messages) {
    const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
    if (!threadsMap.has(otherId)) {
      threadsMap.set(otherId, {
        userId: otherId,
        lastMessage: m.content || (m.imageUrl ? "Sent an image" : ""),
        updatedAt: m.createdAt
      });
    }
  }

  const threads = await Promise.all(
    Array.from(threadsMap.values()).map(async t => {
      const u = await prisma.user.findUnique({
        where: { id: t.userId },
        select: { id: true, name: true, role: true }
      });
      return {
        partner: u,
        lastMessage: t.lastMessage,
        updatedAt: t.updatedAt
      };
    })
  );

  return NextResponse.json({ success: true, data: threads });
}

