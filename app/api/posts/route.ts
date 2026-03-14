import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content, imageUrl } = await req.json();

    if (!content && !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Post content or image is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
