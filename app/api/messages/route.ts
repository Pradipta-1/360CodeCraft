import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { receiverId, content, imageUrl, eventId } = body ?? {};

  if (!receiverId || (!content && !imageUrl)) {
    return NextResponse.json(
      { success: false, error: "Missing content or image" },
      { status: 400 }
    );
  }

  if (receiverId === user.id) {
    return NextResponse.json(
      { success: false, error: "You cannot message yourself." },
      { status: 400 }
    );
  }

  // Trainers can only message clients who have already messaged them first
  if (user.role === "TRAINER") {
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true }
    });
    if (receiver?.role === "USER") {
      const clientReachedOut = await prisma.message.findFirst({
        where: {
          senderId: receiverId,
          receiverId: user.id
        }
      });
      if (!clientReachedOut) {
        return NextResponse.json(
          { success: false, error: "You can only reply to clients who have messaged you first." },
          { status: 403 }
        );
      }
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content: content || "",
      imageUrl: imageUrl || null,
      eventId
    }
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      message: "You received a new message.",
      relatedEventId: eventId,
      relatedUserId: user.id
    }
  });

  return NextResponse.json({ success: true, data: message });
}

