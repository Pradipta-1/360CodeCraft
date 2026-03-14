"use client";

import OrganizerShell from "@/components/OrganizerShell";
import EventsView from "@/components/EventsView";

export default function OrganizerEventsPage() {
  return (
    <OrganizerShell>
      <div className="py-6">
        <EventsView role="ORGANIZER" />
      </div>
    </OrganizerShell>
  );
}
