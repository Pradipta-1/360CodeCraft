import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hashPassword } from "@/lib/auth";
=======
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
>>>>>>> 5d42e963bfa63b64566e9c28def3bbfb2c57e985

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
<<<<<<< HEAD
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { name, password, role } = await req.json();
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.passwordHash = await hashPassword(password);
=======
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, password, role, avatarUrl } = await req.json();
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (role) updateData.role = role;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
>>>>>>> 5d42e963bfa63b64566e9c28def3bbfb2c57e985
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
<<<<<<< HEAD
      data: updateData,
=======
      data: updateData
>>>>>>> 5d42e963bfa63b64566e9c28def3bbfb2c57e985
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
<<<<<<< HEAD
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
=======
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 });
>>>>>>> 5d42e963bfa63b64566e9c28def3bbfb2c57e985
  }
}
