import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const otherId = params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: otherId },
        { senderId: otherId, receiverId: user.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ success: true, data: messages });
}

