import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "TRAINER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    // Reactivate the routine
    const routine = await prisma.routine.update({
      where: { 
        id,
        trainerId: user.id 
      },
      data: {
        isActive: true,
        // @ts-ignore - Prisma type issue on this environment
        isArchived: false
      }
    });

    // Also ensure any other active routine for this client/trainer is archived
    // (Though usually only one exists, this maintains integrity)
    // @ts-ignore - Prisma type issue on this environment
    await prisma.routine.updateMany({
      where: {
        userId: routine.userId,
        trainerId: user.id,
        id: { not: id },
        isActive: true
      },
      data: {
        isActive: false,
        isArchived: true
      }
    });

    return NextResponse.json({ success: true, data: routine });
  } catch (error: any) {
    console.error("Error reactivating routine:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
