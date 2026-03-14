import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    include: {
      organizer: { select: { id: true, name: true } },
      participants: { select: { id: true, name: true } },
      trainerParticipants: { select: { id: true, name: true } }
    }
  });

  if (!event) {
    return NextResponse.json(
      { success: false, error: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: event });
}
