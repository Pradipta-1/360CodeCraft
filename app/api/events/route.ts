import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const openToTrainers = searchParams.get("openToTrainers");

  const events = await prisma.event.findMany({
    where: {
      status: status ? (status as any) : "APPROVED",
      openToTrainers:
        openToTrainers != null ? openToTrainers === "true" : undefined
    },
    orderBy: { date: "asc" },
    include: {
      organizer: {
        select: { id: true, name: true }
      }
    }
  });

  return NextResponse.json({ success: true, data: events });
}

