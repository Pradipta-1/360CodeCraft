import TrainerShell from "@/components/TrainerShell";

export default function TrainerEventsPage() {
  return (
    <TrainerShell>
      <div id="events" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Events</h1>
          <p className="card-subtitle">
            Event invitations, public events open to trainers, and confirmed events will be listed
            here.
          </p>
        </div>
      </div>
    </TrainerShell>
  );
}
