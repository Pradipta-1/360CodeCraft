import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const openToTrainers = searchParams.get("openToTrainers");

    const events = await prisma.event.findMany({
      where: {
        status: status ? (status as any) : "APPROVED",
        openToTrainers:
          openToTrainers != null ? openToTrainers === "true" : undefined
      },
      orderBy: { createdAt: "desc" },
      include: {
        organizer: {
          select: { id: true, name: true }
        },
        participants: {
          select: { id: true }
        },
        trainerParticipants: {
          select: { id: true }
        }
      }
    });

    // Map events to include participation status for the current user
    const formattedEvents = events.map(event => ({
      ...event,
      isParticipating: user ? (
        event.participants.some(p => p.id === user.id) || 
        event.trainerParticipants.some(p => p.id === user.id)
      ) : false
    }));

    return NextResponse.json({ success: true, data: formattedEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      sportType, 
      location, 
      startDate, 
      endDate, 
      timeRange, 
      participantLimit, 
      description 
    } = body;

    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        sportType,
        location,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        timeRange,
        participantLimit: parseInt(participantLimit),
        description,
        organizerId: user.id,
        status: "APPROVED", // Trainer/Organizer created events are approved by default
      }
    });

    // Create a system message to initialize the group
    await prisma.message.create({
      data: {
        senderId: user.id,
        eventId: event.id,
        content: "Event created. Welcome to the group!",
        isSystem: true,
      }
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 });
  }
}

