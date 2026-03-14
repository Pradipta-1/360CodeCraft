"use client";

import UserShell from "@/components/UserShell";
import EventsView from "@/components/EventsView";

export default function UserEventsPage() {
  return (
    <UserShell>
      <div className="py-6">
        <EventsView role="USER" />
      </div>
    </UserShell>
  );
}
