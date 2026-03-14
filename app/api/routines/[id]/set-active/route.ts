import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "USER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Only users can set active routines" }, { status: 403 });
    }

    const { id: routineId } = await params;

    // Verify the routine belongs to the user
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine || routine.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Routine not found or you do not have permission." }, { status: 404 });
    }

    // Wrap in transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // 1. Set all other routines for this user to inactive
      await tx.routine.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });

      // 2. Set this routine to active
      await tx.routine.update({
        where: { id: routineId },
        data: { isActive: true },
      });
    });

    return NextResponse.json({ success: true, message: "Routine set to active" });
  } catch (error: any) {
    console.error("Error setting routine to active:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
