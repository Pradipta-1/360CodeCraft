import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Omit password hash for security
  const { passwordHash, ...safeUser } = user;

  return NextResponse.json({ success: true, data: safeUser });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { name, password, role, avatarUrl } = await req.json();
    
    const updateData: any = {};
    if (name) updateData.name = name;
    // Role transition logic
    if (role && role !== user.role) {
      await prisma.$transaction(async (tx) => {
        // TRAINER -> USER
        if (user.role === "TRAINER" && role === "USER") {
          // 1. Delete routines and plans created by this trainer
          await tx.routine.deleteMany({ where: { trainerId: user.id } });
          await tx.workoutPlan.deleteMany({ where: { trainerId: user.id } });
          await tx.routineRequest.deleteMany({ where: { trainerId: user.id } });

          // 2. Handle events organized by this trainer
          const organizedEvents = await tx.event.findMany({
            where: { organizerId: user.id },
            include: { trainerParticipants: { select: { id: true } } }
          });

          for (const event of organizedEvents) {
            const nextTrainer = event.trainerParticipants.find(t => t.id !== user.id);
            if (nextTrainer) {
              // Transfer ownership
              await tx.event.update({
                where: { id: event.id },
                data: {
                  organizerId: nextTrainer.id,
                  trainerParticipants: { disconnect: { id: nextTrainer.id } }
                }
              });
            } else {
              // No other trainer, delete event
              await tx.event.delete({ where: { id: event.id } });
            }
          }
        }

        // USER -> TRAINER (User to Trainer transition)
        if (user.role === "USER" && role === "TRAINER") {
          // 1. Delete routines and plans assigned to this user
          await tx.routine.deleteMany({ where: { userId: user.id } });
          await tx.workoutPlan.deleteMany({ where: { clientId: user.id } });
          await tx.routineRequest.deleteMany({ where: { userId: user.id } });
        }
      });
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
