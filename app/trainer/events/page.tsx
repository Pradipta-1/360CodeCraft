"use client";

import TrainerShell from "@/components/TrainerShell";
import EventsView from "@/components/EventsView";

export default function TrainerEventsPage() {
  return (
    <TrainerShell>
      <div className="py-6">
        <EventsView role="TRAINER" />
      </div>
    </TrainerShell>
  );
}
