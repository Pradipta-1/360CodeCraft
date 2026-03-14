import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "TRAINER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Only trainers can submit routines" }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, days } = body;

    if (!clientId || !days || !Array.isArray(days) || days.length !== 7) {
      return NextResponse.json({ success: false, error: "Invalid data. Must include clientId and 7 days of routines." }, { status: 400 });
    }

    // Wrap in transaction to ensure request is marked fulfilled when routine is created
    const result = await prisma.$transaction(async (tx) => {
      // Find the pending request
      const request = await tx.routineRequest.findUnique({
        where: {
          userId_trainerId: {
            userId: clientId,
            trainerId: user.id,
          }
        }
      });

      if (!request || request.status !== "PENDING") {
        throw new Error("No pending routine request from this client.");
      }

      // Mark request as FULFILLED
      await tx.routineRequest.update({
        where: { id: request.id },
        data: { status: "FULFILLED" }
      });

      // Create the Routine. Default isActive is false, until client explicitly sets it.
      const routine = await tx.routine.create({
        data: {
          trainerId: user.id,
          userId: clientId,
          isActive: false, 
          days: days, // the JSON payload
        }
      });

      return routine;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error creating routine:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    if (user.role === "USER") {
      const routines = await prisma.routine.findMany({
        where: { 
          userId: user.id, 
          ...(activeOnly ? { isActive: true } : {})
        },
        include: {
          trainer: {
            select: { id: true, name: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json({ success: true, data: routines });
    } else if (user.role === "TRAINER") {
      const routines = await prisma.routine.findMany({
        where: { trainerId: user.id },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json({ success: true, data: routines });
    } else {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 403 });
    }

  } catch (error: any) {
    console.error("Error fetching routines:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
