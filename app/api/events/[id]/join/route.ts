import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { participants: true }
  });

  if (!event || event.status !== "APPROVED") {
    return NextResponse.json(
      { success: false, error: "Event not joinable" },
      { status: 400 }
    );
  }

  if (event.participants.some((p: { id: string }) => p.id === user.id)) {
    return NextResponse.json({ success: true, data: event });
  }

  if (event.participants.length >= event.participantLimit) {
    return NextResponse.json(
      { success: false, error: "Event is full" },
      { status: 400 }
    );
  }

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: {
      participants: {
        connect: { id: user.id }
      }
    }
  });

  return NextResponse.json({ success: true, data: updated });
}

